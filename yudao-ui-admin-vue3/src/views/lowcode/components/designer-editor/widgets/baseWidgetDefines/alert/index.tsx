// index.tsx
import Render from './index.render.vue'
import { ElCommonTypeOptions, WidgetDefine } from '../../../designer-editor.type'
import {
  eventDefine,
  inputDefine,
  inputNumberDefine,
  selectDefine,
  switchDefine
} from '../../../designer-editor.props'

const widget: WidgetDefine = {
  label: '提示Alert',
  icon: 'ep:warning',
  render: (args) => () => {
    return <Render {...args} />
  },
  baseDesignerProps: [
    selectDefine(
      { key: 'type', label: '提示类型' },
      ElCommonTypeOptions.map((e) => (e.value == 'danger' ? { label: '错误', value: 'error' } : e))
    ),
    switchDefine({ key: 'center', label: '文字是否居中' }),
    switchDefine({ key: 'closable', label: '是否可以关闭', defaultValue: false }),
    inputDefine({ key: 'closeText', label: '关闭按钮文本' }),
    switchDefine({ key: 'showIcon', label: '是否显示类型图标' }),
    inputNumberDefine(
      { key: 'showAfter', label: '触发后多久显示' },
      { min: 0, step: 1, precision: 0 }
    ),
    inputNumberDefine(
      { key: 'hideAfter', label: '关闭后延迟多久隐藏' },
      { min: 0, step: 1, precision: 0 }
    ),
    inputNumberDefine(
      { key: 'autoClose', label: '出现后多久自动隐藏' },
      { min: 0, step: 1, precision: 0 }
    )
  ],
  advDesignerProps: [
    inputDefine({ key: 'title', label: '标题', bindable: true }),
    inputDefine({ key: 'description', label: '提示文本', bindable: true, defaultValue: '提示文本' })
  ],
  events: [
    eventDefine('open', { type: 'simple-function', label: '开启 Alert 时触发' }),
    eventDefine('close', { type: 'simple-function', label: '关闭 Alert 时触发' })
  ]
}
export default widget
