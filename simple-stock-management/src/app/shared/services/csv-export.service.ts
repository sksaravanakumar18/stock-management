import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CsvExportService {
  exportToCsv(
    filename: string,
    headers: string[],
    rows: (string | number | null | undefined)[][]
  ): void {
    const csv = this.buildCsv(headers, rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  exportToJson(filename: string, data: unknown[]): void {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  private buildCsv(headers: string[], rows: (string | number | null | undefined)[][]): string {
    const csvHeaders = headers.map((h) => this.escapeCsvCell(String(h))).join(',');
    const csvRows = rows.map((row) =>
      row.map((cell) => this.escapeCsvCell(String(cell ?? ''))).join(',')
    );
    return [csvHeaders, ...csvRows].join('\n');
  }

  private escapeCsvCell(cell: string): string {
    const text = String(cell);
    return `"${text.replaceAll('"', '""')}"`;
  }
}
