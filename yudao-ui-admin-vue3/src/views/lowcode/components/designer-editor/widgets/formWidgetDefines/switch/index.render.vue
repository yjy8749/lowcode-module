<!-- index.render.vue -->
<template>
  <ElFormItemWrapper v-bind="formItemAttrs">
    <el-switch
      v-bind="formInputAttrs"
      :active-value="activeValue"
      :inactive-value="inactiveValue"
      :loading="loading"
      :before-change="beforeChangeHandler"
      v-model="valueModel"
    >
      <template v-if="activeIcon" #active-action>
        <Icon :icon="activeIcon" />
      </template>
      <template v-if="inactiveIcon" #inactive-action>
        <Icon :icon="inactiveIcon" />
      </template>
    </el-switch>
  </ElFormItemWrapper>
</template>
<script lang="ts" setup>
import ElFormItemWrapper from '../../../../common/ElFormItemWrapper.vue'
import { useWidget, type WidgetRenderProps } from '../../hooks'
import { useFormItemWidget } from '../../hooks/useFormItemWidget'
import { useScopeLoading } from '../../../../common/hooks'

const props = defineProps<WidgetRenderProps>()

const { loading, callWithLoading } = useScopeLoading()

const { formItemAttrs, valueModel, useFormInputAttrs, usePropValue, toEvalFunction } =
  useFormItemWidget(useWidget(props))

const formInputAttrs = computed(() =>
  useFormInputAttrs({
    omit: ['activeIcon', 'inactiveIcon', 'activeValue', 'inactiveValue', 'beforeChange']
  })
)

const activeIcon = computed(() => usePropValue('activeIcon'))

const inactiveIcon = computed(() => usePropValue('inactiveIcon'))

const beforeChange = computed(() => toEvalFunction(usePropValue('beforeChange')))

const beforeChangeHandler = () => {
  return new Promise(async (resolve, reject) => {
    let result = true
    if (beforeChange.value) {
      await callWithLoading(async () => {
        result = await beforeChange.value?.(valueModel.value)
      })
    }
    result ? resolve(result) : reject(result)
  })
}

const activeValueFunction = computed(() => toEvalFunction(usePropValue('activeValue')))

const inactiveValueFunction = computed(() => toEvalFunction(usePropValue('inactiveValue')))

const activeValue = ref(true)

const inactiveValue = ref(false)

onMounted(async () => {
  if (activeValueFunction.value) {
    activeValue.value = await activeValueFunction.value()
  }
  if (inactiveValueFunction.value) {
    inactiveValue.value = await inactiveValueFunction.value()
  }
})
</script>
