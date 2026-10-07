import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

function resolvePlaywright(repoRoot) {
  const candidates = [
    'playwright',
    '@playwright/test',
    'playwright-core',
    path.resolve(repoRoot, '../node_modules/playwright'),
    path.resolve(repoRoot, '../node_modules/@playwright/test'),
    path.resolve(repoRoot, '../node_modules/playwright-core'),
  ];
  for (const c of candidates) {
    try {
      const mod = require(c);
      if (mod.chromium) return mod.chromium;
    } catch {}
  }
  throw new Error('Playwright not found in repo or portfolio root. Run npm install at repo or portfolio root.');
}

function resolveFfmpeg(repoRoot) {
  if (process.env.FFMPEG_PATH && fs.existsSync(process.env.FFMPEG_PATH)) {
    return process.env.FFMPEG_PATH;
  }
  try {
    const sys = execSync('which ffmpeg', { encoding: 'utf8' }).trim();
    if (sys && fs.existsSync(sys)) return sys;
  } catch {}

  const standardPaths = [
    '/opt/homebrew/bin/ffmpeg',
    '/usr/local/bin/ffmpeg',
    path.resolve(repoRoot, '../node_modules/ffmpeg-static/ffmpeg'),
    path.resolve(repoRoot, 'node_modules/ffmpeg-static/ffmpeg'),
  ];
  for (const p of standardPaths) {
    if (fs.existsSync(p)) return p;
  }

  try {
    const ffmpegStatic = require('ffmpeg-static');
    if (ffmpegStatic && fs.existsSync(ffmpegStatic)) return ffmpegStatic;
  } catch {}

  const cacheDir = path.join(os.homedir(), 'Library/Caches/ms-playwright');
  if (fs.existsSync(cacheDir)) {
    for (const entry of fs.readdirSync(cacheDir)) {
      if (entry.startsWith('ffmpeg-')) {
        const bin = path.join(cacheDir, entry, 'ffmpeg-mac');
        if (fs.existsSync(bin)) return bin;
      }
    }
  }
  return null;
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(async () => {
  const repoRoot = path.resolve(__dirname, '..');
  const chromium = resolvePlaywright(repoRoot);
  const tempVideoDir = path.join(repoRoot, '.temp_demo_videos');
  if (!fs.existsSync(tempVideoDir)) fs.mkdirSync(tempVideoDir, { recursive: true });

  const destMp4 = path.join(repoRoot, 'demo.mp4');
  const destGif = path.join(repoRoot, 'demo.gif');

  const activeUrl = 'http://127.0.0.1:3000';

  console.log(`🎬 Launching Playwright browser for PaystubCheck demo against ${activeUrl}...`);

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--window-size=1366,860'],
  });

  const context = await browser.newContext({
    viewport: { width: 1366, height: 860 },
    recordVideo: {
      dir: tempVideoDir,
      size: { width: 1366, height: 860 },
    },
  });

  const page = await context.newPage();

  console.log(`Step 1: Navigating to PaystubCheck UI (${activeUrl})...`);
  await page.goto(activeUrl, { waitUntil: 'networkidle' });
  await sleep(1500);

  console.log('Step 2: Showcasing Privacy Badge...');
  const privacyPill = await page.$('button[title*="telemetry"]');
  if (privacyPill) {
    await privacyPill.hover();
  }
  await sleep(1000);

  console.log('Step 3: Hovering and selecting Salaried Misclassification Sample Preset...');
  await page.hover('.relative.group');
  await sleep(800);
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const salaryBtn = btns.find(b => b.textContent && b.textContent.includes('Salaried Misclassification'));
    if (salaryBtn) salaryBtn.click();
  });
  await sleep(1200);

  console.log('Step 4: Running FLSA Wage & Hour Reality Check...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const analyzeBtn = btns.find(b => b.textContent && b.textContent.includes('Analyze Pay Stub'));
    if (analyzeBtn) analyzeBtn.click();
  });
  await sleep(1500);

  console.log('Step 5: Inspecting Compliance Score & FLSA Exemption Badges...');
  await page.evaluate(() => window.scrollBy({ top: 250, behavior: 'smooth' }));
  await sleep(2000);

  console.log('Step 6: Switching to Red Flags Tab to inspect 29 U.S.C. § 213(a)(1) Exemption Threshold...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const rfBtn = btns.find(b => b.textContent && b.textContent.includes('Red Flags'));
    if (rfBtn) rfBtn.click();
  });
  await sleep(1500);
  await page.evaluate(() => window.scrollBy({ top: 200, behavior: 'smooth' }));
  await sleep(2000);

  console.log('Step 7: Changing Jurisdiction to Massachusetts (MA)...');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await sleep(600);
  await page.evaluate(() => {
    const selects = Array.from(document.querySelectorAll('select'));
    const stateSelect = selects.find(s => s.options && Array.from(s.options).some(o => o.value === 'MA'));
    if (stateSelect) {
      stateSelect.value = 'MA';
      stateSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await sleep(1200);

  console.log('Step 8: Inspecting Massachusetts Mandatory Treble Damages (M.G.L. c. 149 § 148)...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const maBtn = btns.find(b => b.textContent && b.textContent.includes('Massachusetts Wage Laws'));
    if (maBtn) maBtn.click();
  });
  await sleep(1800);
  await page.evaluate(() => window.scrollBy({ top: 250, behavior: 'smooth' }));
  await sleep(2000);

  console.log('Step 9: Generating Statutory Wage Claim Demand Letter...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const demandBtn = btns.find(b => b.textContent && b.textContent.includes('Draft Demand Letter'));
    if (demandBtn) demandBtn.click();
  });
  await sleep(1200);

  const inputs = await page.locator('input[type="text"]');
  if (await inputs.count() >= 3) {
    await inputs.nth(0).fill('Alex Rivera');
    await sleep(300);
    await inputs.nth(1).fill('742 Evergreen Terr, Boston, MA 02108');
    await sleep(300);
    await inputs.nth(2).fill('alex.rivera@example.com');
    await sleep(300);
  }

  await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
  await sleep(2000);

  console.log('Step 10: Copying Demand Notice to Clipboard...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const copyBtn = btns.find(b => b.textContent && b.textContent.includes('Copy Letter'));
    if (copyBtn) copyBtn.click();
  });
  await sleep(1500);

  console.log('Step 11: Exporting Full Analysis Report...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const exportBtn = btns.find(b => b.textContent && b.textContent.includes('Export Report'));
    if (exportBtn) exportBtn.click();
  });
  await sleep(2000);

  console.log('Closing browser context to finalize video recording...');
  const video = page.video();
  await page.close();
  await context.close();
  await browser.close();

  let latestVideo = null;
  if (video) {
    try {
      latestVideo = await video.path();
    } catch (e) {
      console.warn('video.path() wait failed:', e.message);
    }
  }
  if (!latestVideo || !fs.existsSync(latestVideo) || fs.statSync(latestVideo).size === 0) {
    const videoFiles = fs.readdirSync(tempVideoDir).filter((f) => f.endsWith('.webm'));
    if (videoFiles.length === 0) {
      console.error('❌ Error: No recorded WebM video found in temp folder.');
      return;
    }
    latestVideo = path.join(tempVideoDir, videoFiles[videoFiles.length - 1]);
  }

  const ffmpegPath = resolveFfmpeg(repoRoot);


  if (ffmpegPath) {
    try {
      console.log(`🎬 Transcoding recording to web-standard MP4 via ${ffmpegPath}...`);
      execSync(`"${ffmpegPath}" -y -i "${latestVideo}" -c:v libx264 -pix_fmt yuv420p -movflags +faststart "${destMp4}"`, { stdio: 'inherit' });
      const stats = fs.statSync(destMp4);
      console.log(`✓ Demo MP4 generated: ${destMp4} (${(stats.size / (1024 * 1024)).toFixed(2)} MB)`);

      console.log('🎬 Transcoding animated preview GIF for GitHub README...');
      execSync(`"${ffmpegPath}" -y -i "${destMp4}" -vf "fps=10,scale=800:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer" "${destGif}"`, { stdio: 'inherit' });
      const gifStats = fs.statSync(destGif);
      console.log(`✓ Demo GIF generated: ${destGif} (${(gifStats.size / (1024 * 1024)).toFixed(2)} MB)`);
    } catch (err) {
      console.warn('⚠️ FFmpeg conversion warning, keeping WebM:', err.message);
      fs.copyFileSync(latestVideo, destMp4);
    }
  } else {
    console.warn('⚠️ FFmpeg binary not found. Retaining raw WebM as demo.mp4.');
    fs.copyFileSync(latestVideo, destMp4);
  }

  // Clean up temp dir
  fs.rmSync(tempVideoDir, { recursive: true, force: true });
  console.log('✨ Demo video recording complete!');
})();
