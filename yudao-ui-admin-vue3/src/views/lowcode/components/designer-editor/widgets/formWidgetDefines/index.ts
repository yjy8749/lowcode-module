import { isNullOrUnDef } from '@/utils/is'
import { WidgetModuleInfo } from '../../designer-editor.type'

const defaultConfig: WidgetModuleInfo = {
  label: '表单元素',
  icon: 'ep:edit',
  disableInMenu(_, __, slotRenderContext) {
    return isNullOrUnDef(
      slotRenderContext?.seekParent?.({
        _moduleName: 'containerWidgetDefines',
        _key: 'form'
      }).seekWidget
    )
  }
}
export default defaultConfig
