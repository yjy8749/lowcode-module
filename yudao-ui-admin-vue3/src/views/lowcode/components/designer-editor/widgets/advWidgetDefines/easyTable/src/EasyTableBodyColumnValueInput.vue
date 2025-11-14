<template>
  <div class="w-full flex gap-2">
    <div class="flex justify-center items-center" :style="fieldStyles[0]">
      <Icon
        v-if="!isDisabled"
        :class="{
          'c-[--el-color-primary]': !valueVModel.hidden
        }"
        :icon="valueVModel.hidden ? 'ep:hide' : 'ep:view'"
        @click="toggleHidden"
      />
    </div>
    <div :style="fieldStyles[1]">
      <el-input placeholder="列名称" clearable :disabled="isDisabled" v-model="valueVModel.label" />
    </div>
    <div :style="fieldStyles[2]">
      <el-input
        placeholder="列字段"
        clearable
        :disabled="isDisabled"
        v-model="valueVModel.prop"
        @change="onPropChange"
      />
    </div>
    <div :style="fieldStyles[3]">
      <FormatInputNumber
        :style="fieldStyles[3]"
        placeholder="列宽"
        symbol="px"
        :disabled="isDisabled"
        v-model="valueVModel.width"
      />
    </div>
    <div class="flex justify-center items-center" :style="fieldStyles[4]">
      <el-checkbox v-model="valueVModel.fixed" />
    </div>
    <div class="flex justify-center items-center" :style="fieldStyles[5]">
      <el-checkbox v-model="valueVModel.rowKey" />
    </div>
    <div :style="fieldStyles[6]">
      <el-input
        placeholder="字符串分割"
        clearable
        :disabled="isDisabled"
        v-model="valueVModel.splitChar"
      />
    </div>
    <div :style="fieldStyles[7]">
      <el-select
        placeholder="列类型"
        clearable
        :disabled="isDisabled"
        v-model="valueVModel.columnType"
        @change="onColumnTypeChange"
      >
        <el-option
          v-for="opt in columnTypeOptions"
          :key="opt.label"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>
    </div>
    <div :style="fieldStyles[8]">
      <el-select
        v-if="'datetime' == valueVModel.columnType"
        placeholder="日期格式"
        clearable
        :disabled="isDisabled"
        v-model="valueVModel.datetimeFormat"
        @change="onDatetimeFormatChange"
      >
        <el-option
          v-for="opt in datetimeFormatOptions"
          :key="opt.label"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>
      <el-input
        v-else-if="'dict' == valueVModel.columnType"
        placeholder="关联字段类型"
        clearable
        :disabled="isDisabled"
        v-model="valueVModel.dictType"
      />
      <el-input
        v-else
        placeholder="格式化模版 ${data} ${row.属性}"
        clearable
        :disabled="isDisabled"
        v-model="valueVModel.dataPattern"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
import FormatInputNumber from '../../../../components/propInput/FormatInputNumber.vue'
import { computedVModel } from '../../../../../common/hooks'
import { QuerierTableBodyColumnProps } from '../../../../../querier-table/querier-table.type'
import { isIndexColumn, isActionColumn } from '../../../../../querier-table/querier-table.utils'
import { calcDatetimeColumnWidth } from '../utils'

export interface EasyTableBodyColumnValueInputProps {
  fieldStyles?: string[]
  modelValue?: QuerierTableBodyColumnProps
}

export type EasyTableBodyColumnValueInputEmits = {
  'update:modelValue': [val?: QuerierTableBodyColumnProps]
  change: [val?: QuerierTableBodyColumnProps]
}

const props = withDefaults(defineProps<EasyTableBodyColumnValueInputProps>(), {
  fieldStyles: () => []
})

const emits = defineEmits<EasyTableBodyColumnValueInputEmits>()

const message = useMessage()

const { valueVModel } = computedVModel({
  get() {
    return props.modelValue ?? {}
  },
  set(val?: any) {
    emits('update:modelValue', val)
    emits('change', val)
  }
})

const isDisabled = computed(() => {
  return isIndexColumn(valueVModel.value) || isActionColumn(valueVModel.value)
})

const columnTypeOptions = [
  {
    label: '日期时间',
    value: 'datetime'
  },
  {
    label: '路由跳转',
    value: 'route'
  },
  {
    label: '超链接',
    value: 'link'
  },
  {
    label: '富文本',
    value: 'html'
  },
  {
    label: '数据字典',
    value: 'dict'
  },
  {
    label: '图片',
    value: 'image'
  }
]

const datetimeFormatOptions = [
  {
    label: 'YYYY-MM-DD HH:mm:ss',
    value: 'YYYY-MM-DD HH:mm:ss'
  },
  {
    label: 'YYYY-MM-DD HH:mm',
    value: 'YYYY-MM-DD HH:mm'
  },
  {
    label: 'YYYY-MM-DD',
    value: 'YYYY-MM-DD'
  },
  {
    label: 'MM-DD',
    value: 'MM-DD'
  },
  {
    label: 'HH:mm:ss',
    value: 'HH:mm:ss'
  },
  {
    label: 'HH:mm',
    value: 'HH:mm'
  }
]

const onColumnTypeChange = () => {
  if (valueVModel.value.columnType == 'image') {
    valueVModel.value.width = `65px`
  }
}

const onDatetimeFormatChange = () => {
  const width = calcDatetimeColumnWidth(valueVModel.value.datetimeFormat)
  valueVModel.value.width = `${width}px`
}

const onPropChange = () => {
  if (isDisabled.value) {
    message.error(`${valueVModel.value.prop}不能设置`)
    valueVModel.value.prop = ''
  }
}

const toggleHidden = () => {
  valueVModel.value.hidden = !valueVModel.value.hidden
}
</script>

<style lang="scss" scoped></style>
