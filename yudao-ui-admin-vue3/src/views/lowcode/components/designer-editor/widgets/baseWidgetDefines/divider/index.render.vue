<!-- index.render.vue -->
<template>
  <el-divider v-bind="dividerAttrs">
    <template v-if="!isEmpty(text)">
      {{ text }}
    </template>
  </el-divider>
</template>
<script lang="ts" setup>
import { isEmpty } from '@/utils/is'
import { useWidget, type WidgetRenderProps } from '../../hooks'

const props = defineProps<WidgetRenderProps>()

const { usePropAndEvent, usePropValue } = useWidget(props)

const dividerAttrs = computed(() => usePropAndEvent({ omit: ['text'] }))

const text = computed(() => usePropValue('text'))
</script>
