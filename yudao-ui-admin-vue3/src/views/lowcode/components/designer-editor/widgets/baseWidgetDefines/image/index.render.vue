<!-- index.render.vue -->
<template>
  <Image v-bind="imageAttrs" />
</template>
<script lang="ts" setup>
import { useWidget, type WidgetRenderProps } from '../../hooks'
import Image from './src'

const props = defineProps<WidgetRenderProps>()

const { usePropAndEvent } = useWidget(props)

const imageAttrs = computed(() => usePropAndEvent())
</script>
