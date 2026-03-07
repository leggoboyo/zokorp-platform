export const MAX_SAFE_SVG_DIMENSION = 12_000;
export const MAX_SAFE_SVG_AREA = 72_000_000;

type SvgDimensions = {
  width: number;
  height: number;
};

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

function isForbiddenProtocolReference(value: string) {
  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return false;
  }

  if (normalized.startsWith("//")) {
    return true;
  }

  if (normalized.startsWith("data:")) {
    return true;
  }

  if (/^[a-z][a-z0-9+.-]*:/i.test(normalized)) {
    return true;
  }

  return false;
}

export function parseSvgDimensions(rawSvg: string): SvgDimensions | null {
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

export function extractSvgLabelText(rawSvg: string) {
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

export function validateSvgMarkup(rawSvg: string) {
  const normalized = rawSvg.trim();
  if (!/<svg\b/i.test(normalized)) {
    return {
      ok: false,
      error: "Invalid SVG payload.",
    } as const;
  }

  if (/<script\b/i.test(normalized)) {
    return {
      ok: false,
      error: "SVG with script tags is not allowed.",
    } as const;
  }

  if (/\son[a-z]+\s*=/i.test(normalized)) {
    return {
      ok: false,
      error: "SVG with inline event handlers is not allowed.",
    } as const;
  }

  if (/javascript:/i.test(normalized)) {
    return {
      ok: false,
      error: "SVG with javascript: links is not allowed.",
    } as const;
  }

  if (/<foreignObject\b/i.test(normalized)) {
    return {
      ok: false,
      error: "SVG with foreignObject is not allowed.",
    } as const;
  }

  const hrefRegex = /\b(?:href|xlink:href)\s*=\s*["']([^"']+)["']/gi;
  let hrefMatch: RegExpExecArray | null = null;
  while ((hrefMatch = hrefRegex.exec(normalized)) !== null) {
    const value = hrefMatch[1] ?? "";
    if (isForbiddenProtocolReference(value)) {
      return {
        ok: false,
        error: "SVG with external or data URI references is not allowed.",
      } as const;
    }
  }

  if (/@import\s+url\s*\(/i.test(normalized)) {
    return {
      ok: false,
      error: "SVG with external style imports is not allowed.",
    } as const;
  }

  const urlFunctionRegex = /url\(\s*(['"]?)(.*?)\1\s*\)/gi;
  let urlMatch: RegExpExecArray | null = null;
  while ((urlMatch = urlFunctionRegex.exec(normalized)) !== null) {
    const target = (urlMatch[2] ?? "").trim();
    if (!target || target.startsWith("#")) {
      continue;
    }

    if (isForbiddenProtocolReference(target)) {
      return {
        ok: false,
        error: "SVG with external URL references is not allowed.",
      } as const;
    }
  }

  const dimensions = parseSvgDimensions(normalized);
  if (dimensions) {
    if (dimensions.width > MAX_SAFE_SVG_DIMENSION || dimensions.height > MAX_SAFE_SVG_DIMENSION) {
      return {
        ok: false,
        error: "SVG dimensions are too large.",
      } as const;
    }

    if (dimensions.width * dimensions.height > MAX_SAFE_SVG_AREA) {
      return {
        ok: false,
        error: "SVG area is too large.",
      } as const;
    }
  }

  return {
    ok: true,
  } as const;
}
