// index.tsx
import Render from './index.render.vue'
import { CssSymbols, WidgetDefine } from '../../../designer-editor.type'
import {
  evalFunctionDefine,
  eventDefine,
  formatInputNumberDefine,
  inputDefine,
  inputNumberDefine,
  switchDefine
} from '../../../designer-editor.props'
import { formItemAdvDefine, formItemBaseDefine } from '../../hooks/useFormItemWidget'

const widget: WidgetDefine = {
  label: 'Slider 滑块',
  icon: 'ep:edit',
  render: (args) => () => {
    return <Render {...args} />
  },
  baseDesignerProps: [
    inputNumberDefine({ key: 'min', label: '最小值', defaultValue: 0 }),
    inputNumberDefine({ key: 'max', label: '最大值', defaultValue: 100 }),
    inputNumberDefine({ key: 'step', label: '步长', defaultValue: 1 }),
    switchDefine({ key: 'range', label: '是否开启范围选择' }),
    switchDefine({
      key: 'showInput',
      label: '是否显示输入框',
      helps: '仅在非范围选择时有效',
      isShow: ({ widget }) => !widget.props.range
    }),
    switchDefine({
      key: 'showInputControls',
      label: '是否显示输入框控制按钮',
      defaultValue: true,
      isShow: ({ widget }) => !widget.props.range && widget.props.showInput
    }),
    switchDefine({ key: 'showStops', label: '是否显示间断点' }),
    switchDefine({ key: 'showTooltip', label: '是否显示提示信息', defaultValue: true }),
    inputDefine({
      key: 'formatTooltip',
      label: '格式化提示信息',
      helps: '${data} 为数值',
      isShow: ({ widget }) => widget.props.showTooltip
    }),
    switchDefine({ key: 'vertical', label: '是否垂直模式' }),
    formatInputNumberDefine(
      {
        key: 'height',
        label: '滑块高度',
        helps: '垂直模式必填',
        isShow: ({ widget }) => widget.props.vertical
      },
      { symbol: CssSymbols }
    ),
    evalFunctionDefine(
      { key: 'marks', label: '获取标记样式函数' },
      {
        type: 'simple-function',
        helps: `key 的类型必须为 number 且取值在闭区间 [min, max] 内，每个标记可以单独设置样式`,
        defaultFunction:
          '/** 同步或异步返回 Record<number,{ style, label }> 数据  */\n' + 'return {}'
      }
    ),
    ...formItemBaseDefine()
  ],
  advDesignerProps: formItemAdvDefine(),
  events: [eventDefine('change', { label: '值改变' })]
}
export default widget
