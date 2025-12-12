import { ElForm } from 'element-plus'
import { joinKeys } from '../../../../../common/utils'
import {
  useSelectedWidget,
  useSelectedWidgetRenderContext,
  useSelectedWidgetDefine,
  convertPropDefineToBind
} from '../../../../designer-editor.utils'
import WidgetPropItem from '../../../WidgetPropItem.vue'
import {
  DesignerEditor,
  WIDGET_VIF_FUNCTION_KEY,
  WidgetInstance,
  WidgetPropDefineBind
} from '../../../../designer-editor.type'
import { evalFunctionDefine } from '../../../../designer-editor.props'
import { writeWidgetValueBindCmd } from '../../../../designer-editor.cmd'

export default defineComponent({
  label: '基础属性&绑定',
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
    const widgetRenderContext = computed(() => useSelectedWidgetRenderContext(props.editor))

    const saveWidgetBindValue = (
      editor: DesignerEditor,
      widget: WidgetInstance,
      key: keyof WidgetInstance,
      val?: WidgetPropDefineBind
    ) => {
      editor.executeCmd(
        writeWidgetValueBindCmd(editor, {
          widget: widget,
          key: key,
          value: val
        })
      )
    }

    const WidgetValuePropsList = () => {
      return [
        evalFunctionDefine({
          key: WIDGET_VIF_FUNCTION_KEY,
          label: '是否显示(v-if)',
          bindable: true,
          bindType: ['boolean'],
          onSaveBind: saveWidgetBindValue
        })
      ]
        .map((e) => convertPropDefineToBind(e))
        .map((define) => {
          return (
            <>
              <WidgetPropItem
                key={joinKeys(widget.value?._vid, define.key)}
                editor={props.editor}
                widget={widget.value}
                widgetDefine={widgetDef.value}
                widgetRenderContext={widgetRenderContext.value}
                propDefine={define}
                propValue={widget.value?.[define.key]}
                propBind={widget.value?._binds?.[define.key]}
              />
            </>
          )
        })
    }

    const DynamicPropsList = () => {
      return (widgetDef.value?.baseDesignerProps ?? [])
        .filter((e) => e.bindable)
        .map((e) => convertPropDefineToBind(e))
        .map((define) => {
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
          <WidgetValuePropsList />
          <DynamicPropsList />
        </ElForm>
      </>
    )
  }
})
