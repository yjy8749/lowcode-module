import Render from './index.render.vue'
import { WidgetDefine } from '../../../designer-editor.type'
import { inputDefine, propBindDefine } from '../../../designer-editor.props'

const widget: WidgetDefine = {
  label: '页面插槽',
  icon: 'svg-icon:lowcode-icon-slots',
  render: (args) => () => {
    return <Render {...args} />
  },
  baseDesignerProps: [inputDefine({ key: 'slotName', label: '插槽名称' })],
  advDesignerProps: [propBindDefine({ key: 'scope', label: '绑定插槽数据' })]
}
export default widget
