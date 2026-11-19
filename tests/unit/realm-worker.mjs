import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Worker } from 'node:worker_threads';
import { rolldown } from 'rolldown';

const HERE = dirname(fileURLToPath(import.meta.url));
const TELEMETRY_ENTRY = resolve(HERE, '../../src/legal/telemetry.ts');
let telemetryBundlePromise = null;
let handoffBundlePromise = null;

async function getTelemetryBundleCode() {
  if (!telemetryBundlePromise) {
    telemetryBundlePromise = (async () => {
      const bundle = await rolldown({ input: TELEMETRY_ENTRY });
      try {
        const generated = await bundle.generate({ format: 'es', codeSplitting: false });
        return generated.output[0].code;
      } finally {
        await bundle.close();
      }
    })();
  }
  return telemetryBundlePromise;
}

async function getHandoffBundleCode() {
  if (!handoffBundlePromise) {
    handoffBundlePromise = (async () => {
      const virtualEntry = 'virtual:paystub-handoff-realm-entry';
      const resolvedEntry = '\0paystub-handoff-realm-entry';
      const resolvedMockReact = '\0paystub-mock-react';
      const resolvedMockReactJsx = '\0paystub-mock-react-jsx';
      const bundle = await rolldown({
        input: virtualEntry,
        plugins: [
          {
            name: 'paystub-handoff-worker-plugin',
            resolveId(id) {
              if (id === virtualEntry) return resolvedEntry;
              if (id === 'react') return resolvedMockReact;
              if (id === 'react/jsx-runtime' || id === 'react/jsx-dev-runtime') {
                return resolvedMockReactJsx;
              }
              return null;
            },
            load(id) {
              if (id === resolvedEntry) {
                return [
                  `export { TelemetryManager, KTY_HANDOFF_SESSION_KEY, validateHandoffPayload } from '@knowthankyew/privacy-telemetry';`,
                  `export { useKTYHandoff } from '@knowthankyew/privacy-telemetry/react';`,
                ].join('\n');
              }
              if (id === resolvedMockReact) {
                return [
                  'export const useState = (...args) => globalThis.__ktyReactMock.useState(...args);',
                  'export const useCallback = (...args) => globalThis.__ktyReactMock.useCallback(...args);',
                  'export const useEffect = (...args) => globalThis.__ktyReactMock.useEffect(...args);',
                ].join('\n');
              }
              if (id === resolvedMockReactJsx) {
                return [
                  "export const Fragment = Symbol.for('react.fragment');",
                  'export const jsx = () => null;',
                  'export const jsxs = () => null;',
                  'export const jsxDEV = () => null;',
                ].join('\n');
              }
              return null;
            },
          },
        ],
      });
      try {
        const generated = await bundle.generate({ format: 'es', codeSplitting: false });
        return generated.output[0].code;
      } finally {
        await bundle.close();
      }
    })();
  }
  return handoffBundlePromise;
}

async function runWorker(workerSource, workerData) {
  const outcome = await new Promise((resolvePromise, rejectPromise) => {
    const worker = new Worker(workerSource, {
      eval: true,
      workerData,
    });
    let settled = false;
    worker.once('message', (msg) => {
      settled = true;
      void worker.terminate().finally(() => resolvePromise(msg));
    });
    worker.once('error', (err) => {
      if (!settled) {
        settled = true;
        void worker.terminate().finally(() => rejectPromise(err));
      }
    });
    worker.once('exit', (code) => {
      if (!settled) {
        settled = true;
        rejectPromise(new Error(`Realm worker exited unexpectedly with code ${code}`));
      }
    });
  });

  if (!outcome.ok) {
    throw new Error(outcome.error || 'Isolated realm test failed');
  }
}

export async function runTelemetryInFreshRealm(scenarioBody) {
  const bundleCode = await getTelemetryBundleCode();
  const workerSource = `
const { parentPort, workerData } = require('node:worker_threads');
const assert = require('node:assert/strict');
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

(async () => {
  try {
    const mod = await import('data:text/javascript;base64,' + Buffer.from(workerData.bundleCode, 'utf8').toString('base64'));
    const fn = new AsyncFunction('telemetryMod', 'assert', workerData.scenarioBody);
    await fn(mod, assert);
    parentPort.postMessage({ ok: true });
  } catch (err) {
    parentPort.postMessage({ ok: false, error: err && err.stack ? err.stack : String(err) });
  }
})();
`;
  await runWorker(workerSource, { bundleCode, scenarioBody });
}

