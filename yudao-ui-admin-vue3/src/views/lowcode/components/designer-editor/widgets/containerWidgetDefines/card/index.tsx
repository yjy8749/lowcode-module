import { generateVid } from '../../../../common/utils'
import Render from './index.render.vue'
import { LayoutJustifyOptions, WidgetDefine } from '../../../designer-editor.type'
import { createSlotItem, createWidgetInstanceDefault } from '../../../designer-editor.utils'
import { eventDefine, inputDefine, radioButtonDefine } from '../../../designer-editor.props'

const widget: WidgetDefine = {
  _vid: generateVid(),
  label: '卡片容器',
  icon: 'ep:postcard',
  render: (args) => () => {
    return <Render {...args} />
  },
  baseDesignerProps: [
    radioButtonDefine(
      {
        key: 'justify',
        label: '水平排列'
      },
      LayoutJustifyOptions.slice(0, 3),
      {
        _optionsOnlyIcon: true,
        _cancelable: true,
        _chunkSize: 3
      }
    ),
    radioButtonDefine(
      { key: 'shadow', label: '卡片阴影显示时机' },
      [
        {
          label: '显示',
          value: 'always'
        },
        {
          label: '不显示',
          value: 'never'
        },
        {
          label: '经过时显示',
          value: 'hover'
        }
      ],
      {
        _cancelable: true,
        _chunkSize: 3
      }
    )
  ],
  advDesignerProps: [
    inputDefine({ key: 'header', label: '卡片标题', bindable: true, defaultValue: '卡片标题' })
  ],
  create(editor, define) {
    const instance = createWidgetInstanceDefault(editor, define)
    instance.slots = [createSlotItem(editor)]
    return instance
  },
  events: [eventDefine('click', { type: 'mouse-function', label: '卡片点击' })]
}
export default widget
