// index.tsx
import { generateVid, highlightTextHtml } from '../../../../common/utils'
import Render from './index.render.vue'
import { WidgetDefine } from '../../../designer-editor.type'
import {
  eventDefine,
  inputDefine,
  inputNumberDefine,
  switchDefine
} from '../../../designer-editor.props'

const widget: WidgetDefine = {
  _vid: generateVid(),
  label: '上传Button',
  icon: 'ep:upload-filled',
  render: (args) => () => {
    return <Render {...args} />
  },
  baseDesignerProps: [
    inputDefine({ key: 'fileType', label: '文件类型', isArray: true }),
    inputNumberDefine({ key: 'fileSize', label: '大小限制(MB)' }),
    inputNumberDefine({ key: 'limit', label: '数量限制' }),
    switchDefine({ key: 'autoUpload', label: '是否自动上传' }),
    switchDefine({ key: 'drag', label: '是否拖拽上传' }),
    switchDefine({ key: 'isShowTip', label: '是否显示提示', defaultValue: true }),
    switchDefine({ key: 'hiddenFileList', label: '是否隐藏文件列表' }),
    inputDefine({ key: 'directory', label: '上传目录' })
  ],
  advDesignerProps: [],
  events: [
    eventDefine('upload-success', {
      type: 'simple-function',
      label: '上传成功',
      fnHelps: `${highlightTextHtml('$args[0]')}, 为文件上传成功后地址, 数量限制大于1时为数组`
    })
  ]
}
export default widget
