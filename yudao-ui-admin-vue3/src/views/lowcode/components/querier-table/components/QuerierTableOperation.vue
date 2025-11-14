<template>
  <div v-if="hasOperationActions" class="mt-2 flex justify-end gap-2">
    <!-- 操作区配置按钮 -->
    <ActionButton v-for="(item, index) in operationActions" :key="index" v-bind="item" />
    <!-- 操作区插槽 -->
    <slot v-if="slots.operationActionSlot" name="operationActionSlot"></slot>
  </div>
</template>
<script lang="ts" setup>
import { isEmpty } from '@/utils/is'
import ActionButton from '../../common/ActionButton.vue'
import { QuerierTableOperationProps } from '../querier-table.type'

const props = defineProps<QuerierTableOperationProps>()

const slots = useSlots()

const hasOperationActions = computed(() => {
  return !!slots.operationActionSlot || !isEmpty(props.operationActions)
})
</script>
