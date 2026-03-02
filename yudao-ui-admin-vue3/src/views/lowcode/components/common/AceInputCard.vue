<template>
  <LowcodeCard :title="title" :tips="tips" :helps="helps" :actions="actions">
    <slot name="tools"></slot>
    <AceEditor
      ref="editorRef"
      :lang="lang"
      :theme="theme"
      :readonly="readonly"
      :height="height"
      :options="options"
      :model-value="modelValue"
      @update:model-value="(val) => emits('update:modelValue', val)"
      @change="(val) => emits('change', val)"
    />
  </LowcodeCard>
</template>
<script lang="ts" setup>
import LowcodeCard, { type LowcodeCardAction } from './LowcodeCard.vue'
import AceEditor from '../ace-editor/index.vue'

export type AceInputCardAction = LowcodeCardAction

export interface AceInputCardProps {
  title?: string
  tips?: string
  helps?: string
  actions?: AceInputCardAction[]
  modelValue?: string
  lang?: string
  theme?: string
  readonly?: boolean
  height?: string | number
  options?: Record<string, any>
  beautify?: boolean
}

export type AceInputCardEmits = {
  'update:modelValue': [val?: string]
  change: [val?: string]
}

const props = withDefaults(defineProps<AceInputCardProps>(), { beautify: true })

const emits = defineEmits<AceInputCardEmits>()

const editorRef = ref<InstanceType<typeof AceEditor>>()

const actions = computed(() => {
  if (props.beautify) {
    return [
      ...(props.actions ?? []),
      {
        color: '#fff',
        icon: 'ep:finished',
        isShow: !props.readonly,
        onClick: () => {
          editorRef.value?.beautify()
        }
      }
    ]
  }
  return props.actions
})
</script>
