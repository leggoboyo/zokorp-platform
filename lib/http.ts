const DEFAULT_FETCH_TIMEOUT_MS = 12_000;

export class FetchTimeoutError extends Error {
  readonly timeoutMs: number;

  constructor(timeoutMs: number) {
    super(`Fetch timed out after ${timeoutMs}ms`);
    this.name = "FetchTimeoutError";
    this.timeoutMs = timeoutMs;
  }
}

export async function fetchWithTimeout(
  input: string | URL | Request,
  init: RequestInit = {},
  timeoutMs = DEFAULT_FETCH_TIMEOUT_MS,
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(new FetchTimeoutError(timeoutMs)), timeoutMs);

  try {
    const mergedSignal = init.signal;
    if (!mergedSignal) {
      return await fetch(input, {
        ...init,
        signal: controller.signal,
      });
    }

    if (mergedSignal.aborted) {
      throw mergedSignal.reason;
    }

    const abortListener = () => controller.abort(mergedSignal.reason);
    mergedSignal.addEventListener("abort", abortListener, { once: true });

    try {
      return await fetch(input, {
        ...init,
        signal: controller.signal,
      });
    } finally {
      mergedSignal.removeEventListener("abort", abortListener);
    }
  } catch (error) {
    if (error instanceof FetchTimeoutError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new FetchTimeoutError(timeoutMs);
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export function readResponseBodySnippet(input: string, maxChars = 500) {
  return input.replace(/\s+/g, " ").trim().slice(0, maxChars);
}
