<template>
  <ArrayValueInput
    class="DataPropDefineInput"
    item-key="_vid"
    :group="{ pull: false, put: false }"
    :readonly="readOnly || onlyItemEditable"
    v-model="valueVModel"
    @add="handleAdd"
    @remove="handleRemove"
  >
    <template #item="{ index }">
      <PropDefineItemInput
        :read-only="readOnly"
        :disabled="disabled"
        :only-item-editable="onlyItemEditable"
        :only-comment-editable="onlyCommentEditable"
        v-model="valueVModel[index]"
        @change="triggerUpdate"
      />
    </template>
    <template #empty>
      <div class="text-12px c-[--el-color-danger]">未定义</div>
    </template>
  </ArrayValueInput>
</template>

<script setup lang="ts">
import { generateVid } from '../../../common/utils'
import { WidgetDataDefinePropDefine } from '../../designer-editor.type'
import ArrayValueInput from '../../../common/ArrayValueInput.vue'
import PropDefineItemInput from './PropDefineItemInput.vue'
import { computedVModel } from '../../../common/hooks'

export interface DataPropDefineInputProps {
  modelValue?: WidgetDataDefinePropDefine[]
  readOnly?: boolean
  disabled?: boolean
  onlyItemEditable?: boolean
  onlyCommentEditable?: boolean
}

export type DataPropDefineInputEmits = {
  'update:modelValue': [val?: WidgetDataDefinePropDefine[]]
  change: [val?: WidgetDataDefinePropDefine[]]
}

const props = withDefaults(defineProps<DataPropDefineInputProps>(), {
  modelValue: () => []
})

const emits = defineEmits<DataPropDefineInputEmits>()

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
  valueVModel.value = valueVModel.value.toSpliced(index + 1, 0, { _vid: generateVid() })
}

const handleRemove = (index: number) => {
  valueVModel.value = valueVModel.value.toSpliced(index, 1)
}
</script>

<style scoped lang="scss">
.DataPropDefineInput {
  padding-left: 8px;
  border-left: 1px solid #222831;
  border-radius: 6px;
}
</style>
