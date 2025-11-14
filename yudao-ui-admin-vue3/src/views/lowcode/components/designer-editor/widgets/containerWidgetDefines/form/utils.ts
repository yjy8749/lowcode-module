import { WidgetDataDefine, WidgetInstance } from '../../../designer-editor.type'
import { createDataDefine } from '../../../designer-editor.utils'
import { getFormModelDataId } from '../../hooks/useFormWidget'

export function buildConstDataDefines(widget: WidgetInstance): WidgetDataDefine[] {
  return [
    createDataDefine({
      _vid: getFormModelDataId(widget),
      widgetId: widget._vid,
      _type: 'const',
      name: '表单数据',
      scope: 'global'
    })
  ]
}
