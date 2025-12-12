// index.tsx
import Render from './index.render.vue'
import { WidgetDefine } from '../../../designer-editor.type'
import {
  evalFunctionDefine,
  eventDefine,
  inputDefine,
  switchDefine
} from '../../../designer-editor.props'
import { formItemAdvDefine, formItemBaseDefine } from '../../hooks/useFormItemWidget'
import { highlightTextHtml } from '../../../../common/utils'

const widget: WidgetDefine = {
  label: 'TimePicker 时间选择器',
  icon: 'ep:edit',
  render: (args) => () => {
    return <Render {...args} />
  },
  baseDesignerProps: [
    switchDefine({ key: 'clearable', label: '是否支持一键清空', defaultValue: true }),
    switchDefine({ key: 'editable', label: '文本框是否可输入', defaultValue: true }),
    switchDefine({ key: 'arrowControl', label: '是否使用箭头选择' }),
    switchDefine({ key: 'isRange', label: '是否时间范围选择' }),
    switchDefine({ key: 'fullWidth', label: '是否宽度自适应' }),
    inputDefine({ key: 'format', label: '显示格式', defaultValue: 'HH:mm:ss' }),
    inputDefine({
      key: 'valueFormat',
      label: '数值格式',
      helps: '时间戳格式使用 x',
      defaultValue: 'HH:mm:ss'
    }),
    inputDefine({
      key: 'defaultTime',
      label: '日期默认时间值',
      defaultValue: '00:00:00',
      isShow: ({ widget }) => !widget.props.isRange
    }),
    inputDefine({
      key: 'startDefaultTime',
      label: '开始时间默认时间值',
      defaultValue: '00:00:00',
      isShow: ({ widget }) => widget.props.isRange
    }),
    inputDefine({
      key: 'endDefaultTime',
      label: '结束时间默认时间值',
      defaultValue: '23:59:59',
      isShow: ({ widget }) => widget.props.isRange
    }),
    evalFunctionDefine(
      { key: 'disabledHours', label: '获取被禁用的小时选项' },
      {
        type: 'simple-function',
        defaultFunction: '/** 同步返回 number[] */\n' + 'return []'
      }
    ),
    evalFunctionDefine(
      { key: 'disabledMinutes', label: '获取被禁用的分钟选项' },
      {
        type: 'simple-function',
        helps: `${highlightTextHtml('$args[0]')} 为对应小时选项`,
        defaultFunction: '/** 同步返回 number[] */\n' + 'return []'
      }
    ),
    evalFunctionDefine(
      { key: 'disabledSeconds', label: '获取被禁用的秒选项' },
      {
        type: 'simple-function',
        helps: `${highlightTextHtml('$args[0]')} 为对应小时选项，${highlightTextHtml('$args[1]')} 为对应分钟选项`,
        defaultFunction: '/** 同步返回 number[] */\n' + 'return []'
      }
    ),
    inputDefine({
      key: 'placeholder',
      label: '输入提示文本',
      isShow: ({ widget }) => !widget.props.isRange
    }),
    inputDefine({
      key: 'startPlaceholder',
      label: '开始时间占位文本',
      isShow: ({ widget }) => widget.props.isRange
    }),
    inputDefine({
      key: 'endPlaceholder',
      label: '结束时间占位文本',
      isShow: ({ widget }) => widget.props.isRange
    }),
    inputDefine({
      key: 'rangeSeparator',
      label: '范围选择分隔符',
      isShow: ({ widget }) => widget.props.isRange
    }),
    ...formItemBaseDefine()
  ],
  advDesignerProps: formItemAdvDefine(),
  events: [eventDefine('change', { label: '值改变' })]
}
export default widget
