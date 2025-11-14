<template>
  <template v-if="isShow">
    <template v-if="hasOuterDiv">
      <div :style="outerDivStyle">
        <component :style="innerDivStyle" :is="widgetRender" :key="`${widget._vid}_1`" />
      </div>
    </template>
    <template v-else>
      <component :style="innerDivStyle" :is="widgetRender" :key="`${widget._vid}_2`" />
    </template>
  </template>
</template>
<script lang="ts" setup>
import { WidgetRenderProps } from '../designer-editor.type'
import { buildInnerCSSObj, buildOuterCSSObj, cssObjToStyleString } from '../designer-editor.utils'
import { useWidget } from '../widgets/hooks'
import { isEmpty, isNullOrUnDef } from '@/utils/is'

const props = defineProps<WidgetRenderProps>()

const widgetRender = computed(() => props.widgetDefine.render(props))

const outerDivStyle = computed(() => {
  if (props.widgetDefine.disableOuter) {
    return undefined
  }
  const cssObj = cssObjToStyleString(buildOuterCSSObj(props.widget))
  if (isEmpty(Object.keys(cssObj))) {
    return undefined
  }
  return cssObj
})

const hasOuterDiv = computed(() => !isNullOrUnDef(outerDivStyle.value))

const innerDivStyle = computed(() => {
  if (props.widgetDefine.disableInner) {
    return undefined
  }
  const cssObj = cssObjToStyleString(buildInnerCSSObj(props.widget))
  if (isEmpty(Object.keys(cssObj))) {
    return undefined
  }
  return cssObj
})

const { isShow } = useWidget(props)
</script>
