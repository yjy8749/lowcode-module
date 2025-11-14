import { copyValue } from '../common/utils'
import { chunk } from 'lodash-es'
import { isNullOrUnDef, isEmpty } from '@/utils/is'
import type {
  DesignerEditorEventDefine,
  WidgetPropDefine,
  WidgetPropDefineOptions
} from './designer-editor.type'
import {
  ElText,
  ElLink,
  ElInput,
  ElInputNumber,
  ElSwitch,
  ElColorPicker,
  ElSelect,
  ElOption,
  ElRadioGroup,
  ElRadioButton,
  ElRadio,
  ElCheckboxGroup,
  ElCheckboxButton,
  ElCheckbox,
  ElAutocomplete,
  ElCascader,
  ElDatePicker,
  ElInputTag,
  ElMention,
  ElRate,
  ElSelectV2,
  ElSlider,
  ElTimePicker,
  ElTimeSelect,
  ElTreeSelect,
  ElUpload,
  ElButton,
  ElDivider
} from 'element-plus'
import { isEventKeyValid } from './designer-editor.utils'
import { Icon } from '@/components/Icon'
import { WritableComputedRef } from 'vue'
import FormatInputNumber from './components/propInput/FormatInputNumber.vue'
import EdgeInsetsInput from './components/propInput/EdgeInsetsInput.vue'
import EditableOptionsInput from './components/propInput/EditableOptionsInput.vue'
import EvalFunctionInput from './components/propInput/EvalFunctionInput.vue'
import AceEditorInput from './components/propInput/AceEditorInput.vue'
import ActionButtonInput from './components/propInput/ActionButtonInput.vue'

type ExtractProps<T> = T extends { $props: infer P } ? P : never

export function defaultDefine(define: WidgetPropDefine): WidgetPropDefine {
  return {
    ...define
  }
}

export function textDefine(
  define: WidgetPropDefine,
  props?: ExtractProps<InstanceType<typeof ElText>>
): WidgetPropDefine {
  return {
    type: 'text',
    bindType: ['string'],
    ...defaultDefine(define),
    render: (modelValue) => {
      return () => (
        <>
          <ElText onClick={() => copyValue(modelValue.value)} {...props}>
            <span class="flex gap-1 items-center">
              {modelValue.value ?? '--'}
              <Icon icon="ep:copy-document" size={12} />
            </span>
          </ElText>
        </>
      )
    }
  }
}

export function linkDefine(
  define: WidgetPropDefine,
  props?: ExtractProps<InstanceType<typeof ElLink>>
): WidgetPropDefine {
  return {
    type: 'link',
    bindType: ['string'],
    ...defaultDefine(define),
    render: (modelValue) => {
      return () => (
        <>
          <ElLink target={'_blank'} {...props}>
            <span class="flex gap-1 items-center">
              {modelValue.value ?? '--'}
              <Icon icon="ep:copy-link" size={12} />
            </span>
          </ElLink>
        </>
      )
    }
  }
}

export function inputDefine(
  define: WidgetPropDefine,
  props?: ExtractProps<InstanceType<typeof ElInput>>
): WidgetPropDefine {
  return {
    type: 'input',
    bindType: ['string'],
    ...defaultDefine(define),
    render: (modelValue) => {
      return () => (
        <>
          <ElInput
            clearable={true}
            placeholder={define.helps || define.label}
            vModel={modelValue.value}
            {...props}
          />
        </>
      )
    }
  }
}

export function textareaDefine(
  define: WidgetPropDefine,
  props?: ExtractProps<InstanceType<typeof ElInput>>
): WidgetPropDefine {
  return {
    type: 'textarea',
    bindType: ['string'],
    ...defaultDefine(define),
    render: (modelValue) => {
      return () => (
        <>
          <ElInput
            type={'textarea'}
            clearable={true}
            placeholder={define.helps || define.label}
            vModel={modelValue.value}
            {...props}
          />
        </>
      )
    }
  }
}

