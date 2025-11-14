import { generateVid } from '../../../../common/utils'
import Render from './index.render.vue'
import { WidgetDefine } from '../../../designer-editor.type'
import { inputDefine, propBindDefine } from '../../../designer-editor.props'

const widget: WidgetDefine = {
  _vid: generateVid(),
  label: 'VUE导入',
  icon: 'svg-icon:lowcode-icon-vue',
  render: (args) => () => {
    return <Render {...args} />
  },
  baseDesignerProps: [
    inputDefine({
      key: 'importName',
      label: '导入组件路径',
      helps: '组件路径为相对src目录的下组件入口文件的相对路径'
    })
  ],
  advDesignerProps: [
    propBindDefine({
      key: 'data',
      label: '绑定组件数据',
      helps: '绑定组件数据, 组件内部可用过data参数获取该数据'
    })
  ]
}
export default widget
