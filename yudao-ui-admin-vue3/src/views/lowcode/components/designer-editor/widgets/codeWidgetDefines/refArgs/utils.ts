import { WidgetDataDefine, WidgetInstance } from '../../../designer-editor.type'
import { createDataDefine, buildConstVid } from '../../../designer-editor.utils'

export function getPageParamsDataId(widget: WidgetInstance): string {
  return buildConstVid(widget, 'pageParams')
}

export function getQueryDataId(widget: WidgetInstance): string {
  return buildConstVid(widget, 'query')
}

export function getParamsDataId(widget: WidgetInstance): string {
  return buildConstVid(widget, 'params')
}

export function buildConstDataDefines(widget: WidgetInstance): WidgetDataDefine[] {
  return [
    createDataDefine({
      _vid: getPageParamsDataId(widget),
      widgetId: widget._vid,
      _type: 'const',
      name: '页面 Params 参数',
      scope: 'global'
    }),
    createDataDefine({
      _vid: getQueryDataId(widget),
      widgetId: widget._vid,
      _type: 'const',
      name: '路由 Query 参数',
      scope: 'global'
    }),
    createDataDefine({
      _vid: getParamsDataId(widget),
      widgetId: widget._vid,
      _type: 'const',
      name: '路由 Params 参数',
      scope: 'global'
    })
  ]
}
