import { generateVid } from '../../../../common/utils'
import Render from './index.render.vue'
import { WidgetDefine } from '../../../designer-editor.type'
import { createWidgetInstanceDefault } from '../../../designer-editor.utils'
import { buildConstDataDefines } from './utils'

const widget: WidgetDefine = {
  _vid: generateVid(),
  label: '引用参数',
  icon: 'svg-icon:lowcode-icon-args',
  render: (args) => () => {
    return <Render {...args} />
  },
  disableInner: true,
  disableOuter: true,
  create(editor, define) {
    const instance = createWidgetInstanceDefault(editor, define)
    instance.dataDefines = buildConstDataDefines(instance)
    return instance
  }
}
export default widget
