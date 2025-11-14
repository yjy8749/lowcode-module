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
      <span class="c-#A8ABB2">JS动态函数:</span>
      <AceEditor
        lang="javascript"
        :height="120"
        :readonly="disabled"
        :model-value="valueVModel.value"
        @update:model-value="
          (value) => {
            valueVModel.value = value
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
import { jsFunctionBuiltInHelps } from '../querier-editor.utils'
import { computedVModel } from '../../common/hooks'

export interface QueryXmlBeanInputValue {
  clazz?: string
  value?: string
}

export interface QueryXmlBeanInputProps {
  name: string
  tips?: string
  disabled?: boolean
  defaultJsFunction?: () => string
  modelValue?: QueryXmlBeanInputValue
}

export type QueryXmlBeanInputEmits = {
  'update:modelValue': [val?: QueryXmlBeanInputValue]
  change: [val?: QueryXmlBeanInputValue]
}

const props = defineProps<QueryXmlBeanInputProps>()

const emits = defineEmits<QueryXmlBeanInputEmits>()

const { valueVModel, triggerUpdate } = computedVModel({
  get() {
    return props.modelValue ?? {}
  },
  set(val?: QueryXmlBeanInputValue) {
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
        valueVModel.value.value = undefined
        valueVModel.value.clazz = ''
        triggerUpdate()
      }
    },
    {
      type: 'warning',
      isShow: isSpringBeanInput.value,
      label: '输入JS动态函数',
      onClick: () => {
        valueVModel.value.value = props.defaultJsFunction?.()
        valueVModel.value.clazz = undefined
        triggerUpdate()
      }
    }
  ]
})
</script>

<style lang="scss" scoped></style>
