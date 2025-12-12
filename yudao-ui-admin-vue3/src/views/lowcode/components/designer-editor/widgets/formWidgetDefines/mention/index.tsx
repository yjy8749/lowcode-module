// index.tsx
import Render from './index.render.vue'
import { WidgetDefine } from '../../../designer-editor.type'
import {
  evalFunctionDefine,
  eventDefine,
  inputDefine,
  inputNumberDefine,
  radioButtonDefine,
  switchDefine
} from '../../../designer-editor.props'
import { formItemAdvDefine, formItemBaseDefine } from '../../hooks/useFormItemWidget'
import { highlightTextHtml } from '../../../../common/utils'

const widget: WidgetDefine = {
  label: 'Mention 提及',
  icon: 'ep:edit',
  render: (args) => () => {
    return <Render {...args} />
  },
  baseDesignerProps: [
    inputDefine({
      key: 'prefix',
      label: '触发字段的前缀',
      helps: '字符串长度必须且只能为 1',
      defaultValue: '@'
    }),
    inputDefine({
      key: 'split',
      label: '拆分提及的字符',
      helps: '字符串长度必须且只能为 1',
      defaultValue: ' '
    }),
    radioButtonDefine(
      { key: 'type', label: '输入类型' },
      [
        { label: '文本', value: 'text' },
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
    evalFunctionDefine(
      { key: 'search', label: '触发搜索函数' },
      {
        helps: ` ${highlightTextHtml('$args[0]')} 为查询数据，返回选项数组`,
        defaultFunction: '/** 异步返回数组 { value, label, disabled } */\n' + 'return []'
      }
    ),
    switchDefine({ key: 'showWordLimit', label: '是否显示统计字数', helps: '需配合最大长度使用' }),
    inputNumberDefine({ key: 'minlength', label: '最小长度' }, { min: 0 }),
    inputNumberDefine({ key: 'maxlength', label: '最大长度' }, { min: 0 }),
    switchDefine({ key: 'autofocus', label: '是否自动获取焦点' }),
    inputDefine({ key: 'placeholder', label: '输入提示文本' }),
    ...formItemBaseDefine()
  ],
  advDesignerProps: formItemAdvDefine(),
  events: [eventDefine('change', { label: '值改变' })]
}
export default widget
