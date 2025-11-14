<!-- index.render.vue -->
<template>
  <el-alert v-bind="alertAttrs" />
</template>
<script lang="ts" setup>
import { useWidget, type WidgetRenderProps } from '../../hooks'

const props = defineProps<WidgetRenderProps>()

const { usePropAndEvent } = useWidget(props)

const alertAttrs = computed(() => usePropAndEvent())
</script>
