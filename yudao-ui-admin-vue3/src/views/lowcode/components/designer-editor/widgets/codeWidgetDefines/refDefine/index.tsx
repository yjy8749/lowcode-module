import Render from './index.render.vue'
import { WidgetDefine } from '../../../designer-editor.type'
import { createWidgetInstanceDefault } from '../../../designer-editor.utils'
import { buildConstDataDefines } from './utils'

const widget: WidgetDefine = {
  label: '引用ref',
  icon: 'svg-icon:lowcode-icon-args',
  render: (args) => () => {
    return <Render {...args} />
  },
  disableInner: true,
  create(editor, define) {
    const instance = createWidgetInstanceDefault(editor, define)
    instance.dataDefines = buildConstDataDefines(instance)
    return instance
  }
}
export default widget
