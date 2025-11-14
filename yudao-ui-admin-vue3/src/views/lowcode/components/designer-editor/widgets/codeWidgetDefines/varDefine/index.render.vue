<template>
  <div v-if="!isPreviewMode" class="flex flex-col justify-center gap-2 p-2 bg-[--el-color-warning]">
    <el-text class="!c-#fff">{{ dataDefineNames }} </el-text>
  </div>
</template>

<script setup lang="ts">
import { isEmpty } from '@/utils/is'
import { useWidget, type WidgetRenderProps } from '../../hooks'
import { useWidgetDataDefinesAndRuntime } from '../../../designer-editor.utils'

const props = defineProps<WidgetRenderProps>()

const { isPreviewMode } = useWidget(props)

const dataDefineNames = computed(() => {
  const dataDefines = useWidgetDataDefinesAndRuntime(props.editor, props.widget)
  const names = dataDefines.map((item) => `【${item.name}】`)
  return isEmpty(names) ? '未定义数据' : names.join(' ')
})
</script>
