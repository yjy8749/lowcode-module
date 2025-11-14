<template>
  <div class="w-full flex flex-col gap-1">
    <div v-if="isReadonly" class="flex items-center gap-1 text-12px">
      <div v-if="valueVModel.name != valueItemFlag">
        {{ valueVModel.name }}
      </div>
      <div class="c-[--el-color-primary]" :class="{ '!c-[--el-color-danger]': isUndefined }">
        {{ typeLabel }} {{ isShowItemType ? `[ ${itemTypeLabel} ]` : '' }}
      </div>
      <div class="c-[--el-color-success]">
        {{ valueVModel.comment }}
      </div>
    </div>
    <div v-else class="flex-1 flex items-center justify-between gap-1">
      <el-input
        clearable
        placeholder="属性名"
        :disabled="isDisabled || onlyItemEditable"
        v-model="valueVModel.name"
        @change="triggerUpdate"
      />
      <el-select
        class="w-full"
        clearable
        placeholder="属性类型"
        :disabled="isDisabled || onlyItemEditable"
        v-model="valueVModel.type"
        @change="onTypeChange"
      >
        <el-option
          v-for="item in PROP_TYPE_OPTIONS"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-select
        v-if="isShowItemType"
        class="w-full"
        clearable
        placeholder="Item类型"
        :disabled="isDisabled"
        v-model="valueVModel.itemType"
        @change="onItemTypeChange"
      >
        <el-option
          v-for="item in PROP_TYPE_OPTIONS"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-input
        v-if="isShowValue"
        clearable
        placeholder="初始值"
        :disabled="isDisabled"
        v-model="valueVModel.value"
        @change="triggerUpdate"
      />
      <el-input
        clearable
        placeholder="备注"
        :disabled="isCommentDisabled"
        v-model="valueVModel.comment"
        @change="triggerUpdate"
      />
    </div>
    <DataPropDefineInput
      v-if="isShowItemPropDefines"
      :read-only="isReadonly"
      :disabled="disabled"
      :only-item-editable="isOnlyItemEditable"
      :only-comment-editable="onlyCommentEditable"
      :data-id="valueVModel._vid"
      v-model="valueVModel.itemDefines"
      @change="triggerUpdate"
    />
  </div>
</template>
<script lang="ts" setup>
import { generateVid } from '../../../common/utils'
import { computedVModel } from '../../../common/hooks'
import { DATA_VALUE_ITEM_FLAG, WidgetDataDefinePropDefine } from '../../designer-editor.type'
import DataPropDefineInput from './DataPropDefineInput.vue'

const valueItemFlag = DATA_VALUE_ITEM_FLAG

const PROP_TYPE_OPTIONS = [
  {
    value: 'string',
    label: '字符串'
  },
  {
    value: 'number',
    label: '数字'
  },
  {
    value: 'boolean',
    label: '布尔值'
  },
  {
    value: 'object',
    label: '对象'
  },
  {
    value: 'array',
    label: '数组'
  },
  {
    value: 'undefined',
    label: '未定义'
  }
]

export interface PropDefineInputProps {
  modelValue?: WidgetDataDefinePropDefine
  readOnly?: boolean
  disabled?: boolean
  onlyItemEditable?: boolean
  onlyCommentEditable?: boolean
}

export type PropDefineInputEmits = {
  'update:modelValue': [val?: WidgetDataDefinePropDefine]
  change: [val?: WidgetDataDefinePropDefine]
}

const props = withDefaults(defineProps<PropDefineInputProps>(), {
  modelValue: () => ({ _vid: generateVid() })
})

const emits = defineEmits<PropDefineInputEmits>()

const getPropTypeLabel = (value?: string) => {
  return PROP_TYPE_OPTIONS.filter((i) => i.value === value)[0]?.label ?? 'undefined'
}
const typeLabel = computed(() => getPropTypeLabel(valueVModel.value.type))
const itemTypeLabel = computed(() => getPropTypeLabel(valueVModel.value.itemType))
const isUndefined = computed(() => !valueVModel.value.type || valueVModel.value.type == 'undefined')
const isShowItemType = computed(() => valueVModel.value?.type == 'array')
const isDisabled = computed(() => props.disabled || props.onlyCommentEditable)
const isCommentDisabled = computed(() => props.disabled)
const isShowItemPropDefines = computed(() => {
  const type = valueVModel.value?.type
  const itemType = valueVModel.value?.itemType
  return (
    type == 'object' ||
    (type == 'array' && itemType == 'object') ||
    (type == 'array' && itemType == 'array')
  )
})
const isOnlyItemEditable = computed(() => {
  const type = valueVModel.value?.type
  const itemType = valueVModel.value?.itemType
  return type == 'array' && itemType == 'array'
})
const isShowValue = computed(() => !isShowItemPropDefines.value)
const isReadonly = computed(() => props.readOnly)

const { valueVModel, triggerUpdate } = computedVModel({
  get() {
    return props.modelValue
  },
  set(val?: WidgetDataDefinePropDefine) {
    emits('update:modelValue', val)
    emits('change', val)
  }
})
const onTypeChange = () => {
  valueVModel.value.itemType = undefined
  valueVModel.value.itemDefines = undefined
  triggerUpdate()
}

const onItemTypeChange = () => {
  if (valueVModel.value.itemType == 'array') {
    valueVModel.value.itemDefines = [{ _vid: generateVid(), name: '-', type: 'array' }]
  } else {
    valueVModel.value.itemDefines = undefined
  }
  triggerUpdate()
}
</script>
<style lang="scss" scoped></style>
