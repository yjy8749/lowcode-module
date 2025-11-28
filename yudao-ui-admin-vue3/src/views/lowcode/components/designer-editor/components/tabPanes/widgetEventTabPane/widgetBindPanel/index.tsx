import { ElForm } from 'element-plus'
import { joinKeys } from '../../../../../common/utils'
import { isEmpty } from '@/utils/is'
import {
  useSelectedWidget,
  useSelectedWidgetRenderContext,
  useSelectedWidgetDefine
} from '../../../../designer-editor.utils'
import WidgetEventItem from '../../../WidgetEventItem.vue'
import { DesignerEditor } from '../../../../designer-editor.type'
import EmptyText from '../../../../../common/EmptyText.vue'

export default defineComponent({
  label: '组件事件&绑定',
  order: 1,
  props: {
    editor: {
      type: Object as PropType<DesignerEditor>,
      required: true
    }
  },
  setup(props) {
    const widgetDef = computed(() => useSelectedWidgetDefine(props.editor))
    const widget = computed(() => useSelectedWidget(props.editor))
    const widgetRenderContext = computed(() => useSelectedWidgetRenderContext(props.editor))

    const events = computed(() => widgetDef.value?.events ?? [])

    const WidgetBindList = () => {
      if (isEmpty(events.value)) {
        return <EmptyText />
      }
      return events.value.map((event) => {
        return (
          <>
            <WidgetEventItem
              eventType="widget"
              key={joinKeys(widget.value?._vid, event.key)}
              editor={props.editor}
              widget={widget.value}
              widgetDefine={widgetDef.value}
              widgetRenderContext={widgetRenderContext.value}
              event={event}
              eventBind={widget.value?.eventsBind?.[event.key]}
            />
          </>
        )
      })
    }

    return () => (
      <>
        <ElForm>
          <WidgetBindList />
        </ElForm>
      </>
    )
  }
})
