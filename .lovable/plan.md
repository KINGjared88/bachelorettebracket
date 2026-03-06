

## Fix: Suppress PapaParse delimiter-detection warnings for single-column CSVs

### Problem
The PLAYERS CSV is single-column, causing PapaParse to emit a "Delimiter" type warning. The current filter only excludes `FieldMismatch`, so this warning surfaces as an error banner.

### Change
In `src/lib/csv-parser.ts`, two fixes:

1. **Set `delimiter: ","` explicitly** in the PapaParse config to prevent auto-detection warnings entirely.
2. **Update the error filter** to only treat errors as critical if their type is NOT `FieldMismatch` AND NOT `Delimiter`. This is a safety net in case other single-value edge cases arise.

### File: `src/lib/csv-parser.ts`
- Line 23: Add `delimiter: ","` to the Papa.parse options
- Line 30-31: Change filter from `e.type !== "FieldMismatch"` to `e.type !== "FieldMismatch" && e.type !== "Delimiter"`

No other files change.

