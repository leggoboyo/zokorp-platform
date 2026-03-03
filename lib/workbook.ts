import ExcelJS from "exceljs";

export type WorkbookSheetRows = {
  name: string;
  rows: string[][];
};

function normalizeCellValue(value: ExcelJS.CellValue | null): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "object") {
    if ("text" in value && typeof value.text === "string") {
      return value.text;
    }

    if ("hyperlink" in value && typeof value.hyperlink === "string") {
      if ("text" in value && typeof value.text === "string" && value.text.trim()) {
        return `${value.text} (${value.hyperlink})`;
      }
      return value.hyperlink;
    }

    if ("richText" in value && Array.isArray(value.richText)) {
      return value.richText.map((chunk) => chunk.text).join("");
    }

    if ("result" in value && value.result !== null && value.result !== undefined) {
      return String(value.result);
    }

    if ("formula" in value && typeof value.formula === "string") {
      return value.formula;
    }
  }

  return String(value);
}

function cleanCellText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export async function readXlsxWorkbookRows(buffer: Buffer): Promise<WorkbookSheetRows[]> {
  const workbook = new ExcelJS.Workbook();
  const excelBuffer = buffer as unknown as Parameters<typeof workbook.xlsx.load>[0];
  await workbook.xlsx.load(excelBuffer);

  return workbook.worksheets.map((worksheet) => {
    const rowCount = Math.max(worksheet.rowCount, worksheet.actualRowCount);
    const rows: string[][] = [];

    for (let rowNumber = 1; rowNumber <= rowCount; rowNumber += 1) {
      const row = worksheet.getRow(rowNumber);
      const cellCount = Math.max(row.cellCount, row.actualCellCount);
      const cells: string[] = [];

      for (let cellNumber = 1; cellNumber <= cellCount; cellNumber += 1) {
        const cell = row.getCell(cellNumber);
        cells.push(cleanCellText(normalizeCellValue(cell.value)));
      }

      rows.push(cells);
    }

    return {
      name: worksheet.name,
      rows,
    };
  });
}

function columnToLetters(columnNumber: number) {
  let num = columnNumber;
  let letters = "";

  while (num > 0) {
    const remainder = (num - 1) % 26;
    letters = String.fromCharCode(65 + remainder) + letters;
    num = Math.floor((num - 1) / 26);
  }

  return letters;
}

export function encodeCellReference(input: { rowIndex: number; columnIndex: number }) {
  return `${columnToLetters(input.columnIndex + 1)}${input.rowIndex + 1}`;
}
