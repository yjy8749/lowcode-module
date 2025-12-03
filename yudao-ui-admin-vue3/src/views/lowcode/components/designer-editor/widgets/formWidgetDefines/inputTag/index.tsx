// index.tsx
import Render from './index.render.vue'
import { WidgetDefine, ElCommonSizeOptions } from '../../../designer-editor.type'
import {
  eventDefine,
  inputDefine,
  inputNumberDefine,
  radioButtonDefine,
  selectDefine,
  switchDefine
} from '../../../designer-editor.props'
import { formItemAdvDefine, formItemBaseDefine } from '../../hooks/useFormItemWidget'

const widget: WidgetDefine = {
  label: '标签输入InputTag',
  icon: 'ep:edit',
  render: (args) => () => {
    return <Render {...args} />
  },
  baseDesignerProps: [
    switchDefine({ key: 'clearable', label: '是否支持一键清空' }),
    inputDefine({ key: 'prefixIcon', label: '前缀图标' }),
    inputDefine({ key: 'suffixIcon', label: '后缀图标' }),
    inputNumberDefine({ key: 'max', label: '最多可添加标签数量' }),
    switchDefine({ key: 'collapseTags', label: '是否折叠标签', defaultValue: false }),
    inputNumberDefine(
      { key: 'maxCollapseTags', label: '最多显示的标签数量' },
      { min: 0, precision: 0 }
    ),
    selectDefine({ key: 'tagType', label: '标签类型' }, ElCommonSizeOptions),
    radioButtonDefine(
      { key: 'tagEffect', label: '标签效果' },
      [
        { label: 'light', value: 'light' },
        { label: 'dark', value: 'dark' },
        { label: 'plain', value: 'plain' }
      ],
      { _cancelable: true }
    ),
    switchDefine({ key: 'draggable', label: '是否可以拖动标签' }),
    inputDefine({ key: 'delimiter', label: '分隔符' }),
    switchDefine({ key: 'autofocus', label: '是否自动获取焦点' }),
    ...formItemBaseDefine(),
    inputDefine({ key: 'placeholder', label: '输入提示文本' }),
    inputDefine({ key: 'defaultValue', label: '默认值' })
  ],
  advDesignerProps: formItemAdvDefine(),
  events: [eventDefine('change', { label: '值改变' })]
}
export default widget
