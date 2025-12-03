<template>
  <div class="-mb-15px">
    <ContentWrap v-if="showTopArea">
      <!-- 提示区 -->
      <QuerierTableHelpText v-for="(item, index) in helps" :key="index" v-bind="item" />

      <!-- 查询区 -->
      <QuerierTableSearch
        v-if="enableSearch"
        ref="searchRef"
        :searchs="searchs"
        :searchActions="searchActions"
        :disableSetting="!!slots.tableBodySlot"
        :searchActionsSpan="searchActionsSpan"
        @search="() => doSearch({ pageParams: { pageNo: 1 } })"
        @open-setting="() => openSetting()"
      >
        <template v-if="slots.searchActionSlot" #searchActionSlot>
          <slot name="searchActionSlot"></slot>
        </template>
      </QuerierTableSearch>

      <!-- 操作区 -->
      <QuerierTableOperation :operationActions="operationActions">
        <template v-if="slots.operationActionSlot" #operationActionSlot>
          <slot name="operationActionSlot"></slot>
        </template>
      </QuerierTableOperation>
    </ContentWrap>
    <ContentWrap v-loading="loading">
      <div class="flex flex-col gap-2">
        <!-- 表头插槽 -->
        <slot v-if="slots.tableHeaderSlot" name="tableHeaderSlot"></slot>
        <!-- 已选择信息区 -->
        <div class="flex justify-between gap-2" v-if="selectable">
          <div
            v-if="slots.tableBodySlot"
            class="flex gap-2 items-center"
            @click.stop="doToggleSelectionAll"
          >
            <el-text>全选</el-text>
            <el-checkbox
              :model-value="selectionAllStatus.checked"
              :indeterminate="selectionAllStatus.indeterminate"
            />
          </div>
          <div v-else></div>
          <div>
            <el-text type="success">
              已选择
              <el-text
                class="cursor-pointer"
                :type="!isEmpty(selectedRows) ? 'primary' : 'danger'"
                @click.stop="toggleShowSelectedRows"
              >
                {{ selectedRows.length }}
              </el-text>
              条数据
            </el-text>
            <el-button
              v-if="!isEmpty(selectedRows)"
              type="primary"
              link
              @click.stop="doClearSelection"
            >
              清空
            </el-button>
            <el-text type="warning" v-if="!isEmpty(selectCountTips)">
              {{ selectCountTips }}
            </el-text>
          </div>
        </div>
        <!-- 表格插槽区 -->
        <template v-if="slots.tableBodySlot">
          <div class="min-h-60px flex justify-center items-center" v-if="isEmpty(tableData)">
            <EmptyText text="暂无数据" />
          </div>
          <slot v-else name="tableBodySlot" :data="tableData" :selectedRows="selectedRows"></slot>
        </template>
        <!-- 表格数据区 -->
        <template v-else>
          <QuerierTableBody
            ref="tableBodyRef"
            :height="height"
            :data="tableData"
            :columns="columns"
            :selectable="selectable"
            :min-select-count="minSelectCount"
            :max-select-count="maxSelectCount"
            :expand-row-actions="expandRowActions"
            :fold-row-actions="foldRowActions"
            :auto-fold-num="autoFoldNum"
            :row-actions="rowActions"
            :rowSelectable="isRowSelectable"
            :row-key="getRowKey"
            @current-change="onCurrentChange"
            @selection-change="onSelectionChange"
          />
        </template>
        <!-- 分页区 -->
        <div class="flex justify-end" v-if="enablePagination">
          <QuerierTablePage
            class="!my-0 !float-none"
            v-model="pageParams"
            @page="() => doSearch({ pageParams })"
          />
        </div>
        <!-- 表尾插槽 -->
        <slot v-if="slots.tableFooterSlot" name="tableFooterSlot"></slot>
      </div>
    </ContentWrap>

    <!-- 表格设置 -->
    <QuerierTableSettingDialog ref="settingDialogRef" @confirm="saveSetting" />
  </div>
