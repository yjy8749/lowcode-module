// index.tsx
import Render from './index.render.vue'
import { CssSymbols, WidgetDefine } from '../../../designer-editor.type'
import {
  eventDefine,
  formatInputNumberDefine,
  inputDefine,
  inputNumberDefine,
  switchDefine
} from '../../../designer-editor.props'
import { formItemAdvDefine, formItemBaseDefine } from '../../hooks/useFormItemWidget'

const widget: WidgetDefine = {
  label: '图片上传',
  icon: 'ep:picture',
  render: (args) => () => {
    return <Render {...args} />
  },
  baseDesignerProps: [
    switchDefine({ key: 'drag', label: '是否拖拽上传' }),
    formatInputNumberDefine({ key: 'width', label: '宽度' }, { symbol: CssSymbols }),
    formatInputNumberDefine({ key: 'height', label: '高度' }, { symbol: CssSymbols }),
    formatInputNumberDefine({ key: 'borderradius', label: '边框圆角' }, { symbol: CssSymbols }),
    inputDefine({ key: 'directory', label: '指定上传目录' }),
    inputDefine({ key: 'fileType', label: '文件类型', isArray: true }),
    inputNumberDefine({ key: 'fileSize', label: '大小限制(MB)' }),
    switchDefine({ key: 'multiple', label: '是否支持多图上传' }),
    inputNumberDefine({
      key: 'limit',
      label: '数量限制',
      isShow: ({ widget }) => widget.props.multiple
    }),
    switchDefine({
      key: 'showBtnText',
      label: '是否显示按钮文字',
      isShow: ({ widget }) => !widget.props.multiple
    }),
    ...formItemBaseDefine()
  ],
  advDesignerProps: formItemAdvDefine(),
  events: [eventDefine('change', { label: '值改变' })]
}
export default widget
