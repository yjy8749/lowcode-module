import {
  CssSymbols,
  DesignerEditor,
  DesignerEditorData,
  PAGE_DEFINE_NO,
  RequestUrlModeOptions,
  WidgetDefine,
  WidgetInstance,
  WidgetPropDefine
} from '../designer-editor.type'
import {
  colorPickerDefine,
  formatInputNumberDefine,
  evalFunctionDefine,
  inputDefine,
  selectDefine,
  switchDefine,
  textDefine,
  radioButtonDefine
} from '../designer-editor.props'
import { createWidgetInstanceDefault, readEditorDataValue } from '../designer-editor.utils'
import { writeEditorDataValueCmd } from '../designer-editor.cmd'
import { highlightTextHtml } from '../../common/utils'

function _withFileValue(define: WidgetPropDefine) {
  define.defaultValue = (editor) => editor.getStore().state.value.materialFileData?.[define.key]
  return define
}

function _withPageValue(define: WidgetPropDefine) {
  define.defaultValue = (editor) => readEditorDataValue(editor, define.key as any)
  return define
}

const pageDefine: WidgetDefine = {
  _vid: PAGE_DEFINE_NO,
  _key: PAGE_DEFINE_NO,
  _moduleName: PAGE_DEFINE_NO,
  label: PAGE_DEFINE_NO,
  render: () => () => {
    throw new Error('该组件仅作为页面属性定义, render方法不会被调用')
  },
  props: {},
  baseDesignerProps: [
    _withFileValue(textDefine({ key: 'fileId', label: '文件ID' })),
    _withFileValue(textDefine({ key: 'version', label: '文件数据版本' })),
    _withPageValue(colorPickerDefine({ key: 'pageBgColor', label: '页面背景色' })),
    radioButtonDefine(
      {
        key: 'designPageWidthType',
        label: '页面宽度类型',
        onSave(editor, widget, __, propValue) {
          if (propValue == 'h5') {
            propValue = '375px'
          } else if (propValue == 'dialog') {
            propValue = '40%'
          }
          editor.executeCmd(
            writeEditorDataValueCmd(editor, {
              key: 'designPageWidth',
              value: propValue
            })
          )
          widget.props.designPageWidth = propValue
        }
      },
      [
        {
          label: 'H5',
          value: 'h5'
        },
        {
          label: 'Dialog',
          value: 'dialog'
        }
      ],
      {
        _cancelable: true
      }
    ),
    _withPageValue(
      formatInputNumberDefine(
        {
          key: 'designPageWidth',
          label: '设计页面宽度',
          helps: '仅设计模式下生效, 发布后默认使用容器100%宽度'
        },
        {
          symbol: CssSymbols
        }
      )
    ),
    _withPageValue(switchDefine({ key: 'drawerPanelAutoOpen', label: '自动打开属性面板' })),
    _withPageValue(
      selectDefine({ key: 'requestUrlMode', label: 'Api地址模式' }, RequestUrlModeOptions, {
        clearable: false
      })
    ),
    _withPageValue(inputDefine({ key: 'requestUrlBase', label: 'Api地址Base' }))
  ],
  advDesignerProps: [
    _withPageValue(
      evalFunctionDefine(
        {
          key: 'onPageClose',
          label: '编辑器关闭处理',
          helps: `可执行函数调用${highlightTextHtml('$close')}触发,可用于返回结果`
        },
        {
          defaultFunction: '/** 异步返回 */\n' + "return Promise.resolve('结果')"
        }
      )
    )
  ],
  saveProps(editor, _, propKey: keyof DesignerEditorData, propValue) {
    editor.executeCmd(
      writeEditorDataValueCmd(editor, {
        key: propKey,
        value: propValue
      })
    )
  },
  saveEventBind(editor, _, eventKey, eventBindValue) {
    editor.executeCmd({
      ...writeEditorDataValueCmd(editor, {
        key: 'eventsBind',
        subKey: eventKey,
        value: eventBindValue
      }),
      executeSuccess() {
        editor.getStore().refreshEditor()
      },
      rollbackSuccess() {
        editor.getStore().refreshEditor()
      }
    })
  }
}
export default pageDefine

/** 获取页面定义 */
export function usePageDefine(): WidgetDefine {
  return pageDefine
}

/** 获取页面实例 */
export function usePageInstance(editor: DesignerEditor): WidgetInstance {
  return createWidgetInstanceDefault(editor, usePageDefine())
}

/** 是否为Page组件 */
export function isPageWidget(widget: WidgetInstance) {
  return widget._key == PAGE_DEFINE_NO
}
