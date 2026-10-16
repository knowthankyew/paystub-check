import { createWorker } from 'tesseract.js';

export interface OCRProgress {
  status: string;
  progress: number;
}

const activeWorkers = new Set<any>();
let burnGeneration = 0;

export async function terminateOcrWorker(): Promise<void> {
  burnGeneration++;
  const workersToTerminate = Array.from(activeWorkers);
  activeWorkers.clear();
  await Promise.allSettled(
    workersToTerminate.map(async (worker) => {
      try {
        await worker.terminate();
      } catch {
        // Ignore worker cleanup error
      }
    })
  );
}

export async function performClientSideOCR(
  imageFile: File | Blob,
  onProgress?: (progress: OCRProgress) => void
): Promise<string> {
  const initialGeneration = burnGeneration;
  let worker: any = null;
  try {
    if (onProgress) {
      onProgress({ status: 'Initializing client-side OCR engine...', progress: 0.1 });
    }

    worker = await createWorker('eng', 1, {
      workerPath: '/ocr/worker.min.js',
      corePath: '/ocr/tesseract-core-lstm.wasm.js',
      langPath: '/ocr/lang-data',
      cacheMethod: 'none',
      logger: (m: any) => {
        if (onProgress && m.status) {
          let p = 0.2;
          if (m.status === 'recognizing text') {
            p = 0.2 + (m.progress || 0) * 0.75;
          }
          onProgress({
            status: `${m.status.charAt(0).toUpperCase() + m.status.slice(1)}...`,
            progress: Math.min(0.99, p)
          });
        }
      }
    });

    if (burnGeneration !== initialGeneration) {
      try {
        await worker.terminate();
      } catch {}
      throw new Error('OCR operation aborted due to memory purge.');
    }

    activeWorkers.add(worker);

    if (onProgress) {
      onProgress({ status: 'Processing document image...', progress: 0.3 });
    }

    const ret = await worker.recognize(imageFile);

    if (burnGeneration !== initialGeneration) {
      activeWorkers.delete(worker);
      try {
        await worker.terminate();
      } catch {}
      throw new Error('OCR operation aborted due to memory purge.');
    }

    activeWorkers.delete(worker);
    await worker.terminate();

    if (onProgress) {
      onProgress({ status: 'OCR Complete!', progress: 1.0 });
    }

    return ret.data.text;
  } catch (error) {
    if (worker) {
      activeWorkers.delete(worker);
      try {
        await worker.terminate();
      } catch {
        // Ignore worker cleanup error
      }
    }
    throw new Error(error instanceof Error ? error.message : 'OCR Recognition failed.');
  }
}
