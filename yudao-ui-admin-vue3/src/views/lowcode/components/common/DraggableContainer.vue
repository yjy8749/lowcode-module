<template>
  <Draggable
    v-if="!readonly"
    class="DraggableContainer"
    ghost-class="DraggableGhostItem"
    :group="group"
    :item-key="keyBuilder"
    :sort="sort"
    :animation="300"
    :clone="clone"
    v-model="valueVModel"
    @change="onDragChange"
    @start="onDragStart"
    @add="onDragAdd"
    @remove="onDragRemove"
    @update="onDragUpdate"
    @end="onDragEnd"
    @choose="onDragChoose"
    @unchoose="onDragUnchoose"
    @sort="onDragSort"
    @clone="onDragClone"
  >
    <template #item="{ element }">
      <div class="draggableItem">
        <slot name="item" v-bind="element"> </slot>
      </div>
    </template>
  </Draggable>
  <template v-else>
    <div>
      <div v-for="element in valueVModel" :key="keyBuilder(element)">
        <slot name="item" v-bind="element"> </slot>
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
/**
 * vuedraggable 不支持 tag="transition-group" 因此在元素变化时动画效果无法指定
 * 更换为 zhyswan-vuedraggable 可支持 transition-group
 *
 * 组件参数增加配置
 * tag="transition-group"
 * :component-data="{ tag: 'div', name: 'flip-list' }"
 *
 * 更换导入模块
 * import Draggable from 'zhyswan-vuedraggable'
 */
import Draggable from 'vuedraggable'
import { computedVModel } from './hooks'
import { generateVForKey } from './utils'

export interface DraggableContainerGroup {
  name?: string
  pull?: boolean | 'clone' | string[] | (() => boolean)
  put?: boolean | string[] | (() => boolean)
}

export interface DraggableContainerProps {
  readonly?: boolean
  modelValue?: any[]
  itemKey?: string
  sort?: boolean
  group?: string | DraggableContainerGroup
  clone?: (original: any) => any
}

type DraggableContainerEmits = {
  'update:modelValue': [e?: any[]]
  change: [e?: any[]]
  start: [e: any]
  add: [e: any]
  remove: [e: any]
  update: [e: any]
  end: [e: any]
  choose: [e: any]
  unchoose: [e: any]
  sort: [e: any]
  clone: [e: any]
}

const props = withDefaults(defineProps<DraggableContainerProps>(), {
  modelValue: () => [],
  itemKey: '__key__',
  sort: true
})

const emits = defineEmits<DraggableContainerEmits>()

const { valueVModel, triggerValidate } = computedVModel({
  get() {
    return generateVForKey(props.modelValue).map((element, index) => ({ index, element }))
  },
  set(vals?: any[]) {
    vals = vals?.map((e) => e.element)
    emits('update:modelValue', vals)
    emits('change', vals)
    nextTick(() => {
      triggerValidate()
    })
  }
})

const keyBuilder = (item: { index: number; element?: any }) => {
  return item.element?.[props.itemKey] ?? `${item.index}`
}

const onDragChoose = (e: any) => {
  console.log('onDragChoose', e)
  emits('choose', e)
}
const onDragClone = (e: any) => {
  console.log('onDragClone', e)
  emits('clone', e)
}
const onDragStart = (e: any) => {
  console.log('onDragStart', e)
  emits('start', e)
}
const onDragUnchoose = (e: any) => {
  console.log('onDragUnchoose', e)
  emits('unchoose', e)
}
const onDragAdd = (e: any) => {
  console.log('onDragAdd', e)
  emits('add', e)
}
const onDragRemove = (e: any) => {
  console.log('onDragRemove', e)
  emits('remove', e)
}
const onDragUpdate = (e: any) => {
  console.log('onDragUpdate', e)
  emits('update', e)
}
const onDragSort = (e: any) => {
  console.log('onDragSort', e)
  emits('sort', e)
}
const onDragEnd = (e: any) => {
  console.log('onDragEnd', e)
  emits('end', e)
}
const onDragChange = (e: any) => {
  console.log('onDragChange', e)
  emits('change', e)
}
</script>

<style scoped lang="scss">
.DraggableContainer {
  .DraggableGhostItem {
    background: #c8ebfb !important;
    opacity: 0.5 !important;
  }
}

.flip-list-move {
  transition: all 0.5s ease;
}

.flip-list-enter-active {
  opacity: 0;
  transform: translateX(30px);
  transition: all 0.5s ease;
}

.flip-list-leave-active {
  transition: all 0.5s ease;
}

.flip-list-enter-to {
  opacity: 1;
  transform: translateX(0);
}

.flip-list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