</template>
<script lang="ts" setup>
import { isEmpty, isArray, isNullOrUnDef } from '@/utils/is'
import EmptyText from '../common/EmptyText.vue'
import {
  QuerierTableProps,
  QuerierTableSettingProps,
  QueryDomainPageParams,
  QueryDomainParams,
  QueryDomainWhereParams
} from './querier-table.type'
import QuerierTableHelpText from './components/QuerierTableHelpText.vue'
import QuerierTableSearch from './components/QuerierTableSearch.vue'
import QuerierTableOperation from './components/QuerierTableOperation.vue'
import QuerierTableBody from './components/QuerierTableBody.vue'
import QuerierTablePage from './components/QuerierTablePage.vue'
import QuerierTableSettingDialog from './components/QuerierTableSettingDialog.vue'
import { getTableBodyColumnKey, getTableBodyColumnProp } from './querier-table.utils'
import { useDebounceFn } from '@vueuse/core'
import { joinKeys, isPromise } from '../common/utils'

export type QuerierTableEmits = {
  change: [val: any[]]
}

const props = withDefaults(defineProps<QuerierTableProps>(), {
  enableSearch: true,
  enablePagination: true,
  defaultPageSize: 10,
  loadOnInit: true
})

const emits = defineEmits<QuerierTableEmits>()

const settingDialogRef = ref<InstanceType<typeof QuerierTableSettingDialog>>()

const message = useMessage()

const slots = useSlots()

const showTopArea = computed(() => {
  return (
    !isEmpty(props.helps) ||
    props.enableSearch ||
    !isEmpty(props.operationActions) ||
    slots.operationActionSlot
  )
})

const searchRef = ref<InstanceType<typeof QuerierTableSearch>>()
const tableBodyRef = ref<InstanceType<typeof QuerierTableBody>>()

const loading = ref(false)

const pageParams = ref<QueryDomainPageParams & { total: number }>({
  total: 0,
  pageNo: 1,
  pageSize: props.defaultPageSize
})

const selectedWhereParams = ref<QueryDomainWhereParams[] | undefined>()

const tableData = ref(props.data ?? [])

const columns = computed(() =>
  props.columns?.filter((c) => {
    const key = getTableBodyColumnKey(c)
    return !(setting.value.columnHiddenCfg[key] ?? c.hidden)
  })
)

const setting = ref<QuerierTableSettingProps>({ columnHiddenCfg: {} })

const openSetting = () => {
  settingDialogRef.value?.open({
    columns: props.columns ?? [],
    setting: setting.value
  })
}

const saveSetting = (val: QuerierTableSettingProps) => {
  setting.value = { ...val }
}

const rowKeyColumns = computed(() => props.columns?.filter((col) => col.rowKey) ?? [])

const getRowKey = (row?: any): string | undefined => {
  if (!isNullOrUnDef(row)) {
    if (props.rowKey) {
      return props.rowKey(row)
    } else {
      const rowKeys = rowKeyColumns.value.map((col) => row[getTableBodyColumnProp(col)])
      return !isEmpty(rowKeys) ? joinKeys(rowKeys) : (row.id ?? row.__key__)
    }
  }
}

const selectedRowsToParams = (vals?: any): QueryDomainWhereParams[] => {
  const params: QueryDomainWhereParams[] = []
  if (!isEmpty(rowKeyColumns.value) && !isEmpty(vals)) {
    rowKeyColumns.value.forEach((col) => {
      const prop = getTableBodyColumnProp(col)
      params.push({ name: prop, symbol: 'IN', values: [...new Set(vals.map((e) => e[prop]))] })
    })
    if (rowKeyColumns.value.length > 1) {
      params.push({
        symbol: 'NONE',
        ors: vals.map((val) => {
          return {
            symbol: 'NONE',
            ands: rowKeyColumns.value.map((col) => {
              const prop = getTableBodyColumnProp(col)
              return { name: prop, symbol: 'EQ', value: val[prop] }
            })
          }
        })
      })
    }
  }
  return params
}

const onTableDataChange = useDebounceFn(() => {
  emits('change', tableData.value)
}, 100)

const doSearch = async (params?: QueryDomainParams) => {
  pageParams.value.pageNo = params?.pageParams?.pageNo ?? pageParams.value.pageNo
  pageParams.value.pageSize = params?.pageParams?.pageSize ?? pageParams.value.pageSize
  pageParams.value.sortingFields =
    params?.pageParams?.sortingFields ?? pageParams.value.sortingFields
  await doLoadData({ ...params, pageParams: pageParams.value })
  if (!isNullOrUnDef(params?.whereParams)) {
    searchRef.value?.setWhereParams(params.whereParams)
  }
}

