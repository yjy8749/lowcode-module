// index.tsx
import Render from './index.render.vue'
import { WidgetDefine } from '../../../designer-editor.type'
import {
  eventDefine,
  inputDefine,
  inputNumberDefine,
  radioButtonDefine,
  switchDefine
} from '../../../designer-editor.props'
import { formItemAdvDefine, formItemBaseDefine } from '../../hooks/useFormItemWidget'

const widget: WidgetDefine = {
  label: '数字输入InputNumber',
  icon: 'ep:edit',
  render: (args) => () => {
    return <Render {...args} />
  },
  baseDesignerProps: [
    inputDefine({ key: 'decreaseIcon', label: '减少图标' }),
    inputDefine({ key: 'increaseIcon', label: '增加图标' }),
    inputDefine({ key: 'prefixIcon', label: '前缀图标' }),
    inputDefine({ key: 'suffixIcon', label: '后缀图标' }),
    inputNumberDefine({ key: 'min', label: '最小值', defaultValue: 0 }),
    inputNumberDefine({ key: 'max', label: '最大值' }),
    inputNumberDefine({ key: 'step', label: '步长', defaultValue: 1 }),
    inputNumberDefine({ key: 'precision', label: '精度', defaultValue: 0 }),
    switchDefine({ key: 'stepStrictly', label: '是否只能输入步长的倍数' }),
    switchDefine({ key: 'controls', label: '是否使用控制按钮', defaultValue: true }),
    radioButtonDefine(
      {
        key: 'controlsPosition',
        label: '控制按钮位置',
        isShow: ({ widget }) => widget.props.controls
      },
      [
        { label: '默认', value: '' },
        { label: 'right', value: 'right' }
      ],
      { _cancelable: true }
    ),
    radioButtonDefine(
      { key: 'align', label: '输入文本对齐' },
      [
        { label: 'left', value: 'left' },
        { label: 'center', value: 'center' },
        { label: 'right', value: 'right' }
      ],
      { _cancelable: true }
    ),
    switchDefine({ key: 'fullWidth', label: '是否宽度自适应' }),
    ...formItemBaseDefine(),
    inputDefine({ key: 'placeholder', label: '输入提示文本' }),
    inputDefine({ key: 'defaultValue', label: '默认值' })
  ],
  advDesignerProps: formItemAdvDefine(),
  events: [eventDefine('change', { label: '值改变' })]
}
export default widget
