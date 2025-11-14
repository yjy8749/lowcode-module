<!-- index.render.vue -->
<template>
  <Video ref="videoRef" v-bind="videoAttrs" />
</template>
<script lang="ts" setup>
import { useWidget, type WidgetRenderProps } from '../../hooks'
import Video from './src'

const videoRef = ref<InstanceType<typeof Video>>()

const props = defineProps<WidgetRenderProps>()

const { usePropAndEvent, context } = useWidget(props)

const videoAttrs = computed(() => usePropAndEvent())

context({
  audioRef: () => videoRef.value
})
</script>
