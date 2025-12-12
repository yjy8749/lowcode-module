<!-- index.render.vue -->
<template>
  <ElFormItemWrapper v-bind="formItemAttrs">
    <el-time-picker
      v-bind="formInputAttrs"
      :class="{ '!w-full': fullWidth }"
      :defaultValue="defaultValue"
      :disabled-hours="disabledHours"
      :disabled-minutes="disabledMinutes"
      :disabled-seconds="disabledSeconds"
      v-model="valueModel"
    />
  </ElFormItemWrapper>
</template>
<script lang="ts" setup>
import ElFormItemWrapper from '../../../../common/ElFormItemWrapper.vue'
import { useWidget, type WidgetRenderProps } from '../../hooks'
import { useFormItemWidget } from '../../hooks/useFormItemWidget'
import { isEmpty } from '@/utils/is'

const props = defineProps<WidgetRenderProps>()

const { formItemAttrs, valueModel, useFormInputAttrs, usePropValue, toEvalFunction } =
  useFormItemWidget(useWidget(props))

const formInputAttrs = computed(() =>
  useFormInputAttrs({
    omit: [
      'fullWidth',
      'defaultTime',
      'startDefaultTime',
      'endDefaultTime',
      'disabledHours',
      'disabledMinutes',
      'disabledSeconds'
    ]
  })
)

const fullWidth = computed(() => usePropValue('fullWidth'))

const setTimeToDate = (timeStr, baseDate = new Date()) => {
  if (isEmpty(timeStr)) {
    timeStr = '00:00:00'
  }
  const [hours, minutes, seconds] = timeStr.split(':').map(Number)
  const d = new Date(baseDate)
  d.setHours(hours, minutes, seconds, 0)
  return d
}

const defaultValue = computed(() => {
  if (formInputAttrs.value.isRange) {
    return [
      setTimeToDate(usePropValue('startDefaultTime')),
      setTimeToDate(usePropValue('endDefaultTime'))
    ]
  }
  return setTimeToDate(usePropValue('defaultTime'))
})

const disabledHours = computed(() => {
  const disabledFn = toEvalFunction(usePropValue('disabledHours'))
  return () => {
    return disabledFn?.()
  }
})

const disabledMinutes = computed(() => {
  const disabledFn = toEvalFunction(usePropValue('disabledMinutes'))
  return (h) => {
    return disabledFn?.(h)
  }
})

const disabledSeconds = computed(() => {
  const disabledFn = toEvalFunction(usePropValue('disabledSeconds'))
  return (h, m) => {
    return disabledFn?.(h, m)
  }
})
</script>
