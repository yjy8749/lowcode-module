<template>
  <el-table
    ref="tableRef"
    v-bind="tableAttrs"
    @select="onSelect"
    @select-all="onSelectAll"
    @selection-change="onSelectionChange"
    @cell-mouse-enter="onCellMouseEnter"
    @cell-mouse-leave="onCellMouseLeave"
    @cell-click="onCellClick"
    @cell-dblclick="onCellDbclick"
    @cell-contextmenu="onCellContextmenu"
    @row-click="onRowClick"
    @row-contextmenu="onRowContextmenu"
    @row-dblclick="onRowDblclick"
    @header-click="onHeaderClick"
    @header-contextmenu="onHeaderContextmenu"
    @sort-change="onSortChange"
    @filter-change="onFilterChange"
    @current-change="onCurrentChange"
    @header-dragend="onHeaderDragend"
    @expand-change="onExpandChange"
  >
    <el-table-column
      v-if="selectable"
      type="selection"
      reserve-selection
      align="center"
      fixed="left"
      width="45px"
      :selectable="rowSelectable"
    />
    <QuerierTableBodyColumn
      v-for="(item, index) in props.columns"
      :key="item.prop"
      :expand-row-actions="expandRowActions"
      :fold-row-actions="foldRowActions"
      :auto-fold-num="autoFoldNum"
      :row-actions="rowActions"
      :fixed-right="index * 2 > props.columns.length"
      v-bind="item"
    />
  </el-table>
</template>
<script lang="ts" setup>
import { ElTable } from 'element-plus'
import { generateVForKey } from '../../common/utils'
import { QuerierTableBodyProps } from '../querier-table.type'
import QuerierTableBodyColumn from './QuerierTableBodyColumn.vue'

export type QuerierTableBodyEmits = {
  select: [any[], row: any]
  selectAll: [any[]]
  selectionChange: [any[]]
  cellMouseEnter: [any, any, HTMLTableCellElement, Event]
  cellMouseLeave: [any, any, HTMLTableCellElement, Event]
  cellClick: [any, any, HTMLTableCellElement, Event]
  cellDblclick: [any, any, HTMLTableCellElement, Event]
  cellContextmenu: [any, any, HTMLTableCellElement, Event]
  rowClick: [any, any, Event]
  rowContextmenu: [any, any, Event]
  rowDblclick: [any, any, Event]
  headerClick: [any, Event]
  headerContextmenu: [any, Event]
  sortChange: [{ column: any; prop: string; order: any }]
  filterChange: [any]
  currentChange: [any, any]
  headerDragend: [number, number, any, MouseEvent]
  expandChange: [any, any | boolean]
  dragEnd: [any[], any, number, number]
}

const props = withDefaults(defineProps<QuerierTableBodyProps>(), {
  data: () => [],
  columns: () => [],
  rowActions: () => []
})

const emits = defineEmits<QuerierTableBodyEmits>()

const getRowKey = (row: any) => {
  return props.rowKey?.(row) ?? row.__key__
}

const tableRef = ref<InstanceType<typeof ElTable>>()

const tableAttrs = computed(() => {
  return {
    data: generateVForKey(props.data),
    rowKey: (row: any) => getRowKey(row),
    height: props.height,
    stripe: props.stripe,
    border: props.border,
    highlightCurrentRow: true
  }
})

const onSelect = (selection: any[], row: any) => {
  emits('select', selection, row)
}

const onSelectAll = (selection: any[]) => {
  emits('selectAll', selection)
}

const onSelectionChange = (newSelection: any[]) => {
  emits('selectionChange', newSelection)
}

const onCellMouseEnter = (row: any, column: any, cell: HTMLTableCellElement, event: Event) => {
  emits('cellMouseEnter', row, column, cell, event)
}

const onCellMouseLeave = (row: any, column: any, cell: HTMLTableCellElement, event: Event) => {
  emits('cellMouseLeave', row, column, cell, event)
}

const onCellClick = (row: any, column: any, cell: HTMLTableCellElement, event: Event) => {
  emits('cellClick', row, column, cell, event)
}

const onCellDbclick = (row: any, column: any, cell: HTMLTableCellElement, event: Event) => {
  emits('cellDblclick', row, column, cell, event)
}

const onCellContextmenu = (row: any, column: any, cell: HTMLTableCellElement, event: Event) => {
  emits('cellContextmenu', row, column, cell, event)
}

const onRowClick = (row: any, column: any, event: Event) => {
  emits('rowClick', row, column, event)
}

const onRowContextmenu = (row: any, column: any, event: Event) => {
  emits('rowContextmenu', row, column, event)
}

const onRowDblclick = (row: any, column: any, event: Event) => {
  emits('rowDblclick', row, column, event)
}

const onHeaderClick = (column: any, event: Event) => {
  emits('headerClick', column, event)
}

const onHeaderContextmenu = (column: any, event: Event) => {
  emits('headerContextmenu', column, event)
}

const onSortChange = (data: { column: any; prop: string; order: any }) => {
  emits('sortChange', data)
}

const onFilterChange = (newFilters: any) => {
  emits('filterChange', newFilters)
}

const onCurrentChange = (currentRow: any, oldCurrentRow: any) => {
  emits('currentChange', currentRow, oldCurrentRow)
}

const onHeaderDragend = (newWidth: number, oldWidth: number, column: any, event: MouseEvent) => {
  emits('headerDragend', newWidth, oldWidth, column, event)
}
const onExpandChange = (row: any, expanded: any[] | boolean) => {
  emits('expandChange', row, expanded)
}

defineExpose({
  clearSelection() {
    tableRef.value?.clearSelection()
  },
  getSelectionRows(): any[] {
    return tableRef.value?.getSelectionRows() ?? []
  },
  toggleRowSelection(row: any, selected?: boolean, ignoreSelectable = true) {
    tableRef.value?.toggleRowSelection(row, selected, ignoreSelectable)
  },
  toggleAllSelection() {
    tableRef.value?.toggleAllSelection()
  },
  toggleRowExpansion(row: any, expanded?: boolean) {
    tableRef.value?.toggleRowExpansion(row, expanded)
  },
  setCurrentRow(row: any) {
    tableRef.value?.setCurrentRow(row)
  },
  clearSort() {
    tableRef.value?.clearSort()
  },
  clearFilter() {
    tableRef.value?.clearFilter()
  },
  doLayout() {
    tableRef.value?.doLayout()
  },
  sort(prop: string, order: string) {
    tableRef.value?.sort(prop, order)
  },
  scrollTo(options: number | ScrollToOptions, yCoord?: number) {
    tableRef.value?.scrollTo(options, yCoord)
  },
  setScrollTop(top?: number) {
    tableRef.value?.setScrollTop(top)
  },
  setScrollLeft(left?: number) {
    tableRef.value?.setScrollLeft(left)
  },
  getColumns() {
    return tableRef.value?.columns ?? []
  },
  updateKeyChildren(key: string, data: any[]) {
    return tableRef.value?.updateKeyChildren(key, data)
  }
})
</script>
