import Papa from "papaparse";

export interface CSVParseResult {
  data: Record<string, string>[];
  error: string | null;
}

/**
 * Parse CSV text using PapaParse for robust handling of
 * quoted fields, commas inside fields, and multiline text.
 */
export function parseCSV(text: string): CSVParseResult {
  try {
    const result = Papa.parse<Record<string, string>>(text.trim(), {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, "_"),
    });

    if (result.errors.length > 0) {
      const criticalErrors = result.errors.filter(
        (e) => e.type !== "FieldMismatch"
      );
      if (criticalErrors.length > 0) {
        return {
          data: result.data || [],
          error: `CSV parse warning: ${criticalErrors[0].message} (row ${criticalErrors[0].row})`,
        };
      }
    }

    return { data: result.data || [], error: null };
  } catch (err) {
    return {
      data: [],
      error: err instanceof Error ? err.message : "Failed to parse CSV",
    };
  }
}

export interface FetchCSVResult {
  data: Record<string, string>[];
  lastModified: Date | null;
  error: string | null;
}

export async function fetchCSV(url: string): Promise<FetchCSVResult> {
  if (!url) return { data: [], lastModified: null, error: null };

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return {
        data: [],
        lastModified: null,
        error: `Failed to fetch CSV (${response.status}): ${response.statusText}`,
      };
    }

    const lastModifiedHeader = response.headers.get("Last-Modified");
    const lastModified = lastModifiedHeader
      ? new Date(lastModifiedHeader)
      : null;

    const text = await response.text();
    const parsed = parseCSV(text);

    return {
      data: parsed.data,
      lastModified,
      error: parsed.error,
    };
  } catch (err) {
    return {
      data: [],
      lastModified: null,
      error: err instanceof Error ? err.message : "Network error fetching CSV",
    };
  }
}
