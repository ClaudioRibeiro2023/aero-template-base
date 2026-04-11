/**
 * Export utilities — CSV e XLSX nativo (SpreadsheetML, sem dependências externas).
 */

interface CsvColumn<T> {
  key: keyof T
  label: string
  format?: (value: T[keyof T]) => string
}

export function exportToCsv<T extends Record<string, unknown>>(
  rows: T[],
  filename: string,
  columns: CsvColumn<T>[]
): void {
  if (rows.length === 0) return

  const header = columns.map(c => `"${c.label}"`).join(',')

  const body = rows.map(row =>
    columns
      .map(col => {
        const val = row[col.key]
        const formatted = col.format ? col.format(val) : String(val ?? '')
        return `"${formatted.replace(/"/g, '""')}"`
      })
      .join(',')
  )

  const csv = [header, ...body].join('\n')
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()

  URL.revokeObjectURL(url)
}

/**
 * Exporta dados para XLSX (SpreadsheetML / Office Open XML) sem dependências externas.
 * Compatível com Excel 2007+, LibreOffice e Google Sheets.
 */
export function exportToXlsx<T extends Record<string, unknown>>(
  rows: T[],
  filename: string,
  columns: CsvColumn<T>[]
): void {
  if (rows.length === 0) return

  function esc(str: string) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  const headerRow =
    '<Row>' +
    columns.map(c => `<Cell><Data ss:Type="String">${esc(c.label)}</Data></Cell>`).join('') +
    '</Row>'

  const dataRows = rows
    .map(row => {
      const cells = columns.map(col => {
        const val = row[col.key]
        const formatted = col.format ? col.format(val) : String(val ?? '')
        const isNum = !col.format && typeof val === 'number'
        const type = isNum ? 'Number' : 'String'
        return `<Cell><Data ss:Type="${type}">${esc(isNum ? String(val) : formatted)}</Data></Cell>`
      })
      return '<Row>' + cells.join('') + '</Row>'
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="Dados">
    <Table>
      ${headerRow}
      ${dataRows}
    </Table>
  </Worksheet>
</Workbook>`

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.xls`
  link.click()

  URL.revokeObjectURL(url)
}
