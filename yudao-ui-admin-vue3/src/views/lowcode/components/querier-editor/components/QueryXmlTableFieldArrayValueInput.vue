<template>
  <ArrayValueInput
    :group="{ pull: false, put: false }"
    :readonly="disabled"
    :headers="fieldHeaders"
    v-model="valueVModel"
    @add="handleAdd"
    @remove="handleRemove"
  >
    <template #item="{ index }">
      <QueryXmlTableFieldValueInput
        :field-styles="fieldStyles"
        :disabled="disabled"
        v-model="valueVModel[index]"
        @change="triggerUpdate"
      />
    </template>
  </ArrayValueInput>
</template>

<script setup lang="ts">
import ArrayValueInput from '../../common/ArrayValueInput.vue'
import { computedVModel } from '../../common/hooks'
import { QueryField } from '../querier-editor.type'
import QueryXmlTableFieldValueInput from './QueryXmlTableFieldValueInput.vue'

export interface QueryXmlTableFieldArrayValueInputProps {
  disabled?: boolean
  modelValue?: QueryField[]
}

export type QueryXmlTableFieldArrayValueInputEmits = {
  'update:modelValue': [val?: QueryField[]]
  change: [val?: QueryField[]]
}

const defaultStyle = 'width: 115px'

const fieldHeaders = [
  {
    label: '字段名称',
    helps: '字段属性名称',
    style: defaultStyle
  },
  {
    label: '数据ID',
    helps: '数据表字段名称, 可使用sql子查询或函数',
    style: 'flex:1'
  },
  {
    label: '字段备注',
    helps: '字段备注',
    style: defaultStyle
  },
  {
    label: '确权查询',
    helps: '根据当前登录用户的确权信息通过该字段进行查询',
    style: defaultStyle
  },
  {
    label: '查询支持',
    helps: '配置字段支持的查询条件, 只有合法的查询条件可进行查询',
    style: 'flex:1'
  },
  {
    label: '必填分组',
    helps: '相同分组内所有参数必填. 至少有一个分组必填条件校验通过才能查询, 多个分组逗号分割',
    style: defaultStyle
  },
  {
    label: '显示',
    helps: '在返回值中显示该字段',
    style: 'width: 45px'
  },
  {
    label: '排序',
    helps: '字段是否可用于排序',
    style: 'width: 45px'
  },
  {
    label: '导出',
    helps: '导出时是否导出该字段',
    style: 'width: 45px'
  }
]

const fieldStyles = computed(() => fieldHeaders.map((e) => e.style))

const props = withDefaults(defineProps<QueryXmlTableFieldArrayValueInputProps>(), {
  modelValue: () => []
})

const emits = defineEmits<QueryXmlTableFieldArrayValueInputEmits>()

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
  valueVModel.value = valueVModel.value.toSpliced(index + 1, 0, {})
}

const handleRemove = (index: number) => {
  valueVModel.value = valueVModel.value.toSpliced(index, 1)
}
</script>

<style scoped lang="scss"></style>
