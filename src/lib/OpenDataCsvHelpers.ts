import { parse as createCsvParser } from "csv-parse";

export const createColumnChecker = (expectedColumns: ReadonlyArray<string>) => {
  return (headerCells: unknown[]) =>
    headerCells.map((rawCell: unknown) => {
      if (typeof rawCell !== "string")
        throw new Error(`Non-string in CSV header ${rawCell}`);

      const cleanedCell = toSnakeCase(rawCell);
      if (!expectedColumns.includes(cleanedCell))
        throw new Error(`Unexpected column "${rawCell}"`);

      return cleanedCell;
    });
};

const toSnakeCase = (value: string) =>
  value
    .trim()
    .toLocaleLowerCase()
    .replaceAll(/^[\/_]/g, "")
    .replaceAll("#", "number")
    .replaceAll(/[\s\/]+(\w)/g, (_, letter) => letter.toLocaleUpperCase());

const isTextNullish = (text: string) => {
  const lowerText = text.toLocaleLowerCase();
  if (!lowerText.trim()) return true;
  if (lowerText === "none") return true;
  if (lowerText === "null") return true;
  if (lowerText === "nil") return true;
  if (lowerText === "nil") return true;
  return false;
};

export const castNullish = (value: unknown) => {
  if (typeof value === "string" && isTextNullish(value)) return null;
  return value;
};

export const createOpenDataCsvParser = (
  expectedColumns: ReadonlyArray<string>,
) =>
  createCsvParser({
    columns: createColumnChecker(expectedColumns),
    trim: true,
    cast: castNullish,
  });
