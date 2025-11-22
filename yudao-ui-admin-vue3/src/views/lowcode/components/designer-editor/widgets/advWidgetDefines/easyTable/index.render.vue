<!-- index.render.vue -->
<template>
  <QuerierTable ref="tableRef" v-bind="tableAttrs" :loadData="loadData" @change="onTableDataChange">
    <template v-for="slotWidget in tableSlots" :key="slotWidget.slotKey" #[slotWidget.slotKey]>
      <WidgetItem
        :editor="editor"
        :parentWidget="widget"
        :parentContext="widgetContext"
        :widget="slotWidget"
        :options="widgetItemOptions"
      />
    </template>
  </QuerierTable>
</template>
<script lang="ts" setup>
import WidgetItem from '../../../components/WidgetItem.vue'
import { useWidget, type WidgetRenderProps } from '../../hooks'
import QuerierTable from '../../../../querier-table/index.vue'
import {
  requestDataDefine,
  createDataDefine,
  customWidgetOptions
} from '../../../designer-editor.utils'
import { getTableDataId } from './utils'
import { useDataDefineExecutor } from '../../../components/dataDefine/hooks'
import { WidgetInstance } from '../../../designer-editor.type'

const tableRef = ref<InstanceType<typeof QuerierTable>>()

const widgetItemOptions = customWidgetOptions({ putable: true, selectable: true })

const props = defineProps<WidgetRenderProps>()

const {
  refresh,
  context,
  useSlotObject,
  usePropValue,
  usePropObject,
  toActionButtonProps,
  toEvalFunction
} = useWidget(props)

const tableAttrs = computed(() => {
  return {
    ...usePropObject(
      'columns',
      'height',
      'enableSearch',
      'enablePagination',
      'expandRowActions',
      'foldRowActions',
      'enableTableBodySlot',
      'selectable',
      'minSelectCount',
      'maxSelectCount',
      'selectedRows',
      'appendSelectMode',
      'autoFoldNum',
      'loadOnInit'
    ),
    searchs: usePropValue('searchs').map((e) => {
      return {
        ...e,
        remoteMethod: toEvalFunction(e.remoteMethod),
        load: toEvalFunction(e.load),
        filterMethod: toEvalFunction(e.filterMethod),
        disabledDate: toEvalFunction(e.disabledDate)
      }
    }),
    searchActions: toActionButtonProps(usePropValue('searchActions')),
    operationActions: toActionButtonProps(usePropValue('operationActions')),
    rowActions: toActionButtonProps(usePropValue('rowActions')),
    itemProcess: toEvalFunction(usePropValue('itemProcessFunction')),
    itemSelectable: toEvalFunction(usePropValue('itemSelectableFunction')),
    defaultWhereParams: toEvalFunction(usePropValue('defaultParamsFunction'))
  }
})

const tableSlots = computed(() => {
  const enableSearchActionSlot = usePropValue('enableSearchActionSlot')
  const enableOperationActionSlot = usePropValue('enableOperationActionSlot')
  const enableTableHeaderSlot = usePropValue('enableTableHeaderSlot')
  const enableTableFooterSlot = usePropValue('enableTableFooterSlot')
  const enableTableBodySlot = usePropValue('enableTableBodySlot')
  const slotObject = useSlotObject()
  if (!enableSearchActionSlot) {
    delete slotObject['searchActionSlot']
  }
  if (!enableOperationActionSlot) {
    delete slotObject['operationActionSlot']
  }
  if (!enableTableHeaderSlot) {
    delete slotObject['tableHeaderSlot']
  }
  if (!enableTableFooterSlot) {
    delete slotObject['tableFooterSlot']
  }
  if (!enableTableBodySlot) {
    delete slotObject['tableBodySlot']
  }
  return Object.values(slotObject) as WidgetInstance[]
})

const { value: tableDataValue } = useDataDefineExecutor(props.editor, {
  dataDefine: (props.widget.dataDefines ?? []).find((d) => d._vid == getTableDataId(props.widget))
})

const onTableDataChange = (data: any[]) => {
  tableDataValue.value = data
}

const loadData = async (params) => {
  return await requestDataDefine(
    props.editor,
    createDataDefine({
      _type: 'remote',
      requestUrlMode: usePropValue('requestUrlMode'),
      requestUrl: usePropValue('requestUrl'),
      requestMethod: usePropValue('requestMethod'),
      isShowLoading: false,
      isShowSuccessMsg: false
    }),
    {
      requestBody: params
    }
  )
}

context({
  refresh,
  tableRef: () => tableRef.value,
  isSelectable: () => tableAttrs.value.selectable
})
</script>
