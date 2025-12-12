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
  label: 'Radio 单选框',
  icon: 'ep:edit',
  render: (args) => () => {
    return <Render {...args} />
  },
  baseDesignerProps: [
    radioButtonDefine(
      { key: 'type', label: '选项组件类型' },
      [
        { label: 'radio', value: 'radio' },
        { label: 'button', value: 'button' }
      ],
      { _cancelable: true }
    ),
    switchDefine({ key: 'onlyIcon', label: '是否仅显示图标' }),
    switchDefine({ key: 'cancelable', label: '是否可取消选择' }),
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
