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
      :collapse-tags-tooltip="true"
      :max-collapse-tags="maxCollapseTags"
      :placeholder="placeholder"
      :filterable="filterable"
      :remote="remote"
      :remote-method="selectRemoteLoad"
      :loading="loading"
      v-model="valueVModel"
      @clear="onFieldClear"
    >
      <template v-if="isLoading('prefix')" #prefix>
        <Icon icon="ep:loading" class="animate-spin animate-duration-3000" />
      </template>
      <el-option
        v-for="opt in selectOptions"
        :key="opt.label"
        :label="opt.label"
        :value="opt.value"
        :disabled="opt.disabled"
      />
    </el-select>
    <el-tree-select
      v-else-if="inputType === 'tree-select'"
      clearable
      value-key="id"
      node-key="id"
      :multiple="multiple"
      :collapse-tags="collapseTags"
      :collapse-tags-tooltip="true"
      :max-collapse-tags="maxCollapseTags"
      :placeholder="placeholder"
      :check-strictly="checkStrictly"
      :lazy="lazy"
      :accordion="accordion"
      :filterable="filterable"
      :props="defaultProps"
      :data="treeDataOptions"
      :load="treeDataLazyLoad"
      :filter-method="treeDataFilterMethod"
      :loading="loading"
      v-model="valueVModel"
      @clear="onFieldClear"
    >
      <template v-if="isLoading('prefix')" #prefix>
        <Icon icon="ep:loading" class="animate-spin animate-duration-3000" />
      </template>
    </el-tree-select>
    <el-radio-group v-else-if="inputType === 'radio'" v-model="valueVModel">
      <template v-if="loading">
        <Icon icon="ep:loading" class="animate-spin animate-duration-3000" />
      </template>
      <template v-else-if="isEmpty(radioCheckboxOptions)">
        <div class="text-12px c-[--el-color-danger]">未配置选项</div>
      </template>
      <template v-else-if="props.showAsButton">
        <el-radio-button
          v-for="opt in radioCheckboxOptions"
          :key="opt.label"
          :value="opt.value"
          :disabled="opt.disabled"
          @click.stop.prevent="() => onRadioOptionClick(opt)"
        >
          <div class="flex items-center gap-1">
            <Icon v-if="opt.icon" :icon="opt.icon" />
            <span v-if="!props.onlyIcon">{{ opt.label }}</span>
          </div>
        </el-radio-button>
      </template>
      <template v-else>
        <el-radio
          v-for="opt in radioCheckboxOptions"
          :key="opt.label"
          :value="opt.value"
          :disabled="opt.disabled"
          @click.stop.prevent="() => onRadioOptionClick(opt)"
        >
          <div class="flex items-center gap-1">
            <Icon v-if="opt.icon" :icon="opt.icon" />
            <span v-if="!props.onlyIcon">{{ opt.label }}</span>
          </div>
        </el-radio>
      </template>
    </el-radio-group>
    <el-checkbox-group v-else-if="inputType === 'checkbox'" v-model="valueVModel">
      <template v-if="loading">
        <Icon icon="ep:loading" class="animate-spin animate-duration-3000" />
      </template>
      <template v-else-if="isEmpty(radioCheckboxOptions)">
        <div class="text-12px c-[--el-color-danger]">未配置选项</div>
      </template>
      <template v-else-if="props.showAsButton">
        <el-checkbox-button
          v-for="opt in radioCheckboxOptions"
          :key="opt.label"
          :value="opt.value"
          :disabled="opt.disabled"
          @click.stop.prevent="() => onRadioOptionClick(opt)"
        >
          <div class="flex items-center gap-1">
            <Icon v-if="opt.icon" :icon="opt.icon" />
            <span v-if="!props.onlyIcon">{{ opt.label }}</span>
          </div>
        </el-checkbox-button>
      </template>
      <template v-else>
        <el-checkbox
          v-for="opt in radioCheckboxOptions"
          :key="opt.label"
          :value="opt.value"
          :disabled="opt.disabled"
          @click.stop.prevent="() => onRadioOptionClick(opt)"
        >
          <div class="flex items-center gap-1">
            <Icon v-if="opt.icon" :icon="opt.icon" />
            <span v-if="!props.onlyIcon">{{ opt.label }}</span>
          </div>
        </el-checkbox>
      </template>
    </el-checkbox-group>
    <el-switch
      v-else-if="inputType === 'switch'"
      :loading="loading"
      :width="width"
      :active-value="activeValue"
      :inactive-value="inactiveValue"
      :active-text="activeText"
      :inactive-text="inactiveText"
      v-model="valueVModel"
    >
      <template v-if="activeIcon" #active-action>
        <Icon :icon="activeIcon" />
      </template>
      <template v-if="inactiveIcon" #inactive-action>
        <Icon :icon="inactiveIcon" />
      </template>
    </el-switch>
    <el-date-picker
      v-else-if="inputType === 'date-picker'"
      class="!w-full"
      clearable
      editable
      :placeholder="placeholder"
      :type="type"
      :format="format"
      :value-format="valueFormat"
      :default-time="datePickerDefaultTime"
      :start-placeholder="startPlaceholder"
      :end-placeholder="endPlaceholder"
      :rangeSeparator="rangeSeparator"
      :shortcuts="datePickerShortcuts"
      :disabled-date="datePickerDisabledDate"
      :prefix-icon="datePickerPrefixIcon"
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
    <el-autocomplete
      v-else-if="inputType === 'autocomplete'"
      clearable
      :placeholder="placeholder"
      :fetch-suggestions="fetchSuggestionsLoad"
      v-model.trim="valueVModel"
      @clear="onFieldClear"
    />
    <el-cascader
      v-else-if="inputType === 'cascader'"
      class="!w-full"
      clearable
      :collapse-tags="collapseTags"
      :collapse-tags-tooltip="true"
      :max-collapse-tags="maxCollapseTags"
      :placeholder="placeholder"
      :show-all-levels="showAllLevels"
      :filterable="filterable"
      :props="cascaderProps"
      :before-filter="cascaderBeforeFilter"
      :options="cascaderOptions"
      v-model="valueVModel"
      @clear="onFieldClear"
      @visible-change="onCascaderVisibleChange"
    >
      <template v-if="isLoading('prefix')" #prefix>
        <Icon icon="ep:loading" class="animate-spin animate-duration-3000" />
      </template>
      <template v-if="loading" #empty>
        <Icon icon="ep:loading" class="animate-spin animate-duration-3000" />
      </template>
    </el-cascader>
  </el-form-item>
