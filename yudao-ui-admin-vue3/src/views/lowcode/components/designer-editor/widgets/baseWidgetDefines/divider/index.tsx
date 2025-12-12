// index.tsx
import Render from './index.render.vue'
import { WidgetDefine } from '../../../designer-editor.type'
import { inputDefine, radioButtonDefine } from '../../../designer-editor.props'

const widget: WidgetDefine = {
  label: '分割线Divider',
  icon: 'ep:warning',
  render: (args) => () => {
    return <Render {...args} />
  },
  baseDesignerProps: [
    radioButtonDefine(
      {
        key: 'direction',
        label: '分割线方向'
      },
      [
        { label: '水平', value: 'horizontal' },
        { label: '竖直', value: 'vertical' }
      ],
      { _cancelable: true }
    ),
    radioButtonDefine(
      {
        key: 'borderStyle',
        label: '分隔线样式'
      },
      [
        { label: '实线', value: 'solid' },
        { label: '虚线', value: 'dashed' },
        { label: '隐藏', value: 'hidden' }
      ],
      { _cancelable: true }
    ),
    radioButtonDefine(
      {
        key: 'contentPosition	',
        label: '分隔线内容位置'
      },
      [
        { label: '左', value: 'left' },
        { label: '中', value: 'center' },
        { label: '右', value: 'right' }
      ],
      { _cancelable: true }
    ),
    inputDefine({ key: 'text', label: '分隔线文字' })
  ]
}
export default widget
