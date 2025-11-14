<template>
  <ArrayValueInput
    :group="{ pull: false, put: false }"
    :headers="fieldHeaders"
    :removeable="(val) => !isIndexColumn(val) && !isActionColumn(val)"
    v-model="valueVModel"
    @add="handleAdd"
    @remove="handleRemove"
  >
    <template #item="{ index }">
      <EasyTableBodyColumnValueInput
        :field-styles="fieldStyles"
        v-model="valueVModel[index]"
        @change="triggerUpdate"
      />
    </template>
  </ArrayValueInput>
</template>

<script setup lang="ts">
import ArrayValueInput from '../../../../../common/ArrayValueInput.vue'
import { computedVModel } from '../../../../../common/hooks'
import EasyTableBodyColumnValueInput from './EasyTableBodyColumnValueInput.vue'
import {
  COLUMN_ACTION_PROP,
  COLUMN_INDEX_PROP,
  QuerierTableBodyColumnProps
} from '../../../../../querier-table/querier-table.type'
import { isIndexColumn, isActionColumn } from '../../../../../querier-table/querier-table.utils'

export interface EasyTableSearchFieldArrayValueInputProps {
  modelValue?: QuerierTableBodyColumnProps[]
}

export type EasyTableSearchFieldArrayValueInputEmits = {
  'update:modelValue': [val?: QuerierTableBodyColumnProps[]]
  change: [val?: QuerierTableBodyColumnProps[]]
}

const defaultStyle = 'width: 115px'
const flexStyle = 'flex:1'

const fieldHeaders = [
  {
    label: '显示',
    style: 'width: 30px'
  },
  {
    label: '列名称',
    style: defaultStyle
  },
  {
    label: '列字段',
    helps: `${COLUMN_INDEX_PROP} 为序号列, ${COLUMN_ACTION_PROP} 为操作列`,
    style: defaultStyle
  },
  {
    label: '列宽度',
    style: defaultStyle
  },
  {
    label: '固定',
    style: 'width: 30px'
  },
  {
    label: '主键',
    helps: '用于唯一确定一条数据',
    style: 'width: 50px'
  },
  {
    label: '数据分割',
    helps: '配置后,自动分割字符串',
    style: defaultStyle
  },
  {
    label: '列类型',
    style: defaultStyle
  },
  {
    label: '列格式',
    helps: '根据列类型不同, 配置参数, 模版变量: 列数据 ${data}, 行数据 ${row.id}',
    style: flexStyle
  }
]

const fieldStyles = computed(() => fieldHeaders.map((e) => e.style))

const message = useMessage()

const props = withDefaults(defineProps<EasyTableSearchFieldArrayValueInputProps>(), {
  modelValue: () => []
})

const emits = defineEmits<EasyTableSearchFieldArrayValueInputEmits>()

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

const handleRemove = async (index: number) => {
  const col = valueVModel.value[index]
  if (isIndexColumn(col) || isActionColumn(col)) {
    await message.confirm('是否确认删除列')
  }
  valueVModel.value = valueVModel.value.toSpliced(index, 1)
}
</script>

<style scoped lang="scss"></style>
