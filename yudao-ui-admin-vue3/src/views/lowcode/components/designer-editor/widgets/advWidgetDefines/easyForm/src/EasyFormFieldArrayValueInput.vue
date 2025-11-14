<template>
  <ArrayValueInputHeader />
  <ArrayValueInput
    :group="{ pull: false, put: false }"
    :headers="fieldHeaders"
    v-model="valueVModel"
    @add="handleAdd"
    @remove="handleRemove"
  >
    <template #item="{ index }">
      <EasyFormFieldValueInput
        :field-styles="fieldStyles"
        v-model="valueVModel[index]"
        @change="triggerUpdate"
        @label-change="onLabelChange"
      />
    </template>
  </ArrayValueInput>
</template>

<script setup lang="ts">
import ArrayValueInputHeader from '../../../../../common/ArrayValueInputHeader.vue'
import ArrayValueInput from '../../../../../common/ArrayValueInput.vue'
import { computedVModel } from '../../../../../common/hooks'
import { EasyFormConfigFormField } from './EasyFormConfigDialog.vue'
import EasyFormFieldValueInput from './EasyFormFieldValueInput.vue'

export interface EasyFormFieldArrayValueInputProps {
  modelValue?: EasyFormConfigFormField[]
}

export type EasyFormFieldArrayValueInputEmits = {
  'update:modelValue': [val?: EasyFormConfigFormField[]]
  change: [val?: EasyFormConfigFormField[]]
  labelChange: [val?: EasyFormConfigFormField]
}

const defaultStyle = 'width: 115px'
const flexStyle = 'flex:1'

const fieldHeaders = [
  {
    label: '字段属性',
    helps: '字段属性, 表单prop属性',
    style: defaultStyle
  },
  {
    label: '字段名称',
    helps: '字段名称label, 表单label属性',
    style: defaultStyle
  },
  {
    label: '输入类型',
    helps: '字段表单输入类型, 关联表单组件',
    style: flexStyle
  },
  {
    label: '输入配置',
    helps: '根据输入类型不同, 配置重要属性',
    style: flexStyle
  },
  {
    label: '是否必填',
    helps: '校验字段是否必填',
    style: defaultStyle
  }
]

const fieldStyles = computed(() => fieldHeaders.map((e) => e.style))

const props = withDefaults(defineProps<EasyFormFieldArrayValueInputProps>(), {
  modelValue: () => []
})

const emits = defineEmits<EasyFormFieldArrayValueInputEmits>()

const { valueVModel, triggerUpdate } = computedVModel({
  get() {
    return props.modelValue
  },
  set(val?: any[]) {
    emits('update:modelValue', val)
    emits('change', val)
  }
})

const handleAdd = (index: number) => {
  valueVModel.value = valueVModel.value.toSpliced(index + 1, 0, {
    _moduleName: 'formWidgetDefines',
    _key: 'input'
  })
}

const handleRemove = (index: number) => {
  valueVModel.value = valueVModel.value.toSpliced(index, 1)
}

const onLabelChange = (item: EasyFormConfigFormField) => {
  emits('labelChange', item)
}
</script>

<style scoped lang="scss"></style>
