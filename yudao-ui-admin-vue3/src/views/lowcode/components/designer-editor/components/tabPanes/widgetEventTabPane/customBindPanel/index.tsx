import { ElForm } from 'element-plus'
import { joinKeys } from '../../../../../common/utils'
import { isEmpty } from '@/utils/is'
import {
  useSelectedWidget,
  useSelectedWidgetContext,
  useSelectedWidgetDefine,
  readEditorDataValue,
  getCustomEventKey
} from '../../../../designer-editor.utils'
import WidgetEventItem from '../../../WidgetEventItem.vue'
import { DesignerEditor } from '../../../../designer-editor.type'
import EmptyText from '../../../../../common/EmptyText.vue'

export default defineComponent({
  label: '自定义事件&绑定',
  order: 2,
  props: {
    editor: {
      type: Object as PropType<DesignerEditor>,
      required: true
    }
  },
  setup(props) {
    const widgetDef = computed(() => useSelectedWidgetDefine(props.editor))
    const widget = computed(() => useSelectedWidget(props.editor))
    const context = computed(() => useSelectedWidgetContext(props.editor))

    const events = computed(() =>
      readEditorDataValue(props.editor, 'events')?.filter((e) => !isEmpty(e.key))
    )

    const EventBindList = () => {
      if (isEmpty(events.value)) {
        return <EmptyText />
      }
      return events.value.map((event) => {
        return (
          <>
            <WidgetEventItem
              eventType="custom"
              key={joinKeys(widget.value?._vid, event.key)}
              editor={props.editor}
              widget={widget.value}
              widgetDefine={widgetDef.value}
              context={context.value}
              event={event}
              eventBind={widget.value?.eventsBind?.[getCustomEventKey(event.key)]}
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
