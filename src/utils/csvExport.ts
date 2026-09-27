/**
 * csvExport.ts
 *
 * Phase 8 — CSV export utility.
 * Respects authorization: callers must pass already-filtered data.
 * Never exports passwords, tokens, or internal IDs the user should not see.
 */

/**
 * Escape a CSV cell value to handle commas, quotes, and newlines.
 */
function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // If the string contains a comma, double-quote, or newline, wrap in quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Convert an array of objects to a CSV string.
 * @param rows      Array of plain objects (already RLS-filtered)
 * @param columns   Optional explicit column ordering. If omitted, uses Object.keys of first row.
 * @param headers   Optional human-readable header labels aligned with `columns`.
 */
export function objectsToCsv(
  rows: Record<string, unknown>[],
  columns?: string[],
  headers?: string[],
): string {
  if (rows.length === 0) return '';

  const cols = columns ?? Object.keys(rows[0]);
  const headerRow = (headers ?? cols).map(escapeCell).join(',');

  const dataRows = rows.map((row) =>
    cols.map((col) => escapeCell(row[col])).join(',')
  );

  return [headerRow, ...dataRows].join('\r\n');
}

/**
 * Trigger a browser file download of the provided CSV string.
 */
export function downloadCsv(csvContent: string, filename: string): void {
  // BOM for Excel UTF-8 compatibility
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Typed export helpers ─────────────────────────────────────────────────────

export function exportVisitReport(
  byDay: { date: string; count: number }[],
  dateLabel: string,
): void {
  const csv = objectsToCsv(
    byDay as unknown as Record<string, unknown>[],
    ['date', 'count'],
    ['Date', 'Visits Recorded'],
  );
  downloadCsv(csv, `visits_report_${dateLabel}`);
}

export function exportFollowUpReport(rows: {
  status: string;
  count: number;
}[]): void {
  const csv = objectsToCsv(
    rows as unknown as Record<string, unknown>[],
    ['status', 'count'],
    ['Status', 'Count'],
  );
  downloadCsv(csv, 'followup_report');
}

export function exportReferralReport(rows: {
  status: string;
  count: number;
}[]): void {
  const csv = objectsToCsv(
    rows as unknown as Record<string, unknown>[],
    ['status', 'count'],
    ['Status', 'Count'],
  );
  downloadCsv(csv, 'referral_report');
}

export function exportMedicineOrderReport(
  rows: {
    medicine_name: string;
    requested_quantity: number;
    approved_quantity: number | null;
    status: string;
    requested_at: string;
  }[],
): void {
  const csv = objectsToCsv(
    rows as unknown as Record<string, unknown>[],
    ['medicine_name', 'requested_quantity', 'approved_quantity', 'status', 'requested_at'],
    ['Medicine', 'Requested Qty', 'Approved Qty', 'Status', 'Requested At'],
  );
  downloadCsv(csv, 'medicine_requests_report');
}

export function exportStockReport(rows: {
  medicine_name: string;
  generic_name: string;
  unit: string;
  location: string;
  quantity: number;
  minimum_quantity: number;
  stock_status: string;
}[]): void {
  const csv = objectsToCsv(
    rows as unknown as Record<string, unknown>[],
    ['medicine_name', 'generic_name', 'unit', 'location', 'quantity', 'minimum_quantity', 'stock_status'],
    ['Medicine', 'Generic Name', 'Unit', 'Location', 'Qty', 'Min Qty', 'Status'],
  );
  downloadCsv(csv, 'inventory_stock_report');
}

export function exportSupervisorSummaryReport(data: Record<string, unknown>): void {
  // Convert the summary object to a two-column key/value CSV
  const rows = Object.entries(data).map(([metric, value]) => ({ metric, value }));
  const csv = objectsToCsv(
    rows,
    ['metric', 'value'],
    ['Metric', 'Value'],
  );
  downloadCsv(csv, 'supervisor_summary_report');
}
