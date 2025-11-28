import Render from './index.render.vue'
import { WidgetDefine } from '../../../designer-editor.type'
import { colorPickerDefine, inputDefine, switchDefine } from '../../../designer-editor.props'

const widget: WidgetDefine = {
  label: '音频Audio',
  icon: 'svg-icon:lowcode-icon-audio',
  render: (args) => () => {
    return <Render {...args} />
  },
  baseDesignerProps: [
    colorPickerDefine({ key: 'progressBarColor', label: '进度条颜色' }),
    colorPickerDefine({ key: 'indicatorColor', label: '指示器颜色' }),
    switchDefine({ key: 'autoPlay', label: '是否自动播放' })
  ],
  advDesignerProps: [
    inputDefine({ key: 'src', label: '音频地址', bindable: true }),
    inputDefine({ key: 'title', label: '音频标题', bindable: true }),
    inputDefine({ key: 'coverImage', label: '封面图片地址', bindable: true })
  ]
}
export default widget
