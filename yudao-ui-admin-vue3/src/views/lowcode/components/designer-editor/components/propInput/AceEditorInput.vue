<template>
  <LowcodeCard :name="name" :tips="tips" :helps="helps" :actions="actions">
    <AceEditor :readonly="readonly" :lang="lang" :height="height ?? 200" v-model="valueVModel" />
  </LowcodeCard>
</template>
<script lang="ts" setup>
import { DesignerEditor, WidgetInstance } from '../../designer-editor.type'
import LowcodeCard, { LowcodeCardAction } from '../../../common/LowcodeCard.vue'
import AceEditor from '../../../ace-editor/index.vue'
import { computedVModel } from '../../../common/hooks'
import { jsonStringify } from '../../../common/utils'
import { isNullOrUnDef } from '@/utils/is'

export interface AceEditorInputProps {
  editor: DesignerEditor
  widget?: WidgetInstance
  name: string
  lang: string
  height?: string | number
  tips?: string
  helps?: string
  actions?: LowcodeCardAction[]
  readonly?: boolean
  modelValue?: string
}

export type AceEditorInputEmits = {
  'update:modelValue': [val?: string]
  change: [val?: string]
}

const props = defineProps<AceEditorInputProps>()

const emits = defineEmits<AceEditorInputEmits>()

const { valueVModel } = computedVModel({
  get: () => {
    return props.modelValue
  },
  set: (val?: string) => {
    emits('update:modelValue', val)
    emits('change', val)
  }
})

const actions = computed(() => {
  return [
    ...(props.actions ?? []),
    {
      type: 'warning',
      label: '格式化',
      onClick: () => {
        if (!isNullOrUnDef(valueVModel.value)) {
          valueVModel.value = jsonStringify(JSON.parse(valueVModel.value))
        }
      }
    }
  ]
})
</script>
<style lang="scss" scoped></style>
