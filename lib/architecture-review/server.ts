import { createWorker } from "tesseract.js";
import { extractSvgLabelText, parseSvgDimensions, validateSvgMarkup } from "@/lib/architecture-review/svg-safety";

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

function decodeSvg(bytes: Uint8Array) {
  return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
}

export function isSafeSvgBytes(bytes: Uint8Array) {
  return validateSvgMarkup(decodeSvg(bytes)).ok;
}

export function extractSvgEvidenceFromBytes(bytes: Uint8Array) {
  const rawSvg = decodeSvg(bytes);
  const validation = validateSvgMarkup(rawSvg);
  if (!validation.ok) {
    throw new Error("INVALID_SVG_FILE");
  }

  return {
    text: extractSvgLabelText(rawSvg),
    dimensions: parseSvgDimensions(rawSvg),
  };
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
