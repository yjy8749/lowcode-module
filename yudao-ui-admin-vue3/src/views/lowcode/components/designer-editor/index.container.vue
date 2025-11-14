<template>
  <DraggableContainer
    v-if="!isLoading"
    item-key="_vid"
    group="designer-editor"
    :readonly="isPreviewMode"
    :model-value="widgetTree"
    @change="onDragChange"
    @start="onDragStart"
    @end="onDragEnd"
  >
    <template #item="{ element, index }">
      <WidgetItem
        :editor="editor"
        :parent-widget="undefined"
        :parent-context="rootContext"
        :widget="element"
        :widget-index="index"
      />
    </template>
  </DraggableContainer>
</template>

<script lang="ts" setup>
import {
  executeEvalFunction,
  promiseWithLoading,
  readPageEventBind,
  useDataDefines,
  useRootContext,
  useWidgetTree
} from './designer-editor.utils'
import DraggableContainer from '../common/DraggableContainer.vue'
import WidgetItem from './components/WidgetItem.vue'
import { useDraggableContainer } from './hooks'
import { DesignerEditor, WidgetDataDefine } from './designer-editor.type'
import { isEmpty } from '@/utils/is'
import { useDataDefineExecutor } from './components/dataDefine/hooks'

const props = defineProps<{ editor: DesignerEditor }>()

const { isPreviewMode, isLoading } = props.editor.getStore()

const rootContext = computed(() => useRootContext(props.editor))

const widgetTree = computed(() => useWidgetTree(props.editor))

const { onDragChange, onDragStart, onDragEnd } = useDraggableContainer(props.editor)

const executeGetData = async (list: WidgetDataDefine[]) => {
  try {
    if (!isEmpty(list)) {
      const results = await promiseWithLoading(
        (val) => {
          list.forEach((def) => {
            props.editor.getStore().putLoadingContext(def._vid, val)
          })
        },
        Promise.allSettled(
          list.map((dataDefine) => {
            return useDataDefineExecutor(props.editor, { dataDefine }).getData()
          })
        )
      )
      console.log('editor executeGetData finish', results)
    }
  } catch (error) {
    console.error('editor executeGetData error', error)
  }
}

// 数据执行
executeGetData(useDataDefines(props.editor, { _types: ['def', 'remote'], isAutoLoad: true }))

// 页面生命周期
onBeforeMount(() => {
  executeEvalFunction(props.editor, readPageEventBind(props.editor, 'onBeforeMount'))
})

onMounted(() => {
  executeEvalFunction(props.editor, readPageEventBind(props.editor, 'onMounted'))
})

onBeforeUnmount(() => {
  executeEvalFunction(props.editor, readPageEventBind(props.editor, 'onBeforeUnmount'))
})

onUnmounted(() => {
  executeEvalFunction(props.editor, readPageEventBind(props.editor, 'onUnmounted'))
})
</script>

<style lang="scss" scoped></style>
