// index.tsx
import Render from './index.render.vue'
import { WidgetDefine } from '../../../designer-editor.type'
import { eventDefine, inputDefine, switchDefine } from '../../../designer-editor.props'
import { formItemAdvDefine, formItemBaseDefine } from '../../hooks/useFormItemWidget'
import { textFormItemValidDefine } from '../utils'

const widget: WidgetDefine = {
  label: '输入框Input',
  icon: 'ep:edit',
  render: (args) => () => {
    return <Render {...args} />
  },
  baseDesignerProps: [
    switchDefine({ key: 'clearable', label: '是否支持一键清空' }),
    inputDefine({ key: 'prefixIcon', label: '前缀图标' }),
    inputDefine({ key: 'suffixIcon', label: '后缀图标' }),
    switchDefine({ key: 'autofocus', label: '是否自动获取焦点' }),
    ...formItemBaseDefine(),
    ...textFormItemValidDefine(),
    inputDefine({ key: 'defaultValue', label: '默认值' })
  ],
  advDesignerProps: [
    switchDefine({ key: 'readonly', label: '是否只读', bindable: true }),
    switchDefine({ key: 'disabled', label: '是否禁用', bindable: true }),
    ...formItemAdvDefine()
  ],
  events: [eventDefine('change', { label: '值改变' }), eventDefine('input', { label: '输入事件' })]
}
export default widget
