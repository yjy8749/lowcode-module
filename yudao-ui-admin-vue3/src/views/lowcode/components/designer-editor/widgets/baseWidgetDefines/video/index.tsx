// index.tsx
import Render from './index.render.vue'
import { CssSymbols, WidgetDefine } from '../../../designer-editor.type'
import {
  colorPickerDefine,
  formatInputNumberDefine,
  inputDefine,
  inputNumberDefine,
  switchDefine
} from '../../../designer-editor.props'

const widget: WidgetDefine = {
  label: '视频Video',
  icon: 'ep:video-play',
  render: (args) => () => {
    return <Render {...args} />
  },
  baseDesignerProps: [
    formatInputNumberDefine({ key: 'width', label: '播放器宽度' }, { symbol: CssSymbols }),
    formatInputNumberDefine({ key: 'height', label: '播放器高度' }, { symbol: CssSymbols }),
    colorPickerDefine({ key: 'color', label: '播放器主题颜色' }),
    switchDefine({ key: 'webFullScreen', label: '是否网页全屏' }),
    switchDefine({ key: 'speed', label: '是否支持快进快退' }),
    switchDefine({ key: 'muted', label: '是否静音播放' }),
    switchDefine({ key: 'autoPlay', label: '是否自动播放' }),
    switchDefine({ key: 'loop', label: '是否循环播放' }),
    switchDefine({ key: 'mirror', label: '是否镜像画面' }),
    switchDefine({ key: 'ligthOff', label: '是否关灯模式' }),
    switchDefine({ key: 'control', label: '是否显示控制器' }),
    inputNumberDefine({ key: 'volume', label: '默认音量' }, { min: 0, max: 1, step: 0.01 })
  ],
  advDesignerProps: [
    inputDefine({ key: 'src', label: '视频地址', bindable: true }),
    inputDefine({ key: 'title', label: '视频名称', bindable: true }),
    inputDefine({ key: 'poster', label: '视频封面', bindable: true })
  ]
}
export default widget
