<!-- index.render.vue -->
<template>
  <Icon v-bind="iconAttrs" />
</template>
<script lang="ts" setup>
import { useWidget, type WidgetRenderProps } from '../../hooks'
import { Icon } from '@/components/Icon'

const props = defineProps<WidgetRenderProps>()

const { usePropAndEvent } = useWidget(props)

const iconAttrs = computed(() => usePropAndEvent())
</script>
