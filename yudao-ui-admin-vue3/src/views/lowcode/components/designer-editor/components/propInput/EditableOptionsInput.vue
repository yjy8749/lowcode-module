<template>
  <ArrayValueInput
    :group="{ pull: false, put: false }"
    :max-length="maxLength"
    :min-length="minLengthCom"
    v-model="optionsVModel"
    @add="handleAdd"
    @remove="handleRemove"
  >
    <template #item="{ index }">
      <EditableOptionsValueInput
        :radio="radio"
        :checked="valueVModel.value?.includes(optionsVModel[index].value)"
        :minimumChecked="(valueVModel.value?.length ?? 0) <= minChoice"
        v-model="optionsVModel[index]"
        @check="handleCheck"
        @change="triggerUpdate"
      />
    </template>
  </ArrayValueInput>
</template>
<script lang="ts" setup>
import { generateVid } from '../../../common/utils'
import { isNullOrUnDef } from '@/utils/is'
import { WidgetPropDefineOptions, WidgetPropEditableOptionsValue } from '../../designer-editor.type'
import ArrayValueInput from '../../../common/ArrayValueInput.vue'
import EditableOptionsValueInput from './EditableOptionsValueInput.vue'
import { computedVModel } from '../../../common/hooks'

export interface EditableOptionsInputProps {
  modelValue?: WidgetPropEditableOptionsValue
  groupName?: string
  maxLength?: number
  minLength?: number
  radio?: boolean
  max?: number
  min?: number
  defaultValue?: WidgetPropDefineOptions
}

export type EditableOptionsInputEmits = {
  'update:modelValue': [val?: WidgetPropEditableOptionsValue]
  change: [val?: WidgetPropEditableOptionsValue]
}

const props = withDefaults(defineProps<EditableOptionsInputProps>(), {
  modelValue: () => ({
    value: undefined,
    options: []
  }),
  defaultValue: () => ({
    label: `选项label`,
    value: `选项value`
  })
})

const emits = defineEmits<EditableOptionsInputEmits>()

const minChoice = computed(() => (props.radio ? Math.min(props.min ?? 1, 1) : props.min) ?? 0)

const minLengthCom = computed(() => Math.max(minChoice.value, props.minLength ?? 0))

const { valueVModel, triggerUpdate } = computedVModel<WidgetPropEditableOptionsValue>({
  get: () => {
    return {
      ...props.modelValue,
      value: (!isNullOrUnDef(props.modelValue.value) && props.radio
        ? [props.modelValue.value]
        : []) as string[]
    }
  },
  set: (val) => {
    if (!isNullOrUnDef(val)) {
      const validValues = val.options?.map((e) => e.value) ?? []
      let checkedValidValue = ((val.value ?? []) as string[]).filter((e) => validValues.includes(e))
      const choiceCnt = minChoice.value - checkedValidValue.length
      if (choiceCnt > 0) {
        checkedValidValue = [
          ...checkedValidValue,
          ...validValues.filter((e) => !checkedValidValue.includes(e)).slice(0, choiceCnt)
        ]
      }
      if (props.radio) {
        val = { ...val, value: checkedValidValue[0] }
      } else {
        val = { ...val, value: checkedValidValue }
      }
    }
    emits('update:modelValue', val)
    emits('change', val)
  }
})

const { valueVModel: optionsVModel } = computedVModel({
  get: () => {
    return props.modelValue.options
  },
  set: (val) => {
    valueVModel.value = { ...valueVModel.value, options: val }
  }
})

const handleAdd = (index: number) => {
  if (optionsVModel.value.length < minLengthCom.value) {
    Array.from({ length: minLengthCom.value - optionsVModel.value.length }).forEach(() => {
      optionsVModel.value = optionsVModel.value.toSpliced(index + 1, 0, {
        ...props.defaultValue,
        _vid: generateVid()
      })
    })
  } else {
    optionsVModel.value = optionsVModel.value.toSpliced(index + 1, 0, {
      ...props.defaultValue,
      _vid: generateVid()
    })
  }
}

const handleRemove = (index: number) => {
  if (optionsVModel.value.length <= minLengthCom.value) {
    optionsVModel.value = optionsVModel.value.toSpliced(0)
  } else {
    optionsVModel.value = optionsVModel.value.toSpliced(index, 1)
  }
}

const message = useMessage()

const handleCheck = (val?: WidgetPropDefineOptions) => {
  if (!isNullOrUnDef(val)) {
    const checkValues = valueVModel.value.value as string[]
    const isChecked = checkValues.includes(val.value)
    const min = minChoice.value
    const max = props.radio ? 1 : props.max
    if (isChecked) {
      const newVal = checkValues.filter((e) => e != val.value) ?? []
      if (!isNullOrUnDef(min) && newVal.length < min) {
        message.error(`至少选择${min}个选项`)
        return
      }
      valueVModel.value = { ...valueVModel.value, value: newVal }
    } else {
      const newVal = [...checkValues, val.value]
      if (!isNullOrUnDef(max) && newVal.length > max) {
        newVal.splice(0, 1)
      }
      valueVModel.value = { ...valueVModel.value, value: newVal }
    }
  }
}
</script>
