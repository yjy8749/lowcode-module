import { isNullOrUnDef, isEmpty } from '@/utils/is'
import Render from './index.render.vue'
import { WidgetDefine } from '../../../designer-editor.type'
import {
  checkDataDefineAreBound,
  createSlotItem,
  createWidgetInstanceDefault
} from '../../../designer-editor.utils'
import { propBindDefine } from '../../../designer-editor.props'
import { buildVforItemDefine, getForItemDataId } from './utils'
import { writePropBindCmd } from '../../../designer-editor.cmd'

const message = useMessage()

const widget: WidgetDefine = {
  label: '循环v-for',
  icon: 'svg-icon:lowcode-icon-vfor',
  render: (args) => () => {
    return <Render {...args} />
  },
  advDesignerProps: [
    propBindDefine({
      key: 'data',
      label: '绑定循环数据',
      bindType: ['any[]'],
      onSaveBind(editor, widget, propKey, propValue) {
        if (isNullOrUnDef(propValue)) {
          const boundList = checkDataDefineAreBound(
            editor,
            widget,
            { _vid: getForItemDataId(widget) },
            true
          )
          if (!isEmpty(boundList)) {
            message.error(`运行时数据被 ${boundList[0].label} 绑定中不能清除`)
            return
          }
        }
        editor.executeCmd(
          writePropBindCmd(editor, {
            widget: widget,
            key: propKey,
            value: propValue
          })
        )
      }
    })
  ],
  create(editor, define) {
    const instance = createWidgetInstanceDefault(editor, define)
    instance.slots = [createSlotItem(editor)]
    return instance
  },
  runtimeDataDefines(editor, widget) {
    const itemDataDefine = buildVforItemDefine(editor, widget, widget.propsBind?.['data'])
    return [itemDataDefine].filter((e) => !isNullOrUnDef(e))
  }
}
export default widget
