import ExcelJS from "exceljs";
import { describe, expect, it } from "vitest";

import { reviewChecklistWorkbook } from "@/lib/validator-control-review";

describe("validator control review", () => {
  it("produces control-by-control calibration and downloadable edit guide", async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Checklist");

    sheet.addRow(["Control ID", "Requirement", "Partner Response"]);
    sheet.addRow([
      "C-001",
      "Define in-scope and out-of-scope boundaries.",
      "Scope includes prod and staging. Owner: platform team. Evidence: https://docs.example.com/ftr/1. Updated 2026-03-02. 95% control coverage.",
    ]);
    sheet.addRow(["C-002", "Document risk register with owner and mitigation.", "Risk register exists."]);
    sheet.addRow(["C-003", "Provide incident process and evidence references.", ""]);

    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());

    const result = await reviewChecklistWorkbook({
      buffer,
      filename: "sample-checklist.xlsx",
      profile: "FTR",
      target: {
        id: "ftr:sample",
        label: "Sample FTR",
        track: "ftr",
      },
    });

    expect(result.controlCalibration.totalControls).toBeGreaterThanOrEqual(3);
    expect(result.controlCalibration.counts.MISSING).toBeGreaterThanOrEqual(1);
    expect(result.controlCalibration.controls.length).toBeGreaterThanOrEqual(3);
    expect(result.controlCalibration.controls[0]?.suggestedEdit.length).toBeGreaterThan(0);
    expect(result.controlCalibration.controls[0]?.responseCell).toMatch(/^[A-Z]+[0-9]+$/);
    expect(result.reviewedWorkbookBase64).toBeDefined();
    expect(result.reviewedWorkbookFileName).toContain("zokorp-edit-guide.csv");
    expect(result.reviewedWorkbookMimeType).toContain("text/csv");
  });
});
