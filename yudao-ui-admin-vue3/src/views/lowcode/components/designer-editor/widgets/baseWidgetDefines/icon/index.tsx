// index.tsx
import Render from './index.render.vue'
import { WidgetDefine } from '../../../designer-editor.type'
import {
  colorPickerDefine,
  eventDefine,
  inputDefine,
  inputNumberDefine
} from '../../../designer-editor.props'

const widget: WidgetDefine = {
  label: '图标Icon',
  icon: 'ep:picture-rounded',
  render: (args) => () => {
    return <Render {...args} />
  },
  baseDesignerProps: [
    inputDefine({ key: 'icon', label: '图标名称', defaultValue: 'ep:warning-filled' }),
    colorPickerDefine({ key: 'color', label: '图标颜色' }),
    inputNumberDefine({ key: 'size', label: '图标尺寸' })
  ],
  events: [eventDefine('click', { type: 'mouse-function', label: '图标点击' })]
}
export default widget
