// index.tsx
import Render from './index.render.vue'
import { WidgetDefine } from '../../../designer-editor.type'
import {
  evalFunctionDefine,
  eventDefine,
  radioButtonDefine,
  switchDefine
} from '../../../designer-editor.props'
import { formItemAdvDefine, formItemBaseDefine } from '../../hooks/useFormItemWidget'

const widget: WidgetDefine = {
  label: 'ColorPicker 颜色选择器',
  icon: 'ep:edit',
  render: (args) => () => {
    return <Render {...args} />
  },
  baseDesignerProps: [
    switchDefine({ key: 'showAlpha', label: '是否支持透明度选择' }),
    radioButtonDefine(
      {
        key: 'colorFormat',
        label: '颜色格式',
        defaultValue: 'hex'
      },
      [
        { label: 'hex', value: 'hex' },
        { label: 'rgb', value: 'rgb' }
      ]
    ),
    evalFunctionDefine(
      { key: 'predefine', label: '预定义颜色' },
      {
        type: 'simple-function',
        defaultFunction: '/** 同步或异步返回 string[] */\n' + 'return []'
      }
    ),
    ...formItemBaseDefine()
  ],
  advDesignerProps: formItemAdvDefine(),
  events: [eventDefine('change', { label: '值改变' })]
}
export default widget