export async function runHandoffBurnInFreshRealm(burnMode, payloadJson) {
  const bundleCode = await getHandoffBundleCode();
  const workerSource = `
const { parentPort, workerData } = require('node:worker_threads');
const assert = require('node:assert/strict');

function createReactHarness() {
  const states = [];
  let stateIndex = 0;
  let pendingEffects = [];
  const cleanups = [];

  const harness = {
    renderHook(hookFn) {
      stateIndex = 0;
      pendingEffects = [];
      let result = hookFn();
      if (pendingEffects.length > 0) {
        const effects = pendingEffects;
        pendingEffects = [];
        for (const eff of effects) {
          const cleanup = eff();
          if (typeof cleanup === 'function') cleanups.push(cleanup);
        }
        stateIndex = 0;
        result = hookFn();
      }
      return result;
    },
    useState(initial) {
      const idx = stateIndex++;
      if (!(idx in states)) {
        states[idx] = typeof initial === 'function' ? initial() : initial;
      }
      const setState = (next) => {
        const prev = states[idx];
        states[idx] = typeof next === 'function' ? next(prev) : next;
      };
      return [states[idx], setState];
    },
    useEffect(fn) {
      pendingEffects.push(fn);
    },
    useCallback(fn) {
      return fn;
    },
  };
  globalThis.__ktyReactMock = harness;
  return harness;
}

(async () => {
  try {
    const reactHarness = createReactHarness();
    const store = new Map();
    const listeners = new Map();

    globalThis.sessionStorage = {
      getItem: (k) => store.get(k) ?? null,
      setItem: (k, v) => { store.set(k, v); },
      removeItem: (k) => { store.delete(k); },
    };
    globalThis.window = {
      location: { origin: 'https://app.knowthankyew.org', search: '?kty_handoff=1', pathname: '/' },
      addEventListener: (type, cb) => {
        if (!listeners.has(type)) listeners.set(type, new Set());
        listeners.get(type).add(cb);
      },
      removeEventListener: (type, cb) => {
        listeners.get(type)?.delete(cb);
      },
      history: { replaceState: () => {} },
    };

    const {
      TelemetryManager,
      KTY_HANDOFF_SESSION_KEY,
      validateHandoffPayload,
      useKTYHandoff,
    } = await import('data:text/javascript;base64,' + Buffer.from(workerData.bundleCode, 'utf8').toString('base64'));

    const initial = reactHarness.renderHook(() => useKTYHandoff('paystub-check'));
    assert.equal(initial.isHandoffActive, false);

    const telemetry = new TelemetryManager({ serviceName: 'paystub-check', burnEnabled: true });
    const queuedPayload = JSON.parse(workerData.payloadJson);
    assert.equal(validateHandoffPayload(queuedPayload), true);

    if (workerData.burnMode === 'manager_burn') {
      telemetry.burn();
    } else {
      for (const handler of listeners.get('message') ?? []) {
        handler({
          origin: 'https://app.knowthankyew.org',
          source: globalThis.window,
          data: { type: 'KTY_HARD_BURN_DOM' },
        });
      }
    }

    for (const handler of listeners.get('message') ?? []) {
      handler({
        origin: 'https://app.knowthankyew.org',
        source: globalThis.window,
        data: { type: 'KTY_HANDOFF_PAYLOAD', payload: queuedPayload },
      });
    }

    const afterBurn = reactHarness.renderHook(() => useKTYHandoff('paystub-check'));
    assert.equal(afterBurn.isHandoffActive, false);
    assert.equal(afterBurn.payload, null);
    assert.equal(store.has(KTY_HANDOFF_SESSION_KEY), false);

    parentPort.postMessage({ ok: true });
  } catch (err) {
    parentPort.postMessage({ ok: false, error: err && err.stack ? err.stack : String(err) });
  }
})();
`;
  await runWorker(workerSource, { bundleCode, burnMode, payloadJson });
}
