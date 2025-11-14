import { generateVid } from '../../../../common/utils'
import Render from './index.render.vue'
import { WidgetDefine } from '../../../designer-editor.type'

const widget: WidgetDefine = {
  _vid: generateVid(),
  label: 'EasyForm',
  icon: 'svg-icon:lowcode-icon-form',
  render: (args) => () => {
    return <Render {...args} />
  },
  async create(editor, define) {
    const { openEasyFormConfigDialog } = editor.inject
    return await openEasyFormConfigDialog({ define })
  }
}
export default widget
