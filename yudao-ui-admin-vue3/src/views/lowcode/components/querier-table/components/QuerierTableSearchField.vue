<template>
  <el-form-item>
    <template #label v-if="!isEmpty(label)">
      <text-label :label="label" :helps="helps" />
    </template>
    <el-input
      v-if="inputType === 'input'"
      clearable
      :placeholder="placeholder"
      v-model.trim="valueVModel"
      @clear="onFieldClear"
    />
    <el-select
      v-else-if="inputType === 'select'"
      clearable
      :multiple="multiple"
      :collapse-tags="collapseTags"
      :collapse-tags-tooltip="collapseTags"
      :max-collapse-tags="maxCollapseTags"
      :placeholder="placeholder"
      :filterable="filterable"
      :remote="remote"
      :remote-method="selectRemoteLoad"
      :loading="loading"
      v-model="valueVModel"
      @clear="onFieldClear"
    >
      <el-option
        v-for="opt in selectOptions"
        :key="opt.label"
        :label="opt.label"
        :value="opt.value"
      />
      <template #loading>
        <Icon icon="ep:loading" class="animate-spin animate-duration-3000" />
      </template>
    </el-select>
    <el-tree-select
      v-else-if="inputType === 'tree-select'"
      clearable
      value-key="id"
      node-key="id"
      :multiple="multiple"
      :collapse-tags="collapseTags"
      :collapse-tags-tooltip="collapseTags"
      :max-collapse-tags="maxCollapseTags"
      :placeholder="placeholder"
      :check-strictly="checkStrictly"
      :lazy="lazy"
      :props="defaultProps"
      :data="treeDataOptions"
      :load="treeDataLazyLoad"
      :filterable="filterable"
      :filter-method="treeDataFilterMethod"
      :accordion="accordion"
      :loading="loading"
      v-model="valueVModel"
      @clear="onFieldClear"
    >
      <template #loading>
        <Icon icon="ep:loading" class="animate-spin animate-duration-3000" />
      </template>
    </el-tree-select>
    <el-radio-group v-else-if="inputType === 'radio'" v-model="valueVModel">
      <template v-if="loading">
        <Icon icon="ep:loading" class="animate-spin animate-duration-3000" />
      </template>
      <template v-else>
        <el-radio
          v-for="opt in radioCheckboxOptions"
          :key="opt.label"
          :value="opt.value"
          @click="(e) => onRadioOptionClick(e, opt)"
        >
          {{ opt.label }}
        </el-radio>
      </template>
    </el-radio-group>
    <el-checkbox-group v-else-if="inputType === 'checkbox'" v-model="valueVModel">
      <template v-if="loading">
        <Icon icon="ep:loading" class="animate-spin animate-duration-3000" />
      </template>
      <template v-else>
        <el-checkbox v-for="opt in radioCheckboxOptions" :key="opt.label" :value="opt.value">
          {{ opt.label }}
        </el-checkbox>
      </template>
    </el-checkbox-group>
    <el-switch
      v-else-if="inputType === 'switch'"
      v-model="valueVModel"
      :active-value="activeValue ?? true"
      :inactive-value="inactiveValue ?? false"
    />
    <el-date-picker
      v-else-if="inputType === 'date-picker'"
      clearable
      editable
      :placeholder="placeholder"
      :type="datePickerType"
      :format="format"
      :value-format="valueFormat"
      :rangeSeparator="rangeSeparator"
      :start-placeholder="startPlaceholder"
      :end-placeholder="endPlaceholder"
      :disabled-date="datePickerDisabledDate"
      v-model="valueVModel"
      @clear="onFieldClear"
      @calendar-change="onDatePickerCalendarChange"
    />
    <div class="flex items-center gap-2 w-full" v-else-if="inputType == 'number-range'">
      <el-input-number
        placeholder="最小值"
        class="flex-1"
        controls-position="right"
        :min="minNumber"
        :max="maxNumber"
        :precision="precision ?? 0"
        v-model="minNumberValue"
        @change="onNumberRangeChange"
      />
      <el-text>到</el-text>
      <el-input-number
        placeholder="最大值"
        class="flex-1"
        controls-position="right"
        :min="minNumber"
        :max="maxNumber"
        :precision="precision ?? 0"
        v-model="maxNumberValue"
        @change="onNumberRangeChange"
      />
    </div>
  </el-form-item>
</template>
<script lang="ts" setup>
import { isNullOrUnDef, isEmpty } from '@/utils/is'
import { computedVModel } from '../../common/hooks'
import TextLabel from '../../common/TextLabel.vue'
import { ALL_OPTIONS_VALUE, QuerierTableSearchFieldProps } from '../querier-table.type'
import { getStrDictOptions } from '@/utils/dict'
import { defaultProps, handleTree } from '@/utils/tree'

const ALL_OPTION_ITEM = { label: '全部', value: ALL_OPTIONS_VALUE }

export type QuerierTableSearchFieldEmits = {
  'update:modelValue': [val?: any]
  change: [val?: any]
  clear: []
}

