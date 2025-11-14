<template>
  <Audio ref="audioRef" v-bind="audioAttrs" />
</template>
<script lang="ts" setup>
import { useWidget, type WidgetRenderProps } from '../../hooks'
import Audio from './src'

const audioRef = ref<InstanceType<typeof Audio>>()

const props = defineProps<WidgetRenderProps>()

const { usePropAndEvent, context } = useWidget(props)

const audioAttrs = computed(() => usePropAndEvent())

context({
  audioRef: () => audioRef.value
})
</script>
