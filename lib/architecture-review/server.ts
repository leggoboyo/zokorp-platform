import { extractSvgLabelText, parseSvgDimensions, validateSvgMarkup } from "@/lib/architecture-review/svg-safety";

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
