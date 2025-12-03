import Render from './index.render.vue'
import { WidgetDefine } from '../../../designer-editor.type'
import { createSlotItem, createWidgetInstanceDefault } from '../../../designer-editor.utils'
import { propBindDefine } from '../../../designer-editor.props'

const widget: WidgetDefine = {
  label: '条件v-if',
  icon: 'svg-icon:lowcode-icon-vif',
  tips: '根据条件判断是否显示，即使条件为 `false` 设计模式下仍显示',
  render: (args) => () => {
    return <Render {...args} />
  },
  advDesignerProps: [
    propBindDefine({ key: 'vifValue', label: '显示条件值', bindType: ['boolean'] })
  ],
  create(editor, define) {
    const instance = createWidgetInstanceDefault(editor, define)
    instance.slots = [createSlotItem(editor)]
    return instance
  }
}
export default widget
