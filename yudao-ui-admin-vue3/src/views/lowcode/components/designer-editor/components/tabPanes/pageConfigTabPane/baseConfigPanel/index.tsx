import { ElForm } from 'element-plus'
import { joinKeys } from '../../../../../common/utils'
import { usePageDefine, usePageInstance } from '../../../../widgets/pageDefine'
import WidgetPropItem from '../../../../components/WidgetPropItem.vue'
import { DesignerEditor } from '../../../../designer-editor.type'
import { useRootContext } from '../../../../designer-editor.utils'

export default defineComponent({
  label: '基础配置',
  order: 1,
  props: {
    editor: {
      type: Object as PropType<DesignerEditor>,
      required: true
    }
  },
  setup(props) {
    const widgetDef = computed(() => usePageDefine())
    const widget = ref(usePageInstance(props.editor))
    const context = computed(() => useRootContext(props.editor))

    const DynamicPropsList = () => {
      return (widgetDef.value?.baseDesignerProps ?? []).map((define) => {
        return (
          <>
            <WidgetPropItem
              key={joinKeys(widget.value._vid, define.key)}
              editor={props.editor}
              widget={widget.value}
              widgetDefine={widgetDef.value}
              context={context.value}
              propDefine={define}
              vModel:propValue={widget.value.props[define.key]}
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
