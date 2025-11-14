import { DesignerEditor } from '../../../../designer-editor.type'
import {
  useSelectedWidget,
  useSelectedWidgetContext,
  useSelectedWidgetDefine,
  useWidgetTree
} from '../../../../designer-editor.utils'
import WidgetDataDefine from '../../../WidgetDataDefine.vue'

export default defineComponent({
  label: '数据定义',
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
    const context = computed(() => useSelectedWidgetContext(props.editor))

    const widgetTree = computed(() => useWidgetTree(props.editor))

    return () => (
      <>
        <WidgetDataDefine
          editor={props.editor}
          widget={widget.value}
          context={context.value}
          widgetDefine={widgetDef.value}
          widgetTree={widgetTree.value}
        />
      </>
    )
  }
})
