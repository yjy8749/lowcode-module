<template>
  <Audio ref="audioRef" v-bind="audioAttrs" />
</template>
<script lang="ts" setup>
import { useWidget, type WidgetRenderProps } from '../../hooks'
import Audio from './src'

const audioRef = ref<InstanceType<typeof Audio>>()

const props = defineProps<WidgetRenderProps>()

const { usePropAndEvent, exposeContext } = useWidget(props)

const audioAttrs = computed(() => usePropAndEvent())

exposeContext({
  audioRef: () => audioRef.value
})
</script>
