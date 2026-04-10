/**
 * CSV Export utility
 *
 * Gera e faz download de arquivo CSV a partir de dados tabulares.
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
