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

const widget: WidgetDefine = {
  label: 'Checkbox 多选框',
  icon: 'ep:edit',
  render: (args) => () => {
    return <Render {...args} />
  },
  baseDesignerProps: [
    radioButtonDefine(
      { key: 'type', label: '选项组件类型' },
      [
        { label: 'checkbox', value: 'checkbox' },
        { label: 'button', value: 'button' }
      ],
      { _cancelable: true }
    ),
    switchDefine({ key: 'onlyIcon', label: '是否仅显示图标' }),
    inputNumberDefine({ key: 'min', label: '最小选择数量' }, { min: 0, step: 1, precision: 0 }),
    inputNumberDefine({ key: 'max', label: '最大选择数量' }, { min: 0, step: 1, precision: 0 }),
    switchDefine({ key: 'remote', label: '是否远程加载' }),
    inputDefine({
      key: 'dictType',
      label: '字典类型',
      isShow: ({ widget }) => !widget.props.remote
    }),
    evalFunctionDefine(
      { key: 'remoteMethod', label: '选项加载函数', isShow: ({ widget }) => widget.props.remote },
      {
        defaultFunction:
          '/** 异步返回 { label, value, icon, disabled } 数组 */\n' + 'return Promise.resolve([])'
      }
    ),
    ...formItemBaseDefine()
  ],
  advDesignerProps: formItemAdvDefine(),
  events: [eventDefine('change', { label: '值改变' })]
}
export default widget
