<template>
  <div class="w-full flex justify-end">
    <component v-if="valueInputRender" :is="valueInputRender" />
    <div v-else> 属性未实现 </div>
  </div>
</template>
<script lang="ts" setup>
import { computedVModel } from '../../../common/hooks'
import {
  WidgetRenderContext,
  WidgetDefine,
  WidgetInstance,
  WidgetPropDefine,
  DesignerEditor
} from '../../designer-editor.type'

export interface PropValueInputProps {
  editor: DesignerEditor
  widget: WidgetInstance
  widgetRenderContext: WidgetRenderContext
  widgetDefine: WidgetDefine
  propDefine: WidgetPropDefine
  modelValue?: any
}

export type PropValueInputEmits = {
  'update:modelValue': [val?: any]
  change: [val?: any]
}

const props = defineProps<PropValueInputProps>()

const emits = defineEmits<PropValueInputEmits>()

const { valueVModel } = computedVModel({
  get() {
    return props.modelValue
  },
  set(val?: any) {
    emits('update:modelValue', val)
    emits('change', val)
  }
})

const valueInputRender = props.propDefine.render?.(valueVModel, {
  editor: props.editor,
  widget: props.widget,
  widgetRenderContext: props.widgetRenderContext,
  widgetDefine: props.widgetDefine,
  propDefine: props.propDefine
})
</script>

<style lang="scss" scoped></style>