export function inputNumberDefine(
  define: WidgetPropDefine,
  props?: ExtractProps<InstanceType<typeof ElInputNumber>>
): WidgetPropDefine {
  return {
    type: 'inputNumber',
    bindType: ['number'],
    ...defaultDefine(define),
    render: (modelValue) => {
      return () => (
        <>
          <ElInputNumber
            class="!w-full"
            clearable={true}
            placeholder={define.helps || define.label}
            vModel={modelValue.value}
            {...props}
          />
        </>
      )
    }
  }
}

export function switchDefine(
  define: WidgetPropDefine,
  props?: ExtractProps<InstanceType<typeof ElSwitch>>
): WidgetPropDefine {
  return {
    type: 'switch',
    bindType: ['boolean'],
    ...defaultDefine(define),
    render: (modelValue) => {
      return () => (
        <>
          <ElSwitch {...props} vModel={modelValue.value} />
        </>
      )
    }
  }
}

export function colorPickerDefine(
  define: WidgetPropDefine,
  props?: ExtractProps<InstanceType<typeof ElColorPicker>>
): WidgetPropDefine {
  return {
    type: 'colorPicker',
    bindType: ['string'],
    ...defaultDefine(define),
    render: (modelValue) => {
      return () => (
        <>
          <ElColorPicker colorFormat={'hex'} vModel={modelValue.value} {...props} />
        </>
      )
    }
  }
}

export function selectDefine(
  define: WidgetPropDefine,
  options: WidgetPropDefineOptions[],
  props?: ExtractProps<InstanceType<typeof ElSelect>>
): WidgetPropDefine {
  return {
    type: 'select',
    bindType: props?.multiple ? ['string[]'] : ['string'],
    ...defaultDefine(define),
    render: (modelValue) => {
      return () => (
        <>
          <ElSelect
            clearable={true}
            placeholder={define.helps || define.label}
            vModel={modelValue.value}
            {...props}
          >
            {options.map((item) => {
              return <ElOption label={item.label} value={item.value} />
            })}
          </ElSelect>
        </>
      )
    }
  }
}

function warpOnRadioValueChecked(
  modelValue: WritableComputedRef<any>,
  props?: { _cancelable?: boolean }
) {
  return (e: MouseEvent, item: WidgetPropDefineOptions) => {
    e.preventDefault()
    if (modelValue.value == item.value) {
      if (props?._cancelable) {
        modelValue.value = undefined
      }
    } else {
      modelValue.value = item.value
    }
  }
}

export function radioButtonDefine(
  define: WidgetPropDefine,
  options: WidgetPropDefineOptions[],
  props?: ExtractProps<InstanceType<typeof ElRadioGroup>> & {
    _optionsOnlyIcon?: boolean
    _cancelable?: boolean
    _chunkSize?: number
  }
): WidgetPropDefine {
  return {
    type: 'radioButton',
    bindType: ['string'],
    ...defaultDefine(define),
    render: (modelValue) => {
      const onValueChecked = warpOnRadioValueChecked(modelValue, props)
      const optionChunks = chunk(options, props?._chunkSize ?? options.length)
      return () => (
        <>
          <div class="flex flex-col gap-1">
            {() => {
              return optionChunks.map((opts) => {
                return (
                  <ElRadioGroup vModel={modelValue.value} {...props}>
                    {opts.map((item) => {
                      return (
                        <>
                          <ElRadioButton
                            value={item.value}
                            onClick={(e: MouseEvent) => onValueChecked(e, item)}
                          >
                            <div class="flex items-center">
                              {item.icon ? <Icon icon={item.icon} size={12} /> : undefined}
                              {props?._optionsOnlyIcon ? undefined : <span>{item.label}</span>}
                            </div>
                          </ElRadioButton>
                        </>
                      )
                    })}
                  </ElRadioGroup>
                )
              })
            }}
          </div>
        </>
      )
    }
  }
}