</template>
<script lang="ts" setup>
import { isNullOrUnDef, isEmpty, isFunction } from '@/utils/is'
import { computedVModel, useScopeLoading } from '../../common/hooks'
import TextLabel from '../../common/TextLabel.vue'
import { ALL_OPTIONS_VALUE, QuerierTableSearchFieldProps } from '../querier-table.type'
import { getStrDictOptions } from '@/utils/dict'
import { defaultProps, handleTree } from '@/utils/tree'
import { useDebounceFn } from '@vueuse/core'
import Icon from '@/components/Icon/src/Icon.vue'

const ALL_OPTION_ITEM = { label: '全部', value: ALL_OPTIONS_VALUE }

const isType = (...types: string[]) => {
  return types.includes(props.type ?? '')
}

const refreshFlag = ref(true)

const refresh = () => {
  refreshFlag.value = false
  nextTick(() => {
    refreshFlag.value = true
  })
}

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

// 组件 loading
const { loading, isLoading, callWithLoading } = useScopeLoading()

// select

const selectOptions = ref<any[]>([ALL_OPTION_ITEM])

const selectDictLoad = async () => {
  if (!isNullOrUnDef(props.dictType)) {
    selectOptions.value = [ALL_OPTION_ITEM, ...getStrDictOptions(props.dictType)]
  }
}

const selectRemoteLoad = async (query?: string) => {
  await callWithLoading(async () => {
    if (props.remoteMethod) {
      selectOptions.value = [ALL_OPTION_ITEM, ...(await props.remoteMethod(query))]
    }
  })
}

// tree-select

const treeDataList = ref<any[]>()

const treeDataOptions = computed(() => handleTree(treeDataList.value ?? []))

const treeDataLazyLoad = async (node, resolve, reject) => {
  try {
    resolve((await props.loadData?.(node)) ?? [])
  } catch (e) {
    console.error(e)
    reject()
  }
}

const treeDataLoad = async () => {
  await callWithLoading(async () => {
    treeDataList.value = (await props.loadData?.({ level: 0 })) ?? []
  })
}

const treeDataFilterMethod = (query?: string) => {
  callWithLoading(async () => {
    if (isEmpty(query)) {
      await treeDataLoad()
    } else {
      treeDataList.value = (await props.filterMethod?.(query)) ?? []
    }
  })
}

// radio or checkbox

const radioCheckboxOptions = ref<any[]>([])

const radioCheckboxDictLoad = async () => {
  if (!isNullOrUnDef(props.dictType)) {
    radioCheckboxOptions.value = getStrDictOptions(props.dictType)
  }
}

const radioCheckboxRemoteLoad = async (query?: string) => {
  await callWithLoading(async () => {
    if (props.remoteMethod) {
      radioCheckboxOptions.value = await props.remoteMethod(query)
    }
  })
}

const onRadioOptionClick = (item: any) => {
  if (!item.disabled) {
    if (props.inputType == 'radio') {
      valueVModel.value = valueVModel.value == item.value ? undefined : item.value
    } else if (props.inputType == 'checkbox') {
      if (valueVModel.value?.some((e) => e == item.value)) {
        valueVModel.value = valueVModel.value.filter((e) => e != item.value)
      } else {
        valueVModel.value = [...(valueVModel.value ?? []), item.value]
      }
    }
  }
}

// switch

const activeValue = ref(true)

const inactiveValue = ref(false)

const switchValueLoad = async () => {
  await callWithLoading(async () => {
    if (props.activeValue) {
      if (isFunction(props.activeValue)) {
        activeValue.value = await props.activeValue()
      } else {
        activeValue.value = props.activeValue
      }
    }
    if (props.inactiveValue) {
      if (isFunction(props.inactiveValue)) {
        inactiveValue.value = await props.inactiveValue()
      } else {
        inactiveValue.value = props.inactiveValue
      }
    }
  })
}