const props = defineProps<QuerierTableSearchFieldProps & { modelValue?: any }>()

const emits = defineEmits<QuerierTableSearchFieldEmits>()

const onFieldClear = () => {
  emits('clear')
}

const { valueVModel } = computedVModel({
  get() {
    return props.modelValue
  },
  set(val) {
    emits('update:modelValue', val)
    emits('change', val)
  }
})

const placeholder = computed(() => props.placeholder ?? `按${props.label}搜索`)

const loading = ref(false)

const callWithLoading = async (fn: () => Promise<any>) => {
  try {
    loading.value = true
    await fn()
  } finally {
    loading.value = false
  }
}

// select

const selectOptions = ref<any[]>([ALL_OPTION_ITEM])

const selectDictLoad = () => {
  if (!isNullOrUnDef(props.dictType)) {
    selectOptions.value = [ALL_OPTION_ITEM]
    selectOptions.value.push(...getStrDictOptions(props.dictType))
  }
}

const selectRemoteLoad = async (query?: string) => {
  await callWithLoading(async () => {
    selectOptions.value = [ALL_OPTION_ITEM]
    if (props.remoteMethod) {
      selectOptions.value.push(...(await props.remoteMethod(query)))
    }
  })
}

// tree-select

const treeDataList = ref<any[]>([])

const treeDataOptions = computed(() => handleTree(treeDataList.value))

const treeDataLazyLoad = async (node, resolve, reject) => {
  try {
    resolve((await props.load?.(node)) ?? [])
  } catch (e) {
    console.error(e)
    reject()
  }
}

const treeDataLoad = async () => {
  await callWithLoading(async () => {
    treeDataList.value = (await props.load?.()) ?? []
  })
}

const treeDataFilterMethod = (query?: string) => {
  callWithLoading(async () => {
    treeDataList.value = []
    nextTick(async () => {
      if (isEmpty(query)) {
        treeDataList.value = (await props.load?.()) ?? []
      } else {
        treeDataList.value = (await props.filterMethod?.(query)) ?? []
      }
    })
  })
}

// radio or checkbox

const radioCheckboxOptions = ref<any[]>([])

const radioCheckboxDictLoad = () => {
  if (!isNullOrUnDef(props.dictType)) {
    radioCheckboxOptions.value = []
    radioCheckboxOptions.value.push(...getStrDictOptions(props.dictType))
  }
}

const radioCheckboxRemoteLoad = async (query?: string) => {
  await callWithLoading(async () => {
    radioCheckboxOptions.value = []
    if (props.remoteMethod) {
      radioCheckboxOptions.value.push(...(await props.remoteMethod(query)))
    }
  })
}

const onRadioOptionClick = (e: MouseEvent, item: any) => {
  e.preventDefault()
  if (valueVModel.value == item.value) {
    valueVModel.value = undefined
  } else {
    valueVModel.value = item.value
  }
}

// date-picker

const isRangeDatePicker = computed(() => {
  return ['daterange', 'datetimerange', 'monthrange', 'yearrange'].includes(
    props.datePickerType ?? ''
  )
})

const datePickerChoiceDate = ref<any>()

const onDatePickerCalendarChange = (dates) => {
  if (dates && dates[0]) {
    datePickerChoiceDate.value = dates[0].getTime()
  } else {
    datePickerChoiceDate.value = undefined
  }
}
const datePickerDisabledDate = (date: Date) => {
  const time = date.getTime()
  const now = Date.now() - 24 * 3600 * 1000
  if (!isNullOrUnDef(props.beforeMinDays) && time < now - props.beforeMinDays * 24 * 3600 * 1000) {
    return true
  }
  if (!isNullOrUnDef(props.afterMaxDays) && time > now + props.afterMaxDays * 24 * 3600 * 1000) {
    return true
  }
  if (isRangeDatePicker.value && !isNullOrUnDef(props.maxDaysRange)) {
    if (datePickerChoiceDate.value) {
      const range = props.maxDaysRange * 24 * 3600 * 1000
      const minTime = datePickerChoiceDate.value - range
      const maxTime = datePickerChoiceDate.value + range
      return time < minTime || time > maxTime
    }
    return props.disabledDate?.(date)
  }
  return props.disabledDate?.(date)
}

// number-range

const minNumberValue = ref<number | undefined>()
const maxNumberValue = ref<number | undefined>()

const onNumberRangeChange = () => {
  valueVModel.value = [minNumberValue.value, maxNumberValue.value]
}

onMounted(async () => {
  if (props.inputType == 'select') {
    if (props.remote) {
      if (!props.filterable) {
        selectRemoteLoad()
      }
    } else {
      selectDictLoad()
    }
  } else if (props.inputType == 'tree-select') {
    if (!props.lazy) {
      if (!props.filterable) {
        treeDataLoad()
      }
    }
  } else if (props.inputType == 'radio' || props.inputType == 'checkbox') {
    if (props.remote) {
      radioCheckboxRemoteLoad()
    } else {
      radioCheckboxDictLoad()
    }
  }
})
</script>
