import { ElForm } from 'element-plus'
import { joinKeys } from '../../../../../common/utils'
import {
  DesignerEditor,
  WIDGET_VIF_FUNCTION_KEY,
  WIDGET_VIF_PERMIS_KEY,
  WidgetInstance
} from '../../../../designer-editor.type'
import {
  readWidgetValue,
  useSelectedWidget,
  useSelectedWidgetRenderContext,
  useSelectedWidgetDefine
} from '../../../../designer-editor.utils'
import { writeWidgetValueCmd } from '../../../../designer-editor.cmd'
import WidgetPropItem from '../../../WidgetPropItem.vue'
import {
  evalFunctionDefine,
  inputDefine,
  switchDefine,
  textDefine
} from '../../../../designer-editor.props'

export default defineComponent({
  label: '基础属性',
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

    const saveWidgetValue = (
      editor: DesignerEditor,
      widget: WidgetInstance,
      key: keyof WidgetInstance,
      val: any
    ) => {
      editor.executeCmd(
        writeWidgetValueCmd(editor, {
          widget: widget,
          key: key,
          value: val
        })
      )
    }

    const WidgetValuePropsList = () => {
      return [
        switchDefine({
          key: '_hidden',
          label: '在画板中隐藏',
          onSave: saveWidgetValue
        }),
        textDefine(
          {
            key: '_vid',
            label: '_vid',
            helps: '组件唯一ID,可在代码中通过该id调用组件'
          },
          {
            type: 'primary'
          }
        ),
        inputDefine({
          key: '_var',
          label: '_var',
          helps: '可在代码中通过变量名调用组件',
          onSave: saveWidgetValue
        }),
        inputDefine({
          key: WIDGET_VIF_PERMIS_KEY,
          label: '权限控制',
          helps: '组件权限控制,拥有任一权限即可',
          isArray: true,
          onSave: saveWidgetValue
        }),
        evalFunctionDefine(
          {
            key: WIDGET_VIF_FUNCTION_KEY,
            label: '是否显示(v-if)',
            bindable: true,
            onSave: saveWidgetValue
          },
          {
            type: 'simple-function',
            defaultFunction: '/** 同步或异步返回 */\n' + 'return true'
          }
        )
      ].map((define) => {
        return (
          <>
            <WidgetPropItem
              key={joinKeys(widget.value?._vid, define.key)}
              editor={props.editor}
              widget={widget.value}
              widgetDefine={widgetDef.value}
              widgetRenderContext={widgetRenderContext.value}
              propDefine={define}
              propValue={readWidgetValue(widget.value, define.key)}
            />
          </>
        )
      })
    }

    const DynamicPropsList = () => {
      return (widgetDef.value?.baseDesignerProps ?? []).map((define) => {
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
