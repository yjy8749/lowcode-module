import { ElForm } from 'element-plus'
import { joinKeys } from '../../../../../common/utils'
import { isEmpty } from '@/utils/is'
import {
  useSelectedWidget,
  useSelectedWidgetRenderContext,
  useSelectedWidgetDefine
} from '../../../../designer-editor.utils'
import WidgetPropItem from '../../../WidgetPropItem.vue'
import { DesignerEditor } from '../../../../designer-editor.type'

export default defineComponent({
  label: '高级属性',
  order: 2,
  props: {
    editor: {
      type: Object as PropType<DesignerEditor>,
      required: true
    }
  },
  isShow: (editor: DesignerEditor) => {
    return !isEmpty(useSelectedWidgetDefine(editor)?.advDesignerProps)
  },
  setup(props) {
    const widgetDef = computed(() => useSelectedWidgetDefine(props.editor))
    const widget = computed(() => useSelectedWidget(props.editor))
    const widgetRenderContext = computed(() => useSelectedWidgetRenderContext(props.editor))

    const DynamicPropsList = () => {
      return (widgetDef.value?.advDesignerProps ?? []).map((define) => {
        return (
          <>
            <WidgetPropItem
              key={joinKeys(widget.value?._vid, define.key)}
              editor={props.editor}
              widget={widget.value}
              widgetDefine={widgetDef.value}
              widgetRenderContext={widgetRenderContext.value}
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
