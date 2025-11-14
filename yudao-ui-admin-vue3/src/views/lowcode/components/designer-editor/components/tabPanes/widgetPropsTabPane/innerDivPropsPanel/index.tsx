import { ElForm } from 'element-plus'
import { joinKeys } from '../../../../../common/utils'
import {
  buildCSSStyleDef,
  useSelectedWidget,
  useSelectedWidgetContext,
  useSelectedWidgetDefine
} from '../../../../designer-editor.utils'
import WidgetPropItem from '../../../WidgetPropItem.vue'
import { DesignerEditor } from '../../../../designer-editor.type'

export default defineComponent({
  label: '内容器样式',
  icon: 'ep:full-screen',
  order: 99,
  props: {
    editor: {
      type: Object as PropType<DesignerEditor>,
      required: true
    }
  },
  isShow: (editor: DesignerEditor) => {
    return useSelectedWidgetDefine(editor)?.disableInner != true
  },
  setup(props) {
    const widgetDef = computed(() => useSelectedWidgetDefine(props.editor))
    const widget = computed(() => useSelectedWidget(props.editor))
    const context = computed(() => useSelectedWidgetContext(props.editor))

    const DynamicPropsList = () => {
      return [
        ...buildCSSStyleDef('inner'),
        ...(widgetDef.value?.innerStyleDesignerProps ?? [])
      ].map((define) => {
        return (
          <>
            <WidgetPropItem
              key={joinKeys(widget.value?._vid, define.key)}
              editor={props.editor}
              widget={widget.value}
              widgetDefine={widgetDef.value}
              context={context.value}
              propDefine={define}
              propValue={widget.value?.props[define.key]}
              propBind={widget.value?.propsBind?.[define.key]}
            />
          </>
        )
      })
    }

    return () => (
      <>
        <ElForm>
          <DynamicPropsList />
        </ElForm>
      </>
    )
  }
})
