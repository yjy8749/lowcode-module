import { generateVid } from '../../../../common/utils'
import Render from './index.render.vue'
import {
  DesignerEditor,
  LayoutAlignOptions,
  LayoutJustifyOptions,
  WidgetDefine,
  WidgetInstance
} from '../../../designer-editor.type'
import { createSlotItem, createWidgetInstanceDefault } from '../../../designer-editor.utils'
import { inputNumberDefine, radioButtonDefine } from '../../../designer-editor.props'
import { batchCmd, writePropValueCmd, writeWidgetValueCmd } from '../../../designer-editor.cmd'

// 创建插槽
function createSlots(
  editor: DesignerEditor,
  layout: WidgetInstance,
  rowCnt: number,
  colCnt: number
): WidgetInstance[] {
  const totalSpan = Number(layout.slots.reduce((s, e) => s + (e.props.span ?? 0), 0))
  const isAdjustSpan =
    totalSpan % 24 == 0 || new Set(layout.slots.map((i) => i.props.span)).size <= 1
  return Array.from({ length: rowCnt * colCnt }).map((_, index) => {
    const slotKey = `slot#${index}`
    const oldSlotInstance = layout.slots.find((item: any) => item.slotKey === slotKey)
    const slotInstance = oldSlotInstance ?? createSlotItem(editor, slotKey)
    if (isAdjustSpan) {
      slotInstance.props.span = Math.floor(24 / colCnt)
    }
    return slotInstance
  })
}

const widget: WidgetDefine = {
  _vid: generateVid(),
  label: '布局容器',
  icon: 'ep:grid',
  render: (args) => () => {
    return <Render {...args} />
  },
  baseDesignerProps: [
    inputNumberDefine(
      { key: 'rowCnt', label: '行数', defaultValue: 1 },
      { min: 1, step: 1, precision: 0 }
    ),
    inputNumberDefine(
      { key: 'colCnt', label: '列数', defaultValue: 3 },
      { min: 1, step: 1, precision: 0 }
    ),
    inputNumberDefine({ key: 'gutter', label: '间隔' }, { min: 0, step: 1, precision: 0 }),
    radioButtonDefine(
      {
        key: 'justify',
        label: '水平排列'
      },
      LayoutJustifyOptions,
      {
        _optionsOnlyIcon: true,
        _cancelable: true,
        _chunkSize: 3
      }
    ),
    radioButtonDefine({ key: 'align', label: '垂直排列' }, LayoutAlignOptions)
  ],
  create(editor, define) {
    const instance = createWidgetInstanceDefault(editor, define)
    const { rowCnt, colCnt } = instance.props
    instance.slots = createSlots(editor, instance, rowCnt, colCnt)
    return instance
  },
  saveProps(editor, widget, propKey, propValue) {
    if (propKey == 'rowCnt' || propKey == 'colCnt') {
      const rowCnt = propKey == 'rowCnt' ? propValue : widget.props.rowCnt
      const colCnt = propKey == 'colCnt' ? propValue : widget.props.colCnt
      const slots = createSlots(editor, widget, rowCnt, colCnt)
      editor.executeCmd(
        batchCmd([
          writeWidgetValueCmd(editor, {
            widget: widget,
            key: 'slots',
            value: slots
          }),
          writePropValueCmd(editor, {
            widget: widget,
            key: propKey,
            value: propValue
          })
        ])
      )
    } else {
      editor.executeCmd(
        writePropValueCmd(editor, {
          widget: widget,
          key: propKey,
          value: propValue
        })
      )
    }
  }
}
export default widget
