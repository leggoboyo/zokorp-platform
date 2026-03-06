import { createWorker } from "tesseract.js";

const OCR_TIMEOUT_MS = 90 * 1000;

class OcrTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`Architecture review OCR timed out after ${timeoutMs}ms`);
  }
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new OcrTimeoutError(timeoutMs)), timeoutMs);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

export async function extractOcrTextFromPng(buffer: Buffer) {
  const worker = await createWorker("eng");

  try {
    const result = await withTimeout(worker.recognize(buffer), OCR_TIMEOUT_MS);
    return (result.data.text || "").replace(/\s+/g, " ").trim();
  } finally {
    await worker.terminate();
  }
}

export function isOcrTimeoutError(error: unknown): error is OcrTimeoutError {
  return error instanceof OcrTimeoutError;
}
