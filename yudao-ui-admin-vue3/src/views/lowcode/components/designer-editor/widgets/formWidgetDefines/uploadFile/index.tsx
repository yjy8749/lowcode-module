// index.tsx
import Render from './index.render.vue'
import { WidgetDefine } from '../../../designer-editor.type'
import {
  eventDefine,
  inputDefine,
  inputNumberDefine,
  switchDefine
} from '../../../designer-editor.props'
import { formItemAdvDefine, formItemBaseDefine } from '../../hooks/useFormItemWidget'

const widget: WidgetDefine = {
  label: '文件上传',
  icon: 'ep:edit',
  render: (args) => () => {
    return <Render {...args} />
  },
  baseDesignerProps: [
    inputDefine({ key: 'fileType', label: '文件类型', isArray: true }),
    inputNumberDefine({ key: 'fileSize', label: '大小限制(MB)' }),
    inputNumberDefine({ key: 'limit', label: '数量限制', defaultValue: 1 }),
    switchDefine({ key: 'drag', label: '是否拖拽上传' }),
    switchDefine({ key: 'isShowTip', label: '是否显示提示', defaultValue: true }),
    inputDefine({ key: 'directory', label: '上传目录' }),
    ...formItemBaseDefine()
  ],
  advDesignerProps: formItemAdvDefine(),
  events: [eventDefine('change', { label: '值改变' })]
}
export default widget
