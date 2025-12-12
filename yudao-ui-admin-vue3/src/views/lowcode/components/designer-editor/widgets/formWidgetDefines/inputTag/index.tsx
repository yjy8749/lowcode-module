// index.tsx
import Render from './index.render.vue'
import {
  ElCommonTagEffectOptions,
  ElCommonTagTypeOptions,
  WidgetDefine
} from '../../../designer-editor.type'
import {
  eventDefine,
  inputDefine,
  inputNumberDefine,
  radioButtonDefine,
  switchDefine
} from '../../../designer-editor.props'
import { formItemAdvDefine, formItemBaseDefine } from '../../hooks/useFormItemWidget'

const widget: WidgetDefine = {
  label: 'InputTag 标签输入框',
  icon: 'ep:edit',
  render: (args) => () => {
    return <Render {...args} />
  },
  baseDesignerProps: [
    switchDefine({ key: 'clearable', label: '是否支持一键清空', defaultValue: true }),
    inputDefine({ key: 'prefixIcon', label: '前缀图标' }, { _iconInput: true }),
    inputDefine({ key: 'suffixIcon', label: '后缀图标' }, { _iconInput: true }),
    inputNumberDefine({ key: 'max', label: '最多可添加标签数量' }),
    switchDefine({ key: 'collapseTags', label: '是否折叠标签' }),
    inputNumberDefine(
      { key: 'maxCollapseTags', label: '最多显示的标签数量' },
      { min: 0, precision: 0 }
    ),
    radioButtonDefine(
      {
        key: 'tagType',
        label: '标签类型'
      },
      ElCommonTagTypeOptions,
      {
        _cancelable: true
      }
    ),
    radioButtonDefine(
      {
        key: 'tagEffect',
        label: '标签效果'
      },
      ElCommonTagEffectOptions,
      {
        _cancelable: true
      }
    ),
    switchDefine({ key: 'draggable', label: '是否可以拖动标签' }),
    inputDefine({ key: 'delimiter', label: '分隔符' }),
    switchDefine({ key: 'autofocus', label: '是否自动获取焦点' }),
    inputDefine({ key: 'placeholder', label: '输入提示文本' }),
    ...formItemBaseDefine()
  ],
  advDesignerProps: formItemAdvDefine(),
  events: [eventDefine('change', { label: '值改变' })]
}
export default widget