export function radioDefine(
  define: WidgetPropDefine,
  options: WidgetPropDefineOptions[],
  props?: ExtractProps<InstanceType<typeof ElRadioGroup>> & {
    _optionsOnlyIcon?: boolean
    _cancelable?: boolean
    _chunkSize?: number
  }
): WidgetPropDefine {
  return {
    type: 'radio',
    bindType: ['string'],
    ...defaultDefine(define),
    render: (modelValue) => {
      const onValueChecked = warpOnRadioValueChecked(modelValue, props)
      const optionChunks = chunk(options, props?._chunkSize ?? options.length)
      return () => (
        <>
          <div class="flex flex-col gap-1">
            {() => {
              return optionChunks.map((opts) => {
                return (
                  <ElRadioGroup vModel={modelValue.value} {...props}>
                    {opts.map((item) => {
                      return (
                        <>
                          <ElRadio
                            class="!mr-2"
                            value={item.value}
                            onClick={(e: MouseEvent) => onValueChecked(e, item)}
                          >
                            <div class="flex items-center">
                              {item.icon ? <Icon icon={item.icon} size={12} /> : undefined}
                              {props?._optionsOnlyIcon ? undefined : <span>{item.label}</span>}
                            </div>
                          </ElRadio>
                        </>
                      )
                    })}
                  </ElRadioGroup>
                )
              })
            }}
          </div>
        </>
      )
    }
  }
}

function warpOnCheckboxValueUpdate(
  modelValue: WritableComputedRef<any>,
  props?: ExtractProps<InstanceType<typeof ElCheckboxGroup>>
) {
  return (vals: any[]) => {
    if (!isNullOrUnDef(props?.min) && vals.length < props.min) {
      return
    }
    if (!isNullOrUnDef(props?.max) && vals.length > props.max) {
      vals = vals.toSpliced(0, 1)
    }
    modelValue.value = vals
  }
}

export function checkboxButtonDefine(
  define: WidgetPropDefine,
  options: WidgetPropDefineOptions[],
  props?: ExtractProps<InstanceType<typeof ElCheckboxGroup>> & {
    _optionsOnlyIcon?: boolean
    _chunkSize?: number
  }
): WidgetPropDefine {
  return {
    type: 'checkboxButton',
    bindType: ['string[]'],
    ...defaultDefine(define),
    render: (modelValue) => {
      const onUpdateModelValue = warpOnCheckboxValueUpdate(modelValue, props)
      const tempProps = { ...props }
      tempProps.max = undefined
      tempProps.min = undefined
      const optionChunks = chunk(options, props?._chunkSize ?? options.length)
      return () => (
        <>
          <div class="flex flex-col gap-1">
            {() => {
              return optionChunks.map((opts) => {
                return (
                  <ElCheckboxGroup
                    modelValue={modelValue.value}
                    onUpdate:modelValue={onUpdateModelValue}
                    {...tempProps}
                  >
                    {opts.map((item) => {
                      return (
                        <>
                          <ElCheckboxButton value={item.value}>
                            <div class="flex items-center">
                              {item.icon ? <Icon icon={item.icon} size={12} /> : undefined}
                              {props?._optionsOnlyIcon ? undefined : <span>{item.label}</span>}
                            </div>
                          </ElCheckboxButton>
                        </>
                      )
                    })}
                  </ElCheckboxGroup>
                )
              })
            }}
          </div>
        </>
      )
    }
  }
}

