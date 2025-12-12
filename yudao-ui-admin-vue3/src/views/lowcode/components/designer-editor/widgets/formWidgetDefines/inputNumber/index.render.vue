<!-- index.render.vue -->
<template>
  <ElFormItemWrapper v-bind="formItemAttrs">
    <el-input-number
      v-bind="formInputAttrs"
      :class="{ '!w-full': fullWidth }"
      :disabled-scientific="true"
      :value-on-clear="formInputAttrs.defaultValue"
      v-model="valueModel"
    >
      <template v-if="decreaseIcon" #decreaseIcon>
        <Icon :icon="decreaseIcon" />
      </template>
      <template v-if="increaseIcon" #increaseIcon>
        <Icon :icon="increaseIcon" />
      </template>
      <template v-if="prefixIcon" #prefix>
        <Icon :icon="prefixIcon" />
      </template>
      <template v-if="suffixIcon" #suffix>
        <Icon :icon="suffixIcon" />
      </template>
    </el-input-number>
  </ElFormItemWrapper>
</template>
<script lang="ts" setup>
import ElFormItemWrapper from '../../../../common/ElFormItemWrapper.vue'
import { useWidget, type WidgetRenderProps } from '../../hooks'
import { useFormItemWidget } from '../../hooks/useFormItemWidget'

const props = defineProps<WidgetRenderProps>()

const { formItemAttrs, valueModel, useFormInputAttrs, usePropValue } = useFormItemWidget(
  useWidget(props)
)

const formInputAttrs = computed(() =>
  useFormInputAttrs({
    omit: ['decreaseIcon', 'increaseIcon', 'prefixIcon', 'suffixIcon', 'fullWidth']
  })
)

const decreaseIcon = computed(() => usePropValue('decreaseIcon'))

const increaseIcon = computed(() => usePropValue('increaseIcon'))

const prefixIcon = computed(() => usePropValue('prefixIcon'))

const suffixIcon = computed(() => usePropValue('suffixIcon'))

const fullWidth = computed(() => usePropValue('fullWidth'))
</script>
