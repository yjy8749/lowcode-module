import Render from './index.render.vue'
import { WidgetDefine } from '../../../designer-editor.type'
import { isDirectParent, ElColPropDefines } from '../../hooks'

const widget: WidgetDefine = {
  label: '插槽',
  icon: 'svg-icon:lowcode-icon-slots',
  render: (args) => () => {
    return <Render {...args} />
  },
  props: {},
  baseDesignerProps: [
    ...ElColPropDefines.map((e) => {
      return {
        ...e,
        isShow: (slotRenderContext) => {
          return isDirectParent(slotRenderContext, 'containerWidgetDefines')
        }
      }
    })
  ]
}
export default widget
