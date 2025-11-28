import Render from './index.render.vue'
import { WidgetDefine } from '../../../designer-editor.type'

const widget: WidgetDefine = {
  label: '变量var',
  icon: 'svg-icon:lowcode-icon-var',
  render: (args) => () => {
    return <Render {...args} />
  },
  disableInner: true,
  disableOuter: true
}
export default widget
