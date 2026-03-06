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
  // Detect HTML response (Google login page when sheet is not public)
  const first200 = text.slice(0, 200).toLowerCase();
  if (first200.includes("<!doctype") || first200.includes("<html")) {
    return {
      data: [],
      error: "Sheet not publicly viewable — check sharing settings.",
    };
  }

  try {
    const result = Papa.parse<Record<string, string>>(text.trim(), {
      header: true,
      delimiter: ",",
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, "_"),
    });

    if (result.errors.length > 0) {
      const criticalErrors = result.errors.filter(
        (e) => e.type !== "FieldMismatch" && e.type !== "Delimiter"
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
