// index.tsx
import Render from './index.render.vue'
import {
  ElCommonSizeOptions,
  ElCommonTypeOptions,
  WidgetDefine
} from '../../../designer-editor.type'
import {
  eventDefine,
  inputDefine,
  selectDefine,
  switchDefine
} from '../../../designer-editor.props'

const widget: WidgetDefine = {
  label: '按钮Button',
  icon: 'svg-icon:lowcode-icon-button',
  render: (args) => () => {
    return <Render {...args} />
  },
  baseDesignerProps: [
    selectDefine({ key: 'size', label: '按钮尺寸' }, ElCommonSizeOptions),
    selectDefine({ key: 'type', label: '按钮类型' }, ElCommonTypeOptions),
    switchDefine({ key: 'plain', label: '是否为朴素按钮' }),
    switchDefine({ key: 'text', label: '是否为文字按钮' }),
    switchDefine({ key: 'link', label: '是否为链接按钮' }),
    switchDefine({ key: 'round', label: '是否为圆角按钮' }),
    switchDefine({ key: 'circle', label: '是否为圆形按钮' }),
    switchDefine({ key: 'loading', label: '是否加载中状态' }),
    switchDefine({ key: 'disabled', label: '是否禁用状态' }),
    switchDefine({ key: 'fullSize', label: '是否尺寸自适应' })
  ],
  advDesignerProps: [
    inputDefine({ key: 'label', label: '按钮文字', defaultValue: '按钮', bindable: true }),
    switchDefine({ key: 'showConfirm', label: '是否二次确认', bindable: true }),
    inputDefine({
      key: 'confirmMsg',
      label: '二次确认提示',
      bindable: true,
      isShow: ({ widget }) => widget.props.showConfirm
    })
  ],
  events: [eventDefine('click', { type: 'mouse-function', label: '按钮点击' })]
}
export default widget
