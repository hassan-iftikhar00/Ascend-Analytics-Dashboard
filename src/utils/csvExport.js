/**
 * Export data array to CSV and trigger download
 * @param {Array<Object>} data - Array of row objects
 * @param {string} filename - File name without extension
 * @param {Array<{key: string, header: string}>} columns - Column definitions
 */
export function exportToCsv(data, filename, columns) {
  if (!data || data.length === 0) return;

  const headers = columns.map((c) => c.header);
  const rows = data.map((row) =>
    columns.map((c) => {
      const val = row[c.key];
      // Escape commas and quotes in CSV values
      if (typeof val === "string" && (val.includes(",") || val.includes('"'))) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val ?? "";
    }),
  );

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join(
    "\n",
  );

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}
