import { createWorker } from 'tesseract.js';

export interface OCRProgress {
  status: string;
  progress: number;
}

export async function performClientSideOCR(
  imageFile: File | Blob,
  onProgress?: (progress: OCRProgress) => void
): Promise<string> {
  let worker;
  try {
    if (onProgress) {
      onProgress({ status: 'Initializing client-side OCR engine...', progress: 0.1 });
    }

    worker = await createWorker('eng', 1, {
      workerPath: '/ocr/worker.min.js',
      corePath: '/ocr/tesseract-core-lstm.wasm.js',
      langPath: '/ocr/lang-data',
      cacheMethod: 'none',
      logger: (m) => {
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

    if (onProgress) {
      onProgress({ status: 'Processing document image...', progress: 0.3 });
    }

    const ret = await worker.recognize(imageFile);
    await worker.terminate();

    if (onProgress) {
      onProgress({ status: 'OCR Complete!', progress: 1.0 });
    }

    return ret.data.text;
  } catch (error) {
    if (worker) {
      try {
        await worker.terminate();
      } catch (e) {
        // Ignore worker cleanup error
      }
    }
    throw new Error(error instanceof Error ? error.message : 'OCR Recognition failed.');
  }
}
