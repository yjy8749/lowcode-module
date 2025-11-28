import { ElForm } from 'element-plus'
import { isEmpty } from '@/utils/is'
import { joinKeys } from '../../../../../common/utils'
import EmptyText from '../../../../../common/EmptyText.vue'
import { usePageDefine, usePageInstance } from '../../../../widgets/pageDefine'
import WidgetEventItem from '../../../WidgetEventItem.vue'
import {
  defaultLifecycleEvents,
  readEditorDataValue,
  useRootRenderContext
} from '../../../../designer-editor.utils'
import { DesignerEditor } from '../../../../designer-editor.type'

export default defineComponent({
  label: '生命周期&绑定',
  order: 2,
  props: {
    editor: {
      type: Object as PropType<DesignerEditor>,
      required: true
    }
  },
  setup(props) {
    const widgetDef = computed(() => usePageDefine())
    const widget = computed(() => usePageInstance(props.editor))
    const widgetRenderContext = computed(() => useRootRenderContext(props.editor))
    const events = computed(() => defaultLifecycleEvents())
    const eventsBind = computed(() => readEditorDataValue(props.editor, 'eventsBind'))

    const EventBindList = () => {
      if (isEmpty(events.value)) {
        return <EmptyText />
      }
      return events.value.map((event) => {
        return (
          <>
            <WidgetEventItem
              eventType="lifecycle"
              key={joinKeys(widget.value._vid, event.key)}
              editor={props.editor}
              widget={widget.value}
              widgetDefine={widgetDef.value}
              widgetRenderContext={widgetRenderContext.value}
              event={event}
              eventBind={eventsBind?.value?.[event.key]}
            />
          </>
        )
      })
    }

    return () => (
      <>
        <ElForm>
          <EventBindList />
        </ElForm>
      </>
    )
  }
})
