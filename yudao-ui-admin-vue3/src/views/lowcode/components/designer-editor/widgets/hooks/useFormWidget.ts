import { isNullOrUnDef, isEmpty } from '@/utils/is'
import { useDataDefineExecutor } from '../../components/dataDefine/hooks'
import { DesignerEditor, EvalFnContext, WidgetInstance } from '../../designer-editor.type'
import { buildConstVid, wrapEvalFunction } from '../../designer-editor.utils'
import { useWidget } from './useWidget'
export function isFormWidget(widget: WidgetInstance): boolean {
  return widget._moduleName == 'formWidgetDefines'
}

export function getFormModelDataId(widget: WidgetInstance): string {
  return buildConstVid(widget, 'formModel')
}

export function isInputType(widget: WidgetInstance, _key: string): boolean {
  return isFormWidget(widget) && _key == widget._key
}

export function customItemValidRules(widget: WidgetInstance): any[] {
  const rules: any[] = []

  // 自定义组件验证规则
  if (isInputType(widget, 'input') || isInputType(widget, 'autocomplete')) {
    const { props } = widget
    if (!isNullOrUnDef(props.minlength) && props.minlength > 0) {
      rules.push({
        min: props.minlength,
        message: `不能少于${props.minlength}个字`,
        trigger: 'change'
      })
    }
    if (!isNullOrUnDef(props.maxlength) && props.maxlength > 0) {
      rules.push({
        max: props.maxlength,
        message: `不能多于${props.maxlength}个字`,
        trigger: 'change'
      })
    }
    if (!isNullOrUnDef(props.textPattern)) {
      rules.push(JSON.parse(props.textPattern))
    }
  }

  return rules
}

// 构建表单校验规则
function buildItemRules(
  editor: DesignerEditor,
  formModel: ComputedRef<any>,
  evalFnContext: EvalFnContext,
  widget: WidgetInstance
): any[] {
  const { props } = widget
  const rules: any[] = []
  //是否必填规则
  if (props.required) {
    if (!isEmpty(props.requiredErrorMsg)) {
      rules.push({ required: true, message: props.requiredErrorMsg })
    } else {
      rules.push({ required: true, message: `请输入${props.label}` })
    }
  }
  //添加文本组件校验规则
  rules.push(...customItemValidRules(widget))
  //添加自定义校验规则
  if (props.isCustomValid && !isEmpty(props.customValidFun?.evalFunction)) {
    const evalFn = wrapEvalFunction(editor, props.customValidFun, evalFnContext)
    rules.push({
      validator: async (_, value, callback) => {
        try {
          const result = await evalFn(value, formModel.value)
          callback(!isNullOrUnDef(result) ? JSON.stringify(result) : undefined)
        } catch (e) {
          console.error(e)
          callback(e)
        }
      },
      trigger: 'change'
    })
  }
  //返回校验规则
  return rules
}

export function useFormWidget(props: ReturnType<typeof useWidget>) {
  const formRules = ref({})

  const { editor } = props

  const evalFnContext = props.evalFnContext

  const formModelExecutor = useDataDefineExecutor(editor)

  const formModelDataDefine = (props.widget.dataDefines ?? []).find(
    (d) => d._vid == getFormModelDataId(props.widget)
  )

  const { value: formModel } = formModelExecutor.updateExecutor({ dataDefine: formModelDataDefine })

  const readFromSlots = (widget: WidgetInstance, callback: (widget: WidgetInstance) => void) => {
    widget.slots.forEach((child) => {
      callback(child)
    })
  }

  formModel.value = JSON.parse(formModelDataDefine?.jsonData ?? '{}')

  const readFormModelProp = (slotWidget: WidgetInstance) => {
    slotWidget.slotChildren.forEach((child) => {
      if (isFormWidget(child) && !isEmpty(child.props.prop)) {
        if (!isNullOrUnDef(child.props.defaultValue)) {
          formModel.value[child.props.prop] = child.props.defaultValue
        }
      }
      readFromSlots(child, readFormModelProp)
    })
  }

  readFromSlots(props.widget, readFormModelProp)

  const readFormRules = (slotWidget: WidgetInstance) => {
    slotWidget.slotChildren.forEach((child) => {
      if (isFormWidget(child) && !isEmpty(child.props.prop)) {
        const itemRules = buildItemRules(editor, formModel, evalFnContext, child)
        if (!isEmpty(itemRules)) {
          formRules.value[child.props.prop] = itemRules
        }
      }
      readFromSlots(child, readFormRules)
    })
  }

  readFromSlots(props.widget, readFormRules)

  const updateFormModel = (val?: any) => {
    formModel.value = val
  }

  return {
    ...props,
    formModel,
    formRules,
    updateFormModel
  }
}
