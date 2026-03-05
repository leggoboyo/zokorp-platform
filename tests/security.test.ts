import { describe, expect, it } from "vitest";

import { isAllowedFileType, isBusinessEmail, maxUploadBytes, parseAdminEmails } from "@/lib/security";

describe("security helpers", () => {
  it("parses comma-separated admin emails", () => {
    const emails = parseAdminEmails("admin@zokorp.com, owner@zokorp.com  , ");

    expect(emails.has("admin@zokorp.com")).toBe(true);
    expect(emails.has("owner@zokorp.com")).toBe(true);
    expect(emails.size).toBe(2);
  });

  it("validates upload type by extension/MIME and magic bytes", () => {
    const pdfBuffer = Buffer.from("%PDF-1.7 sample");
    const xlsxBuffer = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00]);
    const badBuffer = Buffer.from("not a document");

    expect(isAllowedFileType("doc.pdf", "application/pdf", pdfBuffer)).toBe(true);
    expect(
      isAllowedFileType(
        "sheet.xlsx",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        xlsxBuffer,
      ),
    ).toBe(true);
    expect(isAllowedFileType("sheet.xlsx", "application/octet-stream", xlsxBuffer)).toBe(true);
    expect(isAllowedFileType("legacy.xls", "application/vnd.ms-excel", xlsxBuffer)).toBe(false);
    expect(isAllowedFileType("sheet.xlsx", "application/octet-stream", badBuffer)).toBe(false);
    expect(isAllowedFileType("script.exe", "application/octet-stream", badBuffer)).toBe(false);
  });

  it("returns byte limits from configured MB", () => {
    expect(maxUploadBytes(1)).toBe(1024 * 1024);
    expect(maxUploadBytes(undefined)).toBe(10 * 1024 * 1024);
  });

  it("accepts business domains and blocks common personal domains", () => {
    expect(isBusinessEmail("architect@zokorp.com")).toBe(true);
    expect(isBusinessEmail("someone@gmail.com")).toBe(false);
    expect(isBusinessEmail("someone@outlook.com")).toBe(false);
  });
});
