import { WidgetDataDefine, WidgetInstance } from '../../../designer-editor.type'
import { buildConstVid, createDataDefine } from '../../../designer-editor.utils'

export const DEFAULT_DATETIME_COLUMN_WIDTH = 151

export const DEFAULT_DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'

export function calcDatetimeColumnWidth(format?: string) {
  const width =
    (DEFAULT_DATETIME_COLUMN_WIDTH / DEFAULT_DATETIME_FORMAT.length) * (format?.length ?? 0) + 30
  return `${width.toFixed(0)}px`
}

export function getTableDataId(widget: WidgetInstance): string {
  return buildConstVid(widget, 'tableData')
}

export function buildTableDataDefines(
  widget: WidgetInstance,
  args?: Partial<WidgetDataDefine>
): WidgetDataDefine {
  return createDataDefine({
    _vid: getTableDataId(widget),
    widgetId: widget._vid,
    _type: 'const',
    name: '表格数据',
    scope: 'global',
    ...args
  })
}
