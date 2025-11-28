<template>
  <!--  组件容器  -->
  <DraggableContainer
    :class="{ slot: !isPreviewMode && isEmpty(widgetList) }"
    :data-slot="`右键添加子组件或拖拽组件到此处`"
    item-key="_vid"
    :group="{ name: 'designer-editor', put: widgetRenderContext.options?.putable }"
    :readonly="isPreviewMode"
    :model-value="widgetList"
    @change="onDragChange"
    @start="onDragStart"
    @end="onDragEnd"
  >
    <template #item="{ element, index }">
      <WidgetItem
        :editor="editor"
        :parent-widget="widget"
        :parent-render-context="widgetRenderContext"
        :widget="element"
        :widget-index="index"
      />
    </template>
  </DraggableContainer>
</template>

<script setup lang="ts">
import { isEmpty } from '@/utils/is'
import { useWidget, type WidgetRenderProps } from '../../hooks'
import DraggableContainer from '../../../../common/DraggableContainer.vue'
import WidgetItem from '../../../components/WidgetItem.vue'
import { useDraggableContainer } from '../../../hooks'

const props = defineProps<WidgetRenderProps>()

const { isPreviewMode } = useWidget(props)

const widgetList = computed(() => props.widget.slotChildren)

const { onDragChange, onDragStart, onDragEnd } = useDraggableContainer(
  props.editor,
  props.widget,
  props.widgetRenderContext
)
</script>
<style scoped lang="scss">
.slot::after {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 8px;
  font-size: 14px;
  color: #fff;
  text-align: center;
  background-color: var(--el-color-danger);
  content: attr(data-slot);
}
</style>
