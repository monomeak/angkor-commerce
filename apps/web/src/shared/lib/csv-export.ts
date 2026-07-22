function escapeCscValue(value: string | number): string {
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function toCsv(headers: string[], rows: (string | number)[][]): string {
  const lines = [
    headers.map(escapeCscValue).join(","),
    ...rows.map((row) => row.map(escapeCscValue).join(",")),
  ];

  return lines.join("\n");
}

// Triggers a browser download of the given CSV content
export function downloadCsv(filename: string, cvsContent: string): void {
  const blob = new Blob([cvsContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