export function checkboxDefine(
  define: WidgetPropDefine,
  options: WidgetPropDefineOptions[],
  props?: ExtractProps<InstanceType<typeof ElCheckboxGroup>> & {
    _optionsOnlyIcon?: boolean
    _chunkSize?: number
  }
): WidgetPropDefine {
  return {
    type: 'checkbox',
    bindType: ['string[]'],
    ...defaultDefine(define),
    render: (modelValue) => {
      const onUpdateModelValue = warpOnCheckboxValueUpdate(modelValue, props)
      const tempProps = { ...props }
      tempProps.max = undefined
      tempProps.min = undefined
      const optionChunks = chunk(options, props?._chunkSize ?? options.length)
      return () => (
        <>
          <div class="flex flex-col gap-1">
            {() => {
              return optionChunks.map((opts) => {
                return (
                  <ElCheckboxGroup
                    modelValue={modelValue.value}
                    onUpdate:modelValue={onUpdateModelValue}
                    {...tempProps}
                  >
                    {opts.map((item) => {
                      return (
                        <>
                          <ElCheckbox class="!mr-2" value={item.value}>
                            <div class="flex items-center">
                              {item.icon ? <Icon icon={item.icon} size={12} /> : undefined}
                              {props?._optionsOnlyIcon ? undefined : <span>{item.label}</span>}
                            </div>
                          </ElCheckbox>
                        </>
                      )
                    })}
                  </ElCheckboxGroup>
                )
              })
            }}
          </div>
        </>
      )
    }
  }
}

export function autocompleteDefine(
  define: WidgetPropDefine,
  props?: ExtractProps<InstanceType<typeof ElAutocomplete>>
): WidgetPropDefine {
  return {
    type: 'autocomplete',
    bindType: ['string'],
    ...defaultDefine(define),
    render: (modelValue) => {
      return () => (
        <>
          <ElAutocomplete
            clearable={true}
            placeholder={define.helps || define.label}
            vModel={modelValue.value}
            {...props}
          />
        </>
      )
    }
  }
}

export function cascaderDefine(
  define: WidgetPropDefine,
  props?: ExtractProps<InstanceType<typeof ElCascader>>
): WidgetPropDefine {
  return {
    type: 'cascader',
    bindType: ['any[]'],
    ...defaultDefine(define),
    render: (modelValue) => {
      return () => (
        <>
          <ElCascader
            class="!w-full"
            clearable={true}
            placeholder={define.helps || define.label}
            vModel={modelValue.value}
            {...props}
          />
        </>
      )
    }
  }
}

export function datePickerDefine(
  define: WidgetPropDefine,
  props?: ExtractProps<InstanceType<typeof ElDatePicker>>
): WidgetPropDefine {
  return {
    type: 'datePicker',
    bindType: ['string'],
    ...defaultDefine(define),
    render: (modelValue) => {
      return () => (
        <>
          <ElDatePicker
            class="!w-full"
            clearable={true}
            placeholder={define.helps || define.label}
            vModel={modelValue.value}
            {...props}
          />
        </>
      )
    }
  }
}

export function inputTagDefine(
  define: WidgetPropDefine,
  props?: ExtractProps<InstanceType<typeof ElInputTag>>
): WidgetPropDefine {
  return {
    type: 'inputTag',
    bindType: ['string[]'],
    ...defaultDefine(define),
    render: (modelValue) => {
      return () => (
        <>
          <ElInputTag
            clearable={true}
            placeholder={define.helps || define.label}
            vModel={modelValue.value}
            {...props}
          />
        </>
      )
    }
  }
}

export function mentionDefine(
  define: WidgetPropDefine,
  props?: ExtractProps<InstanceType<typeof ElMention>>
): WidgetPropDefine {
  return {
    type: 'mention',
    bindType: ['string'],
    ...defaultDefine(define),
    render: (modelValue) => {
      return () => (
        <>
          <ElMention
            clearable={true}
            placeholder={define.helps || define.label}
            vModel={modelValue.value}
            {...props}
          />
        </>
      )
    }
  }
}

export function rateDefine(
  define: WidgetPropDefine,
  props?: ExtractProps<InstanceType<typeof ElRate>>
): WidgetPropDefine {
  return {
    type: 'rate',
    bindType: ['number'],
    ...defaultDefine(define),
    render: (modelValue) => {
      return () => (
        <>
          <ElRate vModel={modelValue.value} {...props} />
        </>
      )
    }
  }
}

