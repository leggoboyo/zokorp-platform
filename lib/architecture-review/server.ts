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

function decodeSvg(bytes: Uint8Array) {
  return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
}

function parseSvgLabelText(rawSvg: string) {
  const textFragments: string[] = [];
  const regex = /<(?:text|title|desc)\b[^>]*>([\s\S]*?)<\/(?:text|title|desc)>/gi;
  let match: RegExpExecArray | null = null;

  while ((match = regex.exec(rawSvg)) !== null) {
    const value = match[1]?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (value) {
      textFragments.push(value);
    }
  }

  return textFragments.join(" ").replace(/\s+/g, " ").trim();
}

function parseSvgSizeAttribute(value: string | null) {
  if (!value) {
    return null;
  }

  const numeric = Number.parseFloat(value.replace(/px$/i, "").trim());
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return null;
  }

  return numeric;
}

function parseSvgDimensions(rawSvg: string) {
  const sizeMatch = rawSvg.match(/<svg\b[^>]*\bwidth\s*=\s*["']([^"']+)["'][^>]*\bheight\s*=\s*["']([^"']+)["']/i);
  if (sizeMatch?.[1] && sizeMatch?.[2]) {
    const width = parseSvgSizeAttribute(sizeMatch[1]);
    const height = parseSvgSizeAttribute(sizeMatch[2]);
    if (width && height) {
      return { width, height };
    }
  }

  const viewBoxMatch = rawSvg.match(/viewBox\s*=\s*["']([^"']+)["']/i);
  if (viewBoxMatch?.[1]) {
    const values = viewBoxMatch[1]
      .split(/[\s,]+/)
      .map((value) => Number.parseFloat(value))
      .filter((value) => Number.isFinite(value));
    if (values.length === 4 && values[2] > 0 && values[3] > 0) {
      return { width: values[2], height: values[3] };
    }
  }

  return null;
}

export function isSafeSvgBytes(bytes: Uint8Array) {
  const decoded = decodeSvg(bytes).trim();
  if (!/<svg\b/i.test(decoded)) {
    return false;
  }

  if (/<script\b/i.test(decoded)) {
    return false;
  }

  if (/\son[a-z]+\s*=/i.test(decoded)) {
    return false;
  }

  if (/javascript:/i.test(decoded)) {
    return false;
  }

  if (/<foreignObject\b/i.test(decoded)) {
    return false;
  }

  return true;
}

export function extractSvgEvidenceFromBytes(bytes: Uint8Array) {
  if (!isSafeSvgBytes(bytes)) {
    throw new Error("INVALID_SVG_FILE");
  }

  const rawSvg = decodeSvg(bytes);
  return {
    text: parseSvgLabelText(rawSvg),
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