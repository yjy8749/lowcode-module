<template>
  <el-card :style="bgStyle" v-bind="cardAttrs" @click="toggleCurrentRow">
    <div
      class="pos-relative"
      :class="{
        'cursor-pointer': isTableSelectable && isSelectable,
        'cursor-not-allowed': isTableSelectable && !isSelectable
      }"
      @click.stop="toggleSelected"
    >
      <el-row v-bind="rowAttrs">
        <el-col v-bind="colAttrs">
          <WidgetItem
            :editor="editor"
            :parent-widget="widget"
            :parent-render-context="widgetRenderContext"
            :widget="defaultSlotWidget"
            :options="widgetItemOptions"
          />
        </el-col>
      </el-row>
      <div
        v-if="isChecked"
        class="absolute top-0 left-0 right-0 bottom-0 bg-[--el-overlay-color-lighter] z-1 flex justify-center items-center cursor-pointer"
      >
        <Icon color="#fff" :size="48" icon="ep:check" />
      </div>
    </div>
    <template v-if="isShowFooter" #footer>
      <div class="flex justify-end">
        <QuerierTableBodyRowActions
          :scope="{ row: vforItemData.data, $index: vforItemData.index }"
          :rowActions="rowActionsConfig.rowActions"
          :expandRowActions="rowActionsConfig.expandRowActions"
          :foldRowActions="rowActionsConfig.foldRowActions"
          :autoFoldNum="rowActionsConfig.autoFoldNum"
          @filter-completed="onActionFilterCompleted"
        />
      </div>
    </template>
  </el-card>
</template>

<script setup lang="ts">
import { useElColPropAttrs, useWidget, type WidgetRenderProps } from '../../hooks'
import WidgetItem from '../../../components/WidgetItem.vue'
import QuerierTableBodyRowActions from '../../../../querier-table/components/QuerierTableBodyRowActions.vue'
import { isEmpty } from '@/utils/is'

const props = defineProps<WidgetRenderProps>()

const {
  usePropAndEvent,
  useDefaultSlot,
  useParent,
  useVForItemData,
  useExposeContext,
  generateOptions
} = useWidget(props)

const widgetItemOptions = generateOptions({ putable: true, selectable: true })

const cardAttrs = computed(() => usePropAndEvent({ omit: ['justify'] }))

const defaultSlotWidget = computed(() => useDefaultSlot())

const colAttrs = computed(() => useElColPropAttrs(defaultSlotWidget.value))

const rowAttrs = computed(() => usePropAndEvent({ only: ['justify'] }))

const parentTableContext = computed(() => {
  return useExposeContext(useParent({ _moduleName: 'advWidgetDefines', _key: 'easyTable' }))
})

const parentTableRef = (): any | undefined => {
  return parentTableContext.value?.tableRef()
}

const isTableSelectable = computed(() => parentTableContext.value?.isSelectable())

const isSelectable = computed(() => {
  return parentTableRef()?.isRowSelectable(vforItemData.value.data) ?? true
})

const vforItemData = computed(() => useVForItemData())

const isChecked = computed(() => {
  return parentTableRef()?.isRowChecked(vforItemData.value.data)
})

const toggleSelected = () => {
  if (isTableSelectable.value && isSelectable.value) {
    parentTableRef()?.toggleRowsSelection(vforItemData.value.data)
  }
}

const bgStyle = computed(() => {
  if (parentTableRef()?.isCurrentRow(vforItemData.value.data)) {
    return 'background-color:#ecf5ff'
  }
})

const toggleCurrentRow = () => {
  parentTableRef()?.toggleCurrentRow(vforItemData.value.data)
}

const isShowAction = ref(true)

const rowActionsConfig = computed(() => parentTableRef()?.getRowActionsConfig())

const isShowFooter = computed(() => {
  return !isEmpty(rowActionsConfig.value?.rowActions) && isShowAction.value
})
const onActionFilterCompleted = (vals) => {
  isShowAction.value = !isEmpty(vals)
}
</script>