const getDefaultWhereParams = async () => {
  let defaultWhereParams: QueryDomainWhereParams[] = []
  if (!isNullOrUnDef(props.defaultWhereParams)) {
    if (isArray(props.defaultWhereParams)) {
      defaultWhereParams = props.defaultWhereParams ?? []
    } else {
      const result = props.defaultWhereParams?.()
      if (!isNullOrUnDef(result) && isPromise(result)) {
        defaultWhereParams = await result
      } else {
        defaultWhereParams = result ?? []
      }
    }
  }
  return defaultWhereParams
}

const doLoadData = async (params: QueryDomainParams) => {
  try {
    loading.value = true
    if (!isNullOrUnDef(props.loadData)) {
      const queryParams: QueryDomainParams = {}
      if (isEmpty(selectedWhereParams.value)) {
        queryParams.whereParams = [
          ...(await getDefaultWhereParams()),
          ...(params?.whereParams ?? searchRef.value?.getWhereParams() ?? [])
        ]
      } else {
        queryParams.whereParams = selectedWhereParams.value
      }
      if (props.enablePagination) {
        queryParams.pageParams = { ...params?.pageParams }
      }
      const { data } = await props.loadData(queryParams)
      if (data.list) {
        tableData.value = data.list
      } else {
        tableData.value = data
      }
      if (data.total) {
        pageParams.value.total = data.total
      } else {
        pageParams.value.total = tableData.value.length
      }
      if (!isNullOrUnDef(props.itemProcess)) {
        nextTick(() => {
          tableData.value.forEach(async (item, index) => {
            const result = props.itemProcess?.(item)
            tableData.value[index] = isPromise(result) ? await result : result
            onTableDataChange()
          })
        })
      } else {
        onTableDataChange()
      }
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const currentRow = ref<any | undefined>()

const onCurrentChange = (val?: any) => {
  currentRow.value = val
}

const selectedRows = ref<any[]>([])

const selectCountTips = computed(() => {
  if (props.minSelectCount != props.maxSelectCount) {
    if (!isNullOrUnDef(props.minSelectCount) && !isNullOrUnDef(props.maxSelectCount)) {
      return `请选择 ${props.minSelectCount} 到 ${props.maxSelectCount} 条数据`
    } else if (!isNullOrUnDef(props.minSelectCount)) {
      return `至少选择 ${props.minSelectCount} 条数据`
    } else if (!isNullOrUnDef(props.maxSelectCount)) {
      return `最多选择 ${props.maxSelectCount} 条数据`
    } else {
      return ''
    }
  } else {
    if (!isNullOrUnDef(props.minSelectCount)) {
      return `需选择 ${props.minSelectCount} 条数据`
    } else {
      return ''
    }
  }
})

const onSelectionChange = (val?: any[]) => {
  selectedRows.value = val ?? []
}

const selectionAllStatus = computed(() => {
  const selectableData = tableData.value.filter(isRowSelectable)
  const selectedRowKeys = selectedRows.value.map(getRowKey)
  const tableRowKeySet = new Set(selectableData.map(getRowKey))
  const hasRowsNotInTable = selectedRows.value.some((row) => !tableRowKeySet.has(getRowKey(row)))
  const hasSelectedInTable = selectableData.some((e) => selectedRowKeys.includes(getRowKey(e)))
  const hasUnselectedInTable = selectableData.some((e) => !selectedRowKeys.includes(getRowKey(e)))
  let indeterminate = hasSelectedInTable && hasUnselectedInTable
  if (!hasSelectedInTable && hasRowsNotInTable) {
    indeterminate = true
  }
  return {
    checked: hasSelectedInTable,
    indeterminate
  }
})

const doToggleSelectionAll = () => {
  const selectableData = tableData.value.filter(isRowSelectable)
  const status = selectionAllStatus.value
  const selectedRowKeys = new Set(selectedRows.value.map(getRowKey))
  if (status.indeterminate) {
    const unselectedRows = selectableData.filter((row) => !selectedRowKeys.has(getRowKey(row)))
    toggleRowsSelection(unselectedRows)
  } else {
    toggleRowsSelection(selectableData)
  }
}

const doClearSelection = async () => {
  await message.confirm('是否清除全部已选择数据')
  selectedWhereParams.value = undefined
  doSearch({ pageParams: { pageNo: 1 } }).then(() =>
    setSelectedRows(props.appendSelectMode ? props.selectedRows : [])
  )
}

const toggleShowSelectedRows = () => {
  if (selectedWhereParams.value) {
    selectedWhereParams.value = undefined
    doSearch({ pageParams: { pageNo: 1 } })
  } else if (!isEmpty(selectedRows.value)) {
    selectedWhereParams.value = selectedRowsToParams(selectedRows.value)
    doSearch({ pageParams: { pageNo: 1 } })
  }
}

const preSelectedRowKeys = computed(() => props.selectedRows?.map((e) => getRowKey(e)) ?? [])

const isRowSelectable = (row: any): boolean => {
  if (props.appendSelectMode && !isEmpty(preSelectedRowKeys.value)) {
    if (preSelectedRowKeys.value.includes(getRowKey(row))) {
      return false
    }
  }
  if (!isNullOrUnDef(props.itemSelectable)) {
    if (!props.itemSelectable(row)) {
      return false
    }
  }
  if (!isNullOrUnDef(props.minSelectCount) && selectedRows.value.length <= props.minSelectCount) {
    return !selectedRows.value.some((e) => getRowKey(e) == getRowKey(row))
  }
  if (!isNullOrUnDef(props.maxSelectCount) && selectedRows.value.length >= props.maxSelectCount) {
    return selectedRows.value.some((e) => getRowKey(e) == getRowKey(row))
  }
  return true
}

const setSelectedRows = (vals?: any[]) => {
  if (!isNullOrUnDef(slots.tableBodySlot)) {
    selectedRows.value = vals ?? []
  } else {
    tableBodyRef.value?.clearSelection()
    nextTick(() => {
      vals?.forEach((r) => {
        tableBodyRef.value?.toggleRowSelection(r)
      })
    })
  }
}

const toggleRowsSelection = (val: any) => {
  const items = (isArray(val) ? val : [val]).filter(isRowSelectable)
  if (!isNullOrUnDef(slots.tableBodySlot)) {
    const currentKeys = new Set(selectedRows.value.map((e) => getRowKey(e)))
    const newSelectedRows = selectedRows.value
      .filter((row) => {
        const key = getRowKey(row)
        return !items.some((item) => getRowKey(item) === key)
      })
      .concat(items.filter((item) => isRowSelectable(item) && !currentKeys.has(getRowKey(item))))
    selectedRows.value = newSelectedRows
  } else {
    items.forEach((item) => tableBodyRef.value?.toggleRowSelection(item))
  }
}

defineExpose({
  getRowActionsConfig() {
    return {
      expandRowActions: props.expandRowActions,
      foldRowActions: props.foldRowActions,
      autoFoldNum: props.autoFoldNum,
      rowActions: props.rowActions
    }
  },
  getCurrentRow() {
    return currentRow.value
  },
  setCurrentRow(val?: any) {
    currentRow.value = val
  },
  toggleCurrentRow(val: any) {
    if (getRowKey(val) == getRowKey(currentRow.value)) {
      currentRow.value = undefined
    } else {
      currentRow.value = val
    }
  },
  isCurrentRow(val: any) {
    return getRowKey(val) == getRowKey(currentRow.value)
  },
  getSelectedRows() {
    return selectedRows.value
  },
  setSelectedRows(val?: any) {
    selectedWhereParams.value = selectedRowsToParams(val)
    doSearch({ pageParams: { pageNo: 1 } }).then(() => setSelectedRows(val))
  },
  toggleRowsSelection,
  isRowSelectable,
  isRowChecked(val: any) {
    return selectedRows.value.some((e) => getRowKey(e) == getRowKey(val))
  },
  async getValidSelectedRows(): Promise<any[]> {
    if (!isNullOrUnDef(props.minSelectCount) && selectedRows.value.length < props.minSelectCount) {
      const msg = `至少选择${props.minSelectCount}条数据`
      message.error(msg)
      throw new Error(msg)
    }
    if (!isNullOrUnDef(props.maxSelectCount) && selectedRows.value.length > props.maxSelectCount) {
      const msg = `最多选择${props.maxSelectCount}条数据`
      message.error(msg)
      throw new Error(msg)
    }
    return selectedRows.value
  },
  doSearch
})

onBeforeMount(() => {
  selectedWhereParams.value = selectedRowsToParams(props.selectedRows)
  if (props.loadOnInit) {
    doSearch({ pageParams: { pageNo: 1 } }).then(() => setSelectedRows(props.selectedRows))
  }
})
</script>
