import { useWidget } from './useWidget'
import {
  formatInputNumberDefine,
  evalFunctionDefine,
  inputDefine,
  radioButtonDefine,
  switchDefine
} from '../../designer-editor.props'
import { isNullOrUnDef, isEmpty } from '@/utils/is'
import { computedAsync } from '@vueuse/core'
import { CssSymbols } from '../../designer-editor.type'
import { highlightTextHtml } from '../../../common/utils'

const LabelControlOptions = [
  { label: '隐藏标签', value: 'hide' },
  { label: '显示标签', value: 'show' },
  { label: '跟随表单', value: 'fllow' }
]

export function formItemBaseDefine() {
  return [
    formatInputNumberDefine({ key: 'labelWidth', label: '标签宽度' }, { symbol: CssSymbols }),
    radioButtonDefine({ key: 'labelControl', label: '标签控制' }, LabelControlOptions, {
      _cancelable: true
    }),
    switchDefine({ key: 'required', label: '是否必填' }),
    inputDefine({
      key: 'requiredErrorMsg',
      label: '必填错误提示',
      isShow: ({ widget }) => widget.props.required
    }),
    inputDefine({ key: 'helps', label: '帮助文本' }),
    switchDefine({ key: 'helpsAlwaysShow', label: '帮助文本是否一直显示' })
  ]
}

export function formItemAdvDefine() {
  return [
    switchDefine({
      key: 'readonly',
      label: '是否只读',
      bindable: true,
      helps: '若 readonly 时与禁用样式不同可通过 readonly 插槽传入组件，默认样式与禁用相同'
    }),
    switchDefine({
      key: 'disabled',
      label: '是否禁用',
      bindable: true,
      helps: '禁用组件，不可交互。'
    }),
    inputDefine({ key: 'label', label: '标签文本', defaultValue: '标签名称' }),
    inputDefine({ key: 'prop', label: '绑定属性', helps: '校验规则要生效必须绑定属性' }),
    evalFunctionDefine(
      { key: 'propReadFun', label: '自定义读取函数' },
      {
        helps: `${highlightTextHtml('$args[0]')} 为表单 属性值`,
        defaultFunction: '/** 返回读取表单的数据 */\n' + 'return Promise.resolve($args[0])'
      }
    ),
    evalFunctionDefine(
      {
        key: 'propWriteFun',
        label: '自定义写入函数'
      },
      {
        helps: `${highlightTextHtml('$args[0]')} 为写入 属性值`,
        defaultFunction: '/** 返回写入表单的数据 */\n' + 'return Promise.resolve($args[0])'
      }
    ),
    switchDefine({ key: 'isCustomValid', label: '是否自定义校验规则' }),
    evalFunctionDefine(
      {
        key: 'customValidFun',
        label: '自定义校验函数',
        isShow: ({ widget }) => widget.props.isCustomValid
      },
      {
        helps: `${highlightTextHtml('$args[0]')} 为属性值,${highlightTextHtml('$args[1]')} 为表单数据`,
        defaultFunction: '/** 返回校验结果不通过返回错误信息 */\n' + 'return Promise.resolve()'
      }
    )
  ]
}

const formItemInputExcludeKeys = [...formItemBaseDefine(), ...formItemAdvDefine()]
  .map((e) => e.key)
  .filter((e) => e != 'readonly' && e != 'disabled')

export function useFormItemWidget(props: ReturnType<typeof useWidget>) {
  const {
    usePropValue,
    usePropObject,
    usePropAndEvent,
    useParent,
    toEvalFunction,
    exposeContext: superExposeContext,
    useExposeContext
  } = props

  const propKey = computed(() => usePropValue('prop'))

  const form = computed(() => useParent({ _moduleName: 'containerWidgetDefines', _key: 'form' }))

  const formContext = computed(() => useExposeContext(form.value?._vid))

  const useFormItemAttrs = () => {
    const args = usePropObject(
      'prop',
      'labelControl',
      'label',
      'labelWidth',
      'helps',
      'helpsAlwaysShow',
      'readonly'
    )
    let isHideLabel = false
    if (args.labelControl == 'hide' || formContext.value?.isHideLabel()) {
      isHideLabel = true
    }
    return {
      prop: args.prop,
      label: isHideLabel ? undefined : args.label,
      labelWidth: args.labelWidth,
      helps: args.helps,
      helpsAlwaysShow: args.helpsAlwaysShow,
      readonly: args.readonly || formContext.value?.isReadonly()
    }
  }

  const useFormInputAttrs = (args?: Parameters<typeof props.usePropAndEvent>[0]) => {
    const attrs = usePropAndEvent({
      ...args,
      omit: [...(args?.omit ?? []), ...formItemInputExcludeKeys]
    })
    attrs.readonly = attrs.readonly || formContext.value?.isReadonly()
    attrs.disabled = attrs.readonly || attrs.disabled || formContext.value?.isDisabled()
    if (isEmpty(attrs.placeholder)) {
      attrs.placeholder = `请输入${usePropValue('label')}`
    }
    return attrs
  }

  const propReadFun = computed(() => toEvalFunction(usePropValue('propReadFun')))

  const propWriteFun = computed(() => toEvalFunction(usePropValue('propWriteFun')))

  const valueModelAsync = computedAsync(() => {
    const formModel = formContext.value?.formModel()
    const val = formModel.value?.[propKey.value]
    return !isNullOrUnDef(propReadFun.value) ? propReadFun.value(val) : val
  })

  const valueModel = computed({
    get() {
      return valueModelAsync.value
    },
    set(val?: any) {
      if (formContext.value) {
        const formModel = formContext.value.formModel()
        if (!isNullOrUnDef(propWriteFun.value)) {
          propWriteFun.value(val).then((result) => {
            formModel.value[propKey.value] = result
          })
        } else {
          formModel.value[propKey.value] = val
        }
      }
    }
  })

  const exposeContext = (ctx?: any) => {
    return superExposeContext({
      ...ctx,
      getValue() {
        return formContext.value?.formModel().value[propKey.value]
      },
      setFormValue(val?: any) {
        if (formContext.value) {
          formContext.value.formModel().value[propKey.value] = val
        }
      }
    })
  }

  exposeContext()

  return {
    ...props,
    form,
    formContext,
    useFormItemAttrs,
    formItemAttrs: computed(() => useFormItemAttrs()),
    useFormInputAttrs,
    formInputAttrs: computed(() => useFormInputAttrs()),
    valueModel,
    exposeContext
  }
}
