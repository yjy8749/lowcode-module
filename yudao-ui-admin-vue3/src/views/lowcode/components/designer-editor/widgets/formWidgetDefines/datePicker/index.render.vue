<!-- index.render.vue -->
<template>
  <ElFormItemWrapper v-bind="formItemAttrs">
    <el-date-picker
      v-if="refreshFlag"
      v-bind="formInputAttrs"
      :class="{ '!w-full': fullWidth }"
      :prefix-icon="prefixIcon"
      :shortcuts="shortcutsOptions"
      :defaultTime="defaultTime"
      :disabled-date="disabledDate"
      v-model="valueModel"
      @calendar-change="onCalendarChange"
    />
  </ElFormItemWrapper>
</template>
<script lang="ts" setup>
import { isEmpty, isNullOrUnDef } from '@/utils/is'
import ElFormItemWrapper from '../../../../common/ElFormItemWrapper.vue'
import { useWidget, type WidgetRenderProps } from '../../hooks'
import { useFormItemWidget } from '../../hooks/useFormItemWidget'
import { useScopeLoading } from '../../../../common/hooks'
import Icon from '@/components/Icon/src/Icon.vue'

const props = defineProps<WidgetRenderProps>()

const refreshFlag = ref(true)
const refreshDatePicker = () => {
  refreshFlag.value = false
  nextTick(() => {
    refreshFlag.value = true
  })
}

const { loading, callWithLoading } = useScopeLoading()

const prefixIcon = computed(() => {
  if (loading.value) {
    return h(Icon, { icon: 'ep:loading', class: 'animate-spin animate-duration-3000' })
  }
})

const { formItemAttrs, valueModel, useFormInputAttrs, usePropValue, toEvalFunction } =
  useFormItemWidget(useWidget(props))

const formInputAttrs = computed(() =>
  useFormInputAttrs({
    omit: [
      'fullWidth',
      'defaultTime',
      'startDefaultTime',
      'endDefaultTime',
      'beforeMinDays',
      'afterMaxDays',
      'maxDaysRange',
      'disabledDate',
      'shortcuts'
    ]
  })
)

const fullWidth = computed(() => usePropValue('fullWidth'))

const isType = (...types: string[]) => {
  return types.includes(formInputAttrs.value.type)
}

const setTimeToDate = (timeStr, baseDate = new Date()) => {
  if (isEmpty(timeStr)) {
    timeStr = '00:00:00'
  }
  const [hours, minutes, seconds] = timeStr.split(':').map(Number)
  const d = new Date(baseDate)
  d.setHours(hours, minutes, seconds, 0)
  return d
}

const defaultTime = computed(() => {
  if (isType('date', 'datetime', 'daterange', 'datetimerange')) {
    if (isType('daterange', 'datetimerange')) {
      return [
        setTimeToDate(usePropValue('startDefaultTime')),
        setTimeToDate(usePropValue('endDefaultTime'))
      ]
    } else {
      return setTimeToDate(usePropValue('defaultTime'))
    }
  }
})

const firstChoiceDate = ref<any>()
const onCalendarChange = (dates) => {
  firstChoiceDate.value = dates?.[0]?.getTime()
}

const disabledDate = computed(() => {
  const beforeMinDays = usePropValue('beforeMinDays')
  const afterMaxDays = usePropValue('afterMaxDays')
  const maxDaysRange = usePropValue('maxDaysRange')
  const disabledDateFunction = toEvalFunction(usePropValue('disabledDate'))
  return (date: Date) => {
    const time = date.getTime()
    const now = Date.now()
    if (isType('date', 'datetime', 'dates', 'daterange', 'datetimerange')) {
      if (!isNullOrUnDef(beforeMinDays) && time < now - beforeMinDays * 24 * 3600 * 1000) {
        return true
      }
      if (!isNullOrUnDef(afterMaxDays) && time > now + afterMaxDays * 24 * 3600 * 1000) {
        return true
      }
      if (!isNullOrUnDef(maxDaysRange) && isType('daterange', 'datetimerange')) {
        if (firstChoiceDate.value) {
          const range = maxDaysRange * 24 * 3600 * 1000
          const minTime = firstChoiceDate.value - range
          const maxTime = firstChoiceDate.value + range
          if (time < minTime || time > maxTime) {
            return true
          }
        }
      }
    }
    return disabledDateFunction?.(date)
  }
})

const shortcutsOptions = ref<any[]>([])

const shortcuts = computed(() => toEvalFunction(usePropValue('shortcuts')))
const shortcutsLoadFunction = async () => {
  if (shortcuts.value) {
    await callWithLoading(async () => {
      shortcutsOptions.value = await shortcuts.value?.()
      refreshDatePicker()
    })
  }
}

onMounted(() => {
  shortcutsLoadFunction()
})
</script>
