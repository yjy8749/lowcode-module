<template>
  <div class="flex flex-col gap-2">
    <template v-if="!onlyFieldEditable">
      <!-- 表 ID -->
      <el-input :disabled="disabled" v-model="valueVModel.id">
        <template #prefix> <span> 表ID </span> </template>
        <template #suffix>
          <span @click="toggleValidSwitch">
            <span :class="{ 'c-[--el-color-primary] font-bold': isEnableTableValid }">
              动态生效
            </span>
            <span> / </span>
            <span :class="{ 'c-[--el-color-primary] font-bold': !isEnableTableValid }">
              一直有效
            </span>
          </span>
        </template>
      </el-input>

      <!-- 表 描述 -->
      <el-input clearable :disabled="disabled" v-model="valueVModel.desc">
        <template #prefix> <span> 表描述 </span> </template>
      </el-input>

      <div class="flex items-center gap-4">
        <TextLabel label="多租户支持" />
        <el-switch
          size="small"
          :disabled="disabled"
          :model-value="!valueVModel.disableTenant"
          @update:model-value="(val) => (valueVModel.disableTenant = !val)"
        />
        <span></span>
        <TextLabel label="逻辑删除支持" />
        <el-switch
          size="small"
          :disabled="disabled"
          :model-value="!valueVModel.disableLogicDelete"
          @update:model-value="(val) => (valueVModel.disableLogicDelete = !val)"
        />
      </div>
      <!-- 查询数据表 -->
      <LowcodeCard name="查询数据表" tips="输入数据表名或子查询, 查询数据">
        <AceEditor lang="sql" :height="60" :readonly="disabled" v-model="fromTableValue" />
      </LowcodeCard>

      <!-- 副表关联类型 -->
      <el-input v-if="!isMainTable" :disabled="disabled" v-model="joinOnValue">
        <template #prefix>
          <span> {{ isLeftJoinOn ? 'Left Join On' : 'Join On' }} </span>
        </template>
        <template #suffix>
          <span @click="toggleJoinType">
            <span :class="{ 'c-[--el-color-primary] font-bold': !isLeftJoinOn }"> Inner </span>
            <span> / </span>
            <span :class="{ 'c-[--el-color-primary] font-bold': isLeftJoinOn }"> Left </span>
          </span>
        </template>
      </el-input>

      <!-- 数据表有效性验证 -->
      <QueryXmlBeanInput
        v-if="isEnableTableValid"
        name="表有效性验证配置"
        tips="查询时验证数据表是否有效, 主表仅生效一个"
        :disabled="disabled"
        :default-js-function="defaultTableValid"
        v-model="valueVModel.validTestValue"
        @change="triggerUpdate"
      />
    </template>
    <!-- 数据表字段配置 -->
    <QueryXmlTableFieldArrayValueInput :disabled="disabled" v-model="valueFieldListVModel" />
  </div>
</template>
<script lang="ts" setup>
import { isNullOrUnDef } from '@/utils/is'
import LowcodeCard from '../../common/LowcodeCard.vue'
import AceEditor from '../../ace-editor/index.vue'
import { QueryTable, QueryField } from '../querier-editor.type'
import QueryXmlTableFieldArrayValueInput from './QueryXmlTableFieldArrayValueInput.vue'
import QueryXmlBeanInput from './QueryXmlBeanInput.vue'
import { defaultTableValid } from '../querier-editor.utils'
import { computedVModel } from '../../common/hooks'
import TextLabel from '../../common/TextLabel.vue'

export interface QueryXmlTableValueInputProps {
  isMainTable?: boolean
  onlyFieldEditable?: boolean
  disabled?: boolean
  modelValue?: QueryTable
}

export type QueryXmlTableValueInputEmits = {
  'update:modelValue': [val?: QueryTable]
  change: [val?: QueryTable]
}

const props = defineProps<QueryXmlTableValueInputProps>()

const emits = defineEmits<QueryXmlTableValueInputEmits>()

const { valueVModel, triggerUpdate } = computedVModel({
  get() {
    return props.modelValue ?? {}
  },
  set(val?: QueryTable) {
    emits('update:modelValue', val)
    emits('change', val)
  }
})

// 是否开启数据表动态验证
const isEnableTableValid = computed(() => !isNullOrUnDef(valueVModel.value.validTestValue))

const toggleValidSwitch = () => {
  if (!props.disabled) {
    if (isEnableTableValid.value) {
      valueVModel.value.validTestValue = undefined
    } else {
      valueVModel.value.validTestValue = { value: defaultTableValid() }
    }
    triggerUpdate()
  }
}

// 查询数据表
const fromTableValue = computed({
  get() {
    return valueVModel.value.querySql?.value ?? valueVModel.value.table
  },
  set(value?: string) {
    if (!isNullOrUnDef(value) && value.toLowerCase().includes('select')) {
      valueVModel.value.querySql = { value }
      valueVModel.value.table = undefined
    } else {
      valueVModel.value.querySql = undefined
      valueVModel.value.table = value
    }
    triggerUpdate()
  }
})

// 副表关联类型
const isLeftJoinOn = computed(() => !isNullOrUnDef(valueVModel.value.leftJoinOn))

const joinOnValue = computed({
  get() {
    return valueVModel.value.leftJoinOn ?? valueVModel.value.joinOn
  },
  set(value?: string) {
    if (isLeftJoinOn.value) {
      valueVModel.value.joinOn = undefined
      valueVModel.value.leftJoinOn = value
    } else {
      valueVModel.value.joinOn = value
      valueVModel.value.leftJoinOn = undefined
    }
    triggerUpdate()
  }
})

const toggleJoinType = () => {
  if (!props.disabled) {
    if (isLeftJoinOn.value) {
      valueVModel.value.joinOn = valueVModel.value.leftJoinOn ?? ''
      valueVModel.value.leftJoinOn = undefined
    } else {
      valueVModel.value.leftJoinOn = valueVModel.value.joinOn ?? ''
      valueVModel.value.joinOn = undefined
    }
    triggerUpdate()
  }
}

// 数据表字段
const valueFieldListVModel = computed({
  get() {
    return valueVModel.value.queryFieldList ?? []
  },
  set(val?: QueryField[]) {
    valueVModel.value.queryFieldList = val
    triggerUpdate()
  }
})
</script>

<style lang="scss" scoped></style>
