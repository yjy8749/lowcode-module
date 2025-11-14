import { isNullOrUnDef, isEmpty } from '@/utils/is'
import { moveWidgetCmd } from '../designer-editor.cmd'
import { WidgetRenderContext, WidgetInstance, DesignerEditor } from '../designer-editor.type'
import { checkInvalidPropBindByScope } from '../designer-editor.utils'

export function useDraggableContainer(
  editor: DesignerEditor,
  slot?: WidgetInstance,
  context?: WidgetRenderContext
) {
  const store = editor.getStore()
  const message = useMessage()

  const onDragChange = (e: any) => {
    console.log(`onDragChange _vid:${slot?._vid}`, e)
    if (!isNullOrUnDef(e.moved)) {
      const { oldIndex: fromIndex, newIndex: toIndex } = e.moved
      const { element: widget } = e.moved.element
      editor.executeCmd(
        moveWidgetCmd(editor, {
          widget,
          fromSlotId: slot?._vid,
          fromIndex,
          toSlotId: slot?._vid,
          toIndex
        })
      )
    } else if (!isNullOrUnDef(e.added)) {
      const { slotId: fromSlotId } = store.state.value.draggingData ?? {}
      const { newIndex: toIndex } = e.added
      const { element: widget, index: fromIndex } = e.added.element

      const scopeCheckResults = checkInvalidPropBindByScope(editor, widget, slot, context, true)
      if (!isEmpty(scopeCheckResults)) {
        message.error('移动将导致仅作用于子组件的绑定数据失效')
        return
      }
      editor.executeCmd(
        moveWidgetCmd(editor, {
          widget,
          fromSlotId,
          fromIndex,
          toSlotId: slot?._vid,
          toIndex: toIndex
        })
      )
    }
  }
  const onDragStart = (e: any) => {
    console.log('slotRenger onDragStart', e)
    store.setDragging(true, { index: e.oldIndex, slotId: slot?._vid })
  }
  const onDragEnd = (e: any) => {
    console.log('slotRenger onDragEnd', e)
    store.setDragging(false)
  }

  return {
    onDragChange,
    onDragStart,
    onDragEnd
  }
}
