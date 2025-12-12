// index.tsx
import Render from './index.render.vue'
import { WidgetDefine } from '../../../designer-editor.type'
import {
  evalFunctionDefine,
  eventDefine,
  inputDefine,
  radioButtonDefine,
  switchDefine
} from '../../../designer-editor.props'
import { formItemAdvDefine, formItemBaseDefine } from '../../hooks/useFormItemWidget'

const widget: WidgetDefine = {
  label: 'Transfer 穿梭框',
  icon: 'ep:edit',
  render: (args) => () => {
    return <Render {...args} />
  },
  baseDesignerProps: [
    radioButtonDefine(
      { key: 'targetOrde', label: '列表元素排序策略' },
      [
        { label: '在最后', value: 'push' },
        { label: '在最前', value: 'unshift' }
      ],
      { _cancelable: true }
    ),
    inputDefine({ key: 'leftTitle', label: '左侧列表标题' }),
    inputDefine({ key: 'rightTitle', label: '右侧列表标题' }),
    inputDefine({ key: 'leftButtonText', label: '左侧按钮文案' }),
    inputDefine({ key: 'rightButtonText', label: '右侧按钮文案' }),
    switchDefine({ key: 'filterable', label: '是否可搜索' }),
    inputDefine({
      key: 'filterPlaceholder',
      label: '搜索框占位符',
      isShow: ({ widget }) => widget.props.filterable
    }),
    evalFunctionDefine(
      { key: 'loadData', label: '数据加载函数' },
      {
        defaultFunction:
          '/** 异步返回 { value, label, disabled } 数组 */\n' + 'return Promise.resolve([])'
      }
    ),
    ...formItemBaseDefine()
  ],
  advDesignerProps: formItemAdvDefine(),
  events: [eventDefine('change', { label: '值改变' })]
}
export default widget
