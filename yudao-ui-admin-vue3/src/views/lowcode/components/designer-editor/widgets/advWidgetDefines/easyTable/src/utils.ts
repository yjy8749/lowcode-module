export const DEFAULT_DATETIME_COLUMN_WIDTH = 151

export const DEFAULT_DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'

export function calcDatetimeColumnWidth(format?: string) {
  const width =
    (DEFAULT_DATETIME_COLUMN_WIDTH / DEFAULT_DATETIME_FORMAT.length) * (format?.length ?? 0) + 30
  return `${width.toFixed(0)}px`
}