export function selectV2Define(
  define: WidgetPropDefine,
  props?: ExtractProps<InstanceType<typeof ElSelectV2>>
): WidgetPropDefine {
  return {
    type: 'selectV2',
    bindType: props?.multiple ? ['string[]'] : ['string'],
    ...defaultDefine(define),
    render: (modelValue) => {
      return () => (
        <>
          <ElSelectV2
            clearable={true}
            placeholder={define.helps || define.label}
            vModel={modelValue.value}
            {...props}
          />
        </>
      )
    }
  }
}

export function sliderDefine(
  define: WidgetPropDefine,
  props?: ExtractProps<InstanceType<typeof ElSlider>>
): WidgetPropDefine {
  return {
    type: 'slider',
    bindType: ['number'],
    ...defaultDefine(define),
    render: (modelValue) => {
      return () => (
        <>
          <ElSlider vModel={modelValue.value} {...props} />
        </>
      )
    }
  }
}

export function timePickerDefine(
  define: WidgetPropDefine,
  props?: ExtractProps<InstanceType<typeof ElTimePicker>>
): WidgetPropDefine {
  return {
    type: 'timePicker',
    bindType: ['string'],
    ...defaultDefine(define),
    render: (modelValue) => {
      return () => (
        <>
          <ElTimePicker
            class="!w-full"
            clearable={true}
            placeholder={define.helps || define.label}
            vModel={modelValue.value}
            {...props}
          />
        </>
      )
    }
  }
}

export function timeSelectDefine(
  define: WidgetPropDefine,
  props?: ExtractProps<InstanceType<typeof ElTimeSelect>>
): WidgetPropDefine {
  return {
    type: 'timeSelect',
    bindType: ['string'],
    ...defaultDefine(define),
    render: (modelValue) => {
      return () => (
        <>
          <ElTimeSelect
            clearable={true}
            placeholder={define.helps || define.label}
            vModel={modelValue.value}
            {...props}
          />
        </>
      )
    }
  }
}

export function treeSelectDefine(
  define: WidgetPropDefine,
  props?: ExtractProps<InstanceType<typeof ElTreeSelect>>
): WidgetPropDefine {
  return {
    type: 'treeSelect',
    bindType: props?.multiple ? ['string[]'] : ['string'],
    ...defaultDefine(define),
    render: (modelValue) => {
      return () => (
        <>
          <ElTreeSelect
            clearable={true}
            placeholder={define.helps || define.label}
            vModel={modelValue.value}
            {...props}
          />
        </>
      )
    }
  }
}

export function uploadDefine(
  define: WidgetPropDefine,
  props?: ExtractProps<InstanceType<typeof ElUpload>>
): WidgetPropDefine {
  return {
    type: 'upload',
    bindType: ['string'],
    ...defaultDefine(define),
    render: (modelValue) => {
      return () => (
        <>
          <ElUpload show-file-list={false} vModel={modelValue.value} {...props}>
            <ElButton link type={'primary'}>
              上传文件
            </ElButton>
          </ElUpload>
        </>
      )
    }
  }
}

export function dividerDefine(
  define?: Partial<WidgetPropDefine>,
  props?: ExtractProps<InstanceType<typeof ElDivider>>
): WidgetPropDefine {
  return {
    type: 'divider',
    hideLabel: true,
    ...defaultDefine({
      key: '',
      label: '',
      ...define
    }),
    render: () => {
      return () => (
        <>
          <ElDivider class={'!my-4'} {...props}>
            {define?.label}
          </ElDivider>
        </>
      )
    }
  }
}
export function formatInputNumberDefine(
  define: WidgetPropDefine,
  props?: ExtractProps<InstanceType<typeof FormatInputNumber>>
): WidgetPropDefine {
  return {
    type: 'formatInputNumber',
    bindType: ['string'],
    ...defaultDefine(define),
    render: (modelValue) => {
      return () => (
        <>
          <FormatInputNumber
            class="!w-full"
            clearable={true}
            placeholder={define.helps || define.label}
            vModel={modelValue.value}
            {...props}
          />
        </>
      )
    }
  }
}

