import { ElForm } from 'element-plus'
import { joinKeys } from '../../../../../common/utils'
import { isEmpty } from '@/utils/is'
import {
  useSelectedWidget,
  useSelectedWidgetContext,
  useSelectedWidgetDefine,
  convertPropDefineToBind
} from '../../../../designer-editor.utils'
import WidgetPropItem from '../../../WidgetPropItem.vue'
import { DesignerEditor } from '../../../../designer-editor.type'

export default defineComponent({
  label: '高级属性&绑定',
  order: 3,
  props: {
    editor: {
      type: Object as PropType<DesignerEditor>,
      required: true
    }
  },
  isShow: (editor: DesignerEditor) => {
    const widgetDef = useSelectedWidgetDefine(editor)
    return !isEmpty(widgetDef?.advDesignerProps?.filter((e) => e.bindable))
  },
  setup(props) {
    const widgetDef = computed(() => useSelectedWidgetDefine(props.editor))
    const widget = computed(() => useSelectedWidget(props.editor))
    const context = computed(() => useSelectedWidgetContext(props.editor))

    const propsBindDefine = computed(() => {
      return (widgetDef.value?.advDesignerProps ?? [])
        .filter((e) => e.bindable)
        .map((e) => convertPropDefineToBind(e))
    })

    const DynamicPropsList = () => {
      return propsBindDefine.value.map((define) => {
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
