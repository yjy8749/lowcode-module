// index.tsx
import Render from './index.render.vue'
import { CommonTextPattern, WidgetDefine } from '../../../designer-editor.type'
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
  label: 'Input 输入框',
  icon: 'ep:edit',
  render: (args) => () => {
    return <Render {...args} />
  },
  baseDesignerProps: [
    switchDefine({ key: 'clearable', label: '是否支持一键清空', defaultValue: true }),
    inputDefine({ key: 'prefixIcon', label: '前缀图标' }, { _iconInput: true }),
    inputDefine({ key: 'suffixIcon', label: '后缀图标' }, { _iconInput: true }),
    radioButtonDefine(
      { key: 'type', label: '输入类型' },
      [
        { label: '文本', value: 'text' },
        { label: '密码', value: 'password' },
        { label: '文本域', value: 'textarea' }
      ],
      { _cancelable: true }
    ),
    switchDefine({
      key: 'autosize',
      label: '文本域高度是否自适应',
      isShow: ({ widget }) => widget.props.type == 'textarea'
    }),
    inputNumberDefine(
      {
        key: 'rows',
        label: '文本域行数',
        isShow: ({ widget }) => widget.props.type == 'textarea' && !widget.props.autosize
      },
      { min: 0, precision: 0 }
    ),
    inputNumberDefine(
      {
        key: 'minRows',
        label: '文本域最小行数',
        isShow: ({ widget }) => widget.props.type == 'textarea' && widget.props.autosize
      },
      { min: 0, precision: 0 }
    ),
    inputNumberDefine(
      {
        key: 'maxRows',
        label: '文本域最大行数',
        isShow: ({ widget }) => widget.props.type == 'textarea' && widget.props.autosize
      },
      { min: 0, precision: 0 }
    ),
    switchDefine({ key: 'showWordLimit', label: '是否显示统计字数', helps: '需配合最大长度使用' }),
    inputNumberDefine({ key: 'minlength', label: '最小长度' }, { min: 0, precision: 0 }),
    inputNumberDefine({ key: 'maxlength', label: '最大长度' }, { min: 0, precision: 0 }),
    selectDefine({ key: 'textPattern', label: '文本格式' }, CommonTextPattern),
    switchDefine({ key: 'autofocus', label: '是否自动获取焦点' }),
    inputDefine({ key: 'placeholder', label: '输入提示文本' }),
    ...formItemBaseDefine()
  ],
  advDesignerProps: formItemAdvDefine(),
  events: [eventDefine('change', { label: '值改变' })]
}
export default widget