export function edgeInsetsDefine(
  define: WidgetPropDefine,
  props?: ExtractProps<InstanceType<typeof EdgeInsetsInput>>
): WidgetPropDefine {
  return {
    type: 'edgeInsets',
    formItemProps: {
      labelPosition: 'top'
    },
    bindType: ['object'],
    ...defaultDefine(define),
    render: (modelValue) => {
      return () => (
        <>
          <EdgeInsetsInput vModel={modelValue.value} {...props} />
        </>
      )
    }
  }
}

export function editableOptionsDefine(
  define: WidgetPropDefine,
  props?: ExtractProps<InstanceType<typeof EditableOptionsInput>>
): WidgetPropDefine {
  return {
    type: 'editableOptions',
    formItemProps: {
      labelPosition: 'top'
    },
    bindType: ['object'],
    ...defaultDefine(define),
    render: (modelValue) => {
      return () => (
        <>
          <EditableOptionsInput vModel={modelValue.value} {...props} />
        </>
      )
    }
  }
}

export function propBindDefine(define: WidgetPropDefine): WidgetPropDefine {
  return {
    type: 'propBind',
    bindable: true,
    bindType: ['any'],
    ...defaultDefine(define)
  }
}

export function eventDefine(
  key: string,
  args?: Partial<DesignerEditorEventDefine> & { isLifecycle?: boolean }
): DesignerEditorEventDefine {
  if (!args?.isLifecycle && !isEventKeyValid(key)) {
    throw new Error(`event key ${key} is invalid`)
  }
  return {
    type: args?.type,
    key,
    label: args?.label ?? key,
    helps: args?.helps,
    fnHelps: args?.fnHelps
  }
}

export function evalFunctionDefine(
  define: WidgetPropDefine,
  props?: Partial<ExtractProps<InstanceType<typeof EvalFunctionInput>>>
): WidgetPropDefine {
  return {
    type: 'evalFunction',
    formItemProps: {
      _labelPosition: (val) => {
        if ((define.isArray && !isEmpty(val)) || !isNullOrUnDef(val?.evalFunction)) {
          return 'top'
        }
      }
    },
    bindType: ['object'],
    ...defaultDefine(define),
    render: (modelValue, context) => {
      return () => (
        <>
          <EvalFunctionInput
            vModel={modelValue.value}
            editor={context.editor}
            widget={context.widget}
            {...props}
          />
        </>
      )
    }
  }
}

export function aceInputDefine(
  define: WidgetPropDefine,
  props?: Partial<ExtractProps<InstanceType<typeof AceEditorInput>>>
): WidgetPropDefine {
  return {
    type: 'aceInput',
    formItemProps: { labelPosition: 'top' },
    bindType: ['string'],
    ...defaultDefine(define),
    render: (modelValue, context) => {
      return () => (
        <>
          <AceEditorInput
            vModel={modelValue.value}
            editor={context.editor}
            widget={context.widget}
            name={define.label}
            {...props}
          />
        </>
      )
    }
  }
}

export function actionButtonDefine(
  define: WidgetPropDefine,
  props?: Partial<ExtractProps<InstanceType<typeof ActionButtonInput>>>
): WidgetPropDefine {
  return {
    type: 'actionButton',
    formItemProps: {
      _labelPosition: (val) => {
        if ((define.isArray && !isEmpty(val)) || !isNullOrUnDef(val?.onClick?.evalFunction)) {
          return 'top'
        }
      }
    },
    bindType: ['object'],
    ...defaultDefine(define),
    render: (modelValue, context) => {
      return () => (
        <>
          <ActionButtonInput
            vModel={modelValue.value}
            editor={context.editor}
            widget={context.widget}
            {...props}
          />
        </>
      )
    }
  }
}
