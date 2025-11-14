import { generateVid } from '../../../../common/utils'
import Render from './index.render.vue'
import { WidgetDefine } from '../../../designer-editor.type'
import { createSlotItem, createWidgetInstanceDefault } from '../../../designer-editor.utils'
import cardDefine from '../../containerWidgetDefines/card/index'

const widget: WidgetDefine = {
  _vid: generateVid(),
  label: '卡片容器',
  icon: 'ep:postcard',
  hiddenInMenu: () => true,
  render: (args) => () => {
    return <Render {...args} />
  },
  baseDesignerProps: [...(cardDefine.baseDesignerProps ?? [])],
  advDesignerProps: [...(cardDefine.advDesignerProps ?? [])],
  create(editor, define) {
    const instance = createWidgetInstanceDefault(editor, define)
    instance.slots = [createSlotItem(editor)]
    return instance
  }
}
export default widget
