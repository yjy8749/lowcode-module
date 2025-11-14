import { generateVid } from '../../../../common/utils'
import Render from './index.render.vue'
import { WidgetDefine } from '../../../designer-editor.type'
import { isDirectParent, ElColPropDefines } from '../../hooks'

const widget: WidgetDefine = {
  _vid: generateVid(),
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
        isShow: (context) => {
          return isDirectParent(context, 'containerWidgetDefines')
        }
      }
    })
  ]
}
export default widget
