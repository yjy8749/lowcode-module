// index.tsx
import Render from './index.render.vue'
import {
  CssSymbols,
  ElCommonSizeOptions,
  ElCommonTypeOptions,
  WidgetDefine
} from '../../../designer-editor.type'
import {
  colorPickerDefine,
  eventDefine,
  formatInputNumberDefine,
  inputDefine,
  inputNumberDefine,
  radioDefine,
  selectDefine,
  switchDefine
} from '../../../designer-editor.props'

const TextTagOptions = [
  { label: 'Inserted', value: 'ins' },
  { label: 'Deleted', value: 'del' },
  { label: 'Marked', value: 'mark' }
]

const TextFontWeightOptions = [
  { label: 'Lighter', value: 'lighter' },
  { label: 'Normal', value: 'normal' },
  { label: 'Bold', value: 'bold' }
]

const widget: WidgetDefine = {
  label: '文本Text',
  icon: 'ep:edit-pen',
  render: (args) => () => {
    return <Render {...args} />
  },
  baseDesignerProps: [
    selectDefine({ key: 'size', label: '文本尺寸' }, ElCommonSizeOptions),
    selectDefine({ key: 'type', label: '文本类型' }, ElCommonTypeOptions),
    switchDefine({ key: 'truncated', label: '是否显示省略号' }),
    inputNumberDefine({ key: 'lineClamp', label: '最大行数' }),
    radioDefine({ key: 'tag', label: '文本标签' }, TextTagOptions, { _cancelable: true }),
    colorPickerDefine({ key: 'color', label: '字体颜色' }),
    formatInputNumberDefine({ key: 'fontSize', label: '字体大小' }, { symbol: CssSymbols }),
    selectDefine({ key: 'fontWeight', label: '字体粗细' }, TextFontWeightOptions)
  ],
  advDesignerProps: [
    inputDefine({ key: 'text', label: '文本内容', bindable: true, defaultValue: '默认文本' })
  ],
  events: [eventDefine('click', { type: 'mouse-function', label: '文本点击' })]
}
export default widget
