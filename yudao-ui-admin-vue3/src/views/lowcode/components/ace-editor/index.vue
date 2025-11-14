<template>
  <div class="w-full" :style="style">
    <VAceEditor
      :style="{ width: '100%', height: '100%' }"
      :lang="lang"
      :theme="theme"
      :options="{ useWorker: true }"
      :readonly="readonly"
      v-model:value="valueVModel"
    />
  </div>
</template>

<script setup lang="ts">
import { VAceEditor } from 'vue3-ace-editor'
import './ace-editor.config'
import { isNullOrUnDef, isString } from '@/utils/is'
import { computedVModel } from '../common/hooks'

export interface AceEditorProps {
  modelValue?: string
  lang: string
  theme?: string
  readonly?: boolean
  height?: string | number
}

export type AceEditorEmits = {
  'update:modelValue': [val?: string]
  change: [val?: string]
}

const props = withDefaults(defineProps<AceEditorProps>(), {
  modelValue: '',
  type: 'javascript',
  theme: 'github',
  readonly: false
})

const emits = defineEmits<AceEditorEmits>()

const { valueVModel, triggerValidate } = computedVModel({
  get() {
    return props.modelValue
  },
  set(val?: string) {
    emits('update:modelValue', val)
    emits('change', val)
    nextTick(() => {
      triggerValidate()
    })
  }
})

const style = computed(() => {
  if (!isNullOrUnDef(props.height)) {
    return {
      height: isString(props.height) ? props.height : props.height + 'px'
    }
  }
  return { height: '100%' }
})
</script>

<style scoped lang="scss"></style>
