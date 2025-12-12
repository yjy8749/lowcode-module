// index.tsx
import Render from './index.render.vue'
import { WidgetDefine, ElDatePickerTypeOptions } from '../../../designer-editor.type'
import {
  evalFunctionDefine,
  eventDefine,
  inputDefine,
  inputNumberDefine,
  selectDefine,
  switchDefine
} from '../../../designer-editor.props'
import { formItemAdvDefine, formItemBaseDefine } from '../../hooks/useFormItemWidget'
import { highlightTextHtml } from '../../../../common/utils'
import { writePropValuesCmd } from '../../../designer-editor.cmd'

function isType(widget, ...types: string[]) {
  return types.includes(widget.props.type)
}

const widget: WidgetDefine = {
  label: 'DatePicker 日期选择器',
  icon: 'ep:edit',
  render: (args) => () => {
    return <Render {...args} />
  },
  baseDesignerProps: [
    switchDefine({ key: 'clearable', label: '是否支持一键清空', defaultValue: true }),
    switchDefine({ key: 'editable', label: '文本框是否可输入', defaultValue: true }),
    selectDefine(
      {
        key: 'type',
        label: '日期选择器类型',
        onSave(editor, widget, __, propValue) {
          let rangeSeparator = '至'
          let startPlaceholder = ''
          let endPlaceholder = ''
          if (propValue == 'daterange') {
            startPlaceholder = '开始日期'
            endPlaceholder = '结束日期'
          } else if (propValue == 'datetimerange') {
            startPlaceholder = '开始时间'
            endPlaceholder = '结束时间'
          } else if (propValue == 'monthrange') {
            startPlaceholder = '开始月份'
            endPlaceholder = '结束月份'
          } else if (propValue == 'yearrange') {
            startPlaceholder = '开始年份'
            endPlaceholder = '结束年份'
          } else {
            rangeSeparator = ''
            startPlaceholder = ''
            endPlaceholder = ''
          }
          const typeOpt = ElDatePickerTypeOptions.find((e) => e.value == propValue)
          editor.executeCmd(
            writePropValuesCmd(editor, {
              widget: widget,
              values: {
                type: propValue,
                format: typeOpt?.format,
                valueFormat: typeOpt?.valueFormat ?? typeOpt?.format,
                rangeSeparator,
                startPlaceholder,
                endPlaceholder
              }
            })
          )
        }
      },
      ElDatePickerTypeOptions
    ),
    switchDefine({ key: 'fullWidth', label: '是否宽度自适应' }),
    inputDefine({ key: 'format', label: '显示格式' }),
    inputDefine({ key: 'valueFormat', label: '数值格式', helps: '时间戳格式使用 x' }),
    inputDefine({
      key: 'defaultTime',
      label: '日期默认时间值',
      defaultValue: '00:00:00',
      isShow: ({ widget }) => isType(widget, 'date', 'datetime')
    }),
    inputDefine({
      key: 'startDefaultTime',
      label: '开始日期默认时间值',
      defaultValue: '00:00:00',
      isShow: ({ widget }) => isType(widget, 'daterange', 'datetimerange')
    }),
    inputDefine({
      key: 'endDefaultTime',
      label: '结束日期默认时间值',
      defaultValue: '23:59:59',
      isShow: ({ widget }) => isType(widget, 'daterange', 'datetimerange')
    }),
    inputNumberDefine(
      {
        key: 'beforeMinDays',
        label: '向前偏移天数',
        helps: '从当前日期往前推多少天作为可选日期范围的起始边界。',
        isShow: ({ widget }) =>
          isType(widget, 'date', 'datetime', 'dates', 'daterange', 'datetimerange')
      },
      { min: 0, precision: 0 }
    ),
    inputNumberDefine(
      {
        key: 'afterMaxDays',
        label: '向后偏移天数',
        helps: '从当前日期往后推多少天作为可选日期范围的结束边界。',
        isShow: ({ widget }) =>
          isType(widget, 'date', 'datetime', 'dates', 'daterange', 'datetimerange')
      },
      { min: 0, precision: 0 }
    ),
    inputNumberDefine(
      {
        key: 'maxDaysRange',
        label: '最大日期跨度',
        helps: '范围选择时，所选起止日期之间的最大间隔天数。',
        isShow: ({ widget }) => isType(widget, 'daterange', 'datetimerange')
      },
      { min: 0, precision: 0 }
    ),
    evalFunctionDefine(
      { key: 'disabledDate', label: '日期是否被禁用' },
      {
        type: 'simple-function',
        helps: `${highlightTextHtml('$args[0]')} 为要判断的日期Date对象, 范围选择时${highlightTextHtml('$args[0]')}为[开始, 结束]Date数组`,
        defaultFunction: '/** 同步返回 */\n' + 'return false'
      }
    ),
    evalFunctionDefine(
      { key: 'shortcuts', label: '获取快捷选项' },
      {
        type: 'simple-function',
        defaultFunction: '/** 同步或异步返回 { text, value } 数组 */\n' + 'return []'
      }
    ),
    inputDefine({
      key: 'placeholder',
      label: '输入提示文本',
      isShow: ({ widget }) =>
        !isType(widget, 'daterange', 'datetimerange', 'monthrange', 'yearrange')
    }),
    inputDefine({
      key: 'startPlaceholder',
      label: '开始日期占位文本',
      isShow: ({ widget }) =>
        isType(widget, 'daterange', 'datetimerange', 'monthrange', 'yearrange')
    }),
    inputDefine({
      key: 'endPlaceholder',
      label: '结束日期占位文本',
      isShow: ({ widget }) =>
        isType(widget, 'daterange', 'datetimerange', 'monthrange', 'yearrange')
    }),
    inputDefine({
      key: 'rangeSeparator',
      label: '范围选择分隔符',
      isShow: ({ widget }) =>
        isType(widget, 'daterange', 'datetimerange', 'monthrange', 'yearrange')
    }),
    ...formItemBaseDefine()
  ],
  advDesignerProps: formItemAdvDefine(),
  events: [eventDefine('change', { label: '值改变' })]
}
export default widget
