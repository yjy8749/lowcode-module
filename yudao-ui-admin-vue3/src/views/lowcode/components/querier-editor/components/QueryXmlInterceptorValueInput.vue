<template>
  <LowcodeCard
    :name="name"
    :tips="tips"
    :helps="isSpringBeanInput ? undefined : jsFunctionBuiltInHelps()"
    :actions="disabled ? [] : cardActions"
  >
    <template v-if="isSpringBeanInput">
      <span class="c-#A8ABB2">Spring Baen Class Name</span>
      <AceEditor
        lang="javascript"
        :height="60"
        :readonly="disabled"
        :model-value="valueVModel.clazz"
        @update:model-value="
          (value) => {
            valueVModel.clazz = value
            triggerUpdate()
          }
        "
      />
    </template>
    <template v-else>
      <span class="c-#A8ABB2">JS前处理函数:</span>
      <AceEditor
        lang="javascript"
        :height="120"
        :readonly="disabled"
        :model-value="valueVModel.preHandleValue?.value"
        @update:model-value="
          (value) => {
            valueVModel.preHandleValue = { value }
            triggerUpdate()
          }
        "
      />
      <span class="c-#A8ABB2">JS后处理函数:</span>
      <AceEditor
        lang="javascript"
        :height="120"
        :readonly="disabled"
        :model-value="valueVModel.postHandleValue?.value"
        @update:model-value="
          (value) => {
            valueVModel.postHandleValue = { value }
            triggerUpdate()
          }
        "
      />
    </template>
  </LowcodeCard>
</template>
<script lang="ts" setup>
import { isNullOrUnDef } from '@/utils/is'
import LowcodeCard, { LowcodeCardAction } from '../../common/LowcodeCard.vue'
import AceEditor from '../../ace-editor/index.vue'
import {
  defaultQueryInterceptorPostHandle,
  defaultQueryInterceptorPreHandle,
  jsFunctionBuiltInHelps
} from '../querier-editor.utils'
import { computedVModel } from '../../common/hooks'
import { QueryInterceptorValue } from '../querier-editor.type'

export interface QueryXmlInterceptorValueInputProps {
  name: string
  tips?: string
  disabled?: boolean
  modelValue?: QueryInterceptorValue
}

export type QueryXmlInterceptorValueInputEmits = {
  'update:modelValue': [val?: QueryInterceptorValue]
  change: [val?: QueryInterceptorValue]
}

const props = defineProps<QueryXmlInterceptorValueInputProps>()

const emits = defineEmits<QueryXmlInterceptorValueInputEmits>()

const { valueVModel, triggerUpdate } = computedVModel({
  get() {
    return props.modelValue ?? {}
  },
  set(val?: QueryInterceptorValue) {
    emits('update:modelValue', val)
    emits('change', val)
  }
})

const isSpringBeanInput = computed(() => !isNullOrUnDef(valueVModel.value?.clazz))

const cardActions = computed((): LowcodeCardAction[] => {
  return [
    {
      type: 'warning',
      isShow: !isSpringBeanInput.value,
      label: '输入Spring Bean',
      onClick: () => {
        valueVModel.value.preHandleValue = undefined
        valueVModel.value.postHandleValue = undefined
        valueVModel.value.clazz = ''
        triggerUpdate()
      }
    },
    {
      type: 'warning',
      isShow: isSpringBeanInput.value,
      label: '输入JS动态函数',
      onClick: () => {
        valueVModel.value.preHandleValue = { value: defaultQueryInterceptorPreHandle() }
        valueVModel.value.postHandleValue = { value: defaultQueryInterceptorPostHandle() }
        valueVModel.value.clazz = undefined
        triggerUpdate()
      }
    }
  ]
})
</script>

<style lang="scss" scoped></style>
