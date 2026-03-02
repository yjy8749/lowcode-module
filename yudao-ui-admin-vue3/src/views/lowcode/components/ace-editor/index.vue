<template>
  <div class="w-full" :style="style">
    <VAceEditor
      ref="editorRef"
      :style="{ width: '100%', height: '100%' }"
      :lang="lang"
      :theme="theme"
      :readonly="readonly"
      :options="editorOptions"
      v-model:value="valueVModel"
    />
  </div>
</template>

<script setup lang="ts">
import { VAceEditor } from 'vue3-ace-editor'
import ace from './ace-editor.config'
import { isNullOrUnDef, isString } from '@/utils/is'
import { computedVModel } from '../common/hooks'
import { jsonStringify } from '../common/utils'

export interface AceEditorProps {
  modelValue?: string
  lang?: string
  theme?: string
  readonly?: boolean
  height?: string | number
  options?: Record<string, any>
}

export type AceEditorEmits = {
  'update:modelValue': [val?: string]
  change: [val?: string]
}

const props = withDefaults(defineProps<AceEditorProps>(), {
  modelValue: '',
  lang: 'javascript',
  theme: 'github',
  readonly: false
})

const emits = defineEmits<AceEditorEmits>()

const editorRef = ref<InstanceType<typeof VAceEditor>>()

const editorOptions = computed(() => {
  return {
    tabSize: 2,
    useSoftTabs: true,
    useWorker: true,
    ...props.options
  }
})

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

defineExpose({
  beautify() {
    if (props.lang === 'json') {
      valueVModel.value = jsonStringify(JSON.parse(valueVModel.value))
    } else {
      //@ts-expect-error
      ace.require('ace/ext/beautify').beautify(editorRef.value?.getAceInstance().session)
    }
  }
})
</script>

<style scoped lang="scss"></style>
