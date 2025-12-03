<template>
  <ArrayValueInput
    :group="{ pull: false, put: false }"
    v-model="valueVModel"
    @add="handleAdd"
    @remove="handleRemove"
  >
    <template #item="{ index }">
      <MultiValueInput
        :keys="['type', 'title', 'content', 'url']"
        :placeholder="['类型', '标题', '帮助文本', '跳转路径url']"
        v-model="valueVModel[index]"
        @change="triggerUpdate"
      >
        <template #type>
          <el-select v-model="valueVModel[index].type" placeholder="类型" @change="triggerUpdate">
            <el-option
              v-for="opt in TypeOptions"
              :key="opt.label"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </template>
      </MultiValueInput>
    </template>
  </ArrayValueInput>
</template>
<script lang="ts" setup>
import { ElCommonTypeOptions } from '../../../../designer-editor.type'
import MultiValueInput from '../../../../../common/MultiValueInput.vue'
import ArrayValueInput from '../../../../../common/ArrayValueInput.vue'
import { computedVModel } from '../../../../../common/hooks'
import { QuerierTableHelpTextProps } from '../../../../../querier-table/querier-table.type'
import { transformOptions } from '../../../../../common/utils'

const TypeOptions = transformOptions(ElCommonTypeOptions, {
  danger: { label: '错误', value: 'error' }
})

export interface EasyTableHelpsInputProps {
  modelValue?: QuerierTableHelpTextProps[]
}

export type EasyTableHelpsInputEmits = {
  'update:modelValue': [val?: QuerierTableHelpTextProps[]]
  change: [val?: QuerierTableHelpTextProps[]]
}

const props = withDefaults(defineProps<EasyTableHelpsInputProps>(), {
  modelValue: () => []
})

const emits = defineEmits<EasyTableHelpsInputEmits>()

const { valueVModel, triggerUpdate } = computedVModel({
  get: () => {
    return props.modelValue
  },
  set: (val) => {
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