// date-picker

const datePickerPrefixIcon = computed(() => {
  if (isLoading('prefix')) {
    return h(Icon, { icon: 'ep:loading', class: 'animate-spin animate-duration-3000' })
  }
})

const setTimeToDate = (timeStr, baseDate = new Date()) => {
  if (isEmpty(timeStr)) {
    timeStr = '00:00:00'
  }
  const [hours, minutes, seconds] = timeStr.split(':').map(Number)
  const d = new Date(baseDate)
  d.setHours(hours, minutes, seconds, 0)
  return d
}

const datePickerDefaultTime = computed<any>(() => {
  if (isType('date', 'datetime', 'daterange', 'datetimerange')) {
    if (isType('daterange', 'datetimerange')) {
      return [setTimeToDate(props.startDefaultTime), setTimeToDate(props.endDefaultTime)]
    } else {
      return setTimeToDate(props.defaultTime)
    }
  }
})

const firstDatePickerChoiceDate = ref<any>()

const onDatePickerCalendarChange = (dates) => {
  firstDatePickerChoiceDate.value = dates?.[0]?.getTime()
}
const datePickerDisabledDate = (date: Date) => {
  const time = date.getTime()
  const now = Date.now()
  if (isType('date', 'datetime', 'dates', 'daterange', 'datetimerange')) {
    if (
      !isNullOrUnDef(props.beforeMinDays) &&
      time < now - props.beforeMinDays * 24 * 3600 * 1000
    ) {
      return true
    }
    if (!isNullOrUnDef(props.afterMaxDays) && time > now + props.afterMaxDays * 24 * 3600 * 1000) {
      return true
    }
    if (!isNullOrUnDef(props.maxDaysRange) && isType('daterange', 'datetimerange')) {
      if (firstDatePickerChoiceDate.value) {
        const range = props.maxDaysRange * 24 * 3600 * 1000
        const minTime = firstDatePickerChoiceDate.value - range
        const maxTime = firstDatePickerChoiceDate.value + range
        if (time < minTime || time > maxTime) {
          return true
        }
      }
    }
  }
  return props.disabledDate?.(date)
}

const datePickerShortcuts = ref<any[]>()

const datePickerShortcutsLoad = async () => {
  if (props.shortcuts && isFunction(props.shortcuts)) {
    await callWithLoading(async () => {
      datePickerShortcuts.value = await props.shortcuts?.()
      refresh()
    })
  }
}

// number-range
const minNumberValue = ref<number | undefined>()
const maxNumberValue = ref<number | undefined>()

const onNumberRangeChange = () => {
  valueVModel.value = [minNumberValue.value, maxNumberValue.value]
}

// autocomplete
const fetchSuggestionsLoad = async (query: string) => {
  return (await props.fetchSuggestions?.(query)) ?? []
}

// cascader
const cascaderProps = computed(() => {
  return {
    emitPath: props.emitPath,
    multiple: props.multiple,
    checkStrictly: props.checkStrictly,
    lazy: props.lazy,
    lazyLoad: cascaderOptionsLazyLoad
  }
})

const cascaderOptions = ref<any[]>([])

const isCascaderVisible = ref(false)

const onCascaderVisibleChange = (val: boolean) => {
  isCascaderVisible.value = val
}

const cascaderOptionsLoad = async () => {
  await callWithLoading(async () => {
    if (props.loadData) {
      cascaderOptions.value = await props.loadData()
    }
  })
}

const cascaderOptionsLazyLoad = async (node, resolve) => {
  await callWithLoading(
    'prefix',
    async () => {
      resolve((await props.loadData?.(node)) ?? [])
    },
    isCascaderVisible.value
  )
}

const cascaderFilterMethod = useDebounceFn(async (query?: string) => {
  await callWithLoading(async () => {
    cascaderOptions.value = []
    await nextTick(async () => {
      cascaderOptions.value = (await props.filterMethod?.(query)) ?? []
    })
  })
})
const cascaderBeforeFilter = (query?: string) => {
  cascaderFilterMethod(query)
  return false
}

onMounted(() => {
  callWithLoading('prefix', async () => {
    if (props.inputType == 'select') {
      if (props.remote) {
        await selectRemoteLoad()
      } else {
        await selectDictLoad()
      }
    } else if (props.inputType == 'tree-select') {
      if (!props.lazy) {
        await treeDataLoad()
      }
    } else if (props.inputType == 'radio' || props.inputType == 'checkbox') {
      if (props.remote) {
        await radioCheckboxRemoteLoad()
      } else {
        await radioCheckboxDictLoad()
      }
    } else if (props.inputType == 'switch') {
      await switchValueLoad()
    } else if (props.inputType == 'date-picker') {
      await datePickerShortcutsLoad()
    } else if (props.inputType == 'cascader') {
      if (!props.lazy) {
        await cascaderOptionsLoad()
      }
    }
  })
})
</script>
