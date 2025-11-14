import { generateVid } from '../../../../common/utils'
import Render from './index.render.vue'
import { LayoutJustifyOptions, WidgetDefine } from '../../../designer-editor.type'
import { inputDefine, radioButtonDefine } from '../../../designer-editor.props'
import { writePropValueCmd } from '../../../designer-editor.cmd'
import { ElColPropDefines } from '../../hooks'

const widget: WidgetDefine = {
  _vid: generateVid(),
  label: '页面容器',
  icon: 'svg-icon:lowcode-icon-page',
  render: (args) => () => {
    return <Render {...args} />
  },
  baseDesignerProps: [
    radioButtonDefine(
      {
        key: 'justify',
        label: '水平排列',
        defaultValue: 'center'
      },
      LayoutJustifyOptions.slice(0, 3),
      {
        _optionsOnlyIcon: true,
        _cancelable: true,
        _chunkSize: 3
      }
    ),
    ...ElColPropDefines.map((e) => {
      if (e.key == 'span') {
        return { ...e, defaultValue: 24 }
      }
      return e
    })
  ],
  advDesignerProps: [
    inputDefine({ key: 'fileId', label: '文件ID', bindable: true }),
    inputDefine({ key: 'version', label: '文件版本', bindable: true })
  ],
  saveProps(editor, widget, propKey, propValue) {
    editor.executeCmd({
      ...writePropValueCmd(editor, {
        widget: widget,
        key: propKey,
        value: propValue
      }),
      executeSuccess() {
        if (propKey === 'fileId' || propKey === 'version') {
          editor.getStore().setRefresh(widget)
        }
      },
      rollbackSuccess() {
        if (propKey === 'fileId' || propKey === 'version') {
          editor.getStore().setRefresh(widget)
        }
      }
    })
  }
}
export default widget
