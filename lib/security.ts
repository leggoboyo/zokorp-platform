const MAX_UPLOAD_MB_FALLBACK = 10;

export const ALLOWED_UPLOAD_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

export const ALLOWED_UPLOAD_EXTENSIONS = new Set([".pdf", ".xlsx"]);

const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46, 0x2d];
const ZIP_MAGIC = [0x50, 0x4b, 0x03, 0x04];
type SupportedUploadKind = "pdf" | "xlsx";

export function parseAdminEmails(raw: string | undefined): Set<string> {
  if (!raw) {
    return new Set();
  }

  return new Set(
    raw
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

function startsWithBytes(buffer: Buffer, bytes: number[]) {
  if (buffer.length < bytes.length) {
    return false;
  }

  return bytes.every((byte, index) => buffer[index] === byte);
}

function detectByMagic(buffer: Buffer): SupportedUploadKind | null {
  if (startsWithBytes(buffer, PDF_MAGIC)) {
    return "pdf";
  }

  if (startsWithBytes(buffer, ZIP_MAGIC)) {
    return "xlsx";
  }

  return null;
}

function detectByExtension(filename: string): SupportedUploadKind | null {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".pdf")) {
    return "pdf";
  }

  if (lower.endsWith(".xlsx")) {
    return "xlsx";
  }

  return null;
}

function detectByMime(mimeType: string): SupportedUploadKind | null {
  if (mimeType === "application/pdf") {
    return "pdf";
  }

  if (mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
    return "xlsx";
  }

  return null;
}

export function isAllowedFileType(filename: string, mimeType: string, buffer?: Buffer): boolean {
  const extensionAllowed = [...ALLOWED_UPLOAD_EXTENSIONS].some((ext) =>
    filename.toLowerCase().endsWith(ext),
  );
  const mimeAllowed = ALLOWED_UPLOAD_MIME_TYPES.has(mimeType);

  if (!extensionAllowed && !mimeAllowed) {
    return false;
  }

  if (!buffer) {
    return true;
  }

  const byMagic = detectByMagic(buffer);
  if (!byMagic) {
    return false;
  }

  const byExtension = detectByExtension(filename);
  const byMime = detectByMime(mimeType);

  return byMagic === byExtension || byMagic === byMime;
}

export function maxUploadBytes(maxUploadMb?: number): number {
  const mb = maxUploadMb && maxUploadMb > 0 ? maxUploadMb : MAX_UPLOAD_MB_FALLBACK;
  return mb * 1024 * 1024;
}
