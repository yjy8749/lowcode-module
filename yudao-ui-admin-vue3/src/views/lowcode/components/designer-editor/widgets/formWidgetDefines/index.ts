import { isNullOrUnDef } from '@/utils/is'
import { WidgetModuleInfo } from '../../designer-editor.type'

const defaultConfig: WidgetModuleInfo = {
  label: '表单元素',
  icon: 'ep:edit',
  disableInMenu(action, _, context) {
    return (
      action == 'add' &&
      isNullOrUnDef(
        context?.seekParent?.({
          _moduleName: 'containerWidgetDefines',
          _key: 'form'
        }).seekWidget
      )
    )
  }
}
export default defaultConfig
