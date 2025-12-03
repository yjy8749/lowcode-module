<template>
  <QuerierTable
    :helps="helps"
    :searchs="searchs"
    :columns="columns"
    :row-actions="rowActions"
    :loadData="loadData"
  />
</template>
<script lang="ts" setup>
import { requestOriginal } from '@/api/lowcode/utils'
import QuerierTable from '@/views/lowcode/components//querier-table/index.vue'
import {
  QuerierTableBodyColumnProps,
  QuerierTableHelpTextProps,
  QuerierTableSearchFieldProps,
  QueryDomainParams
} from '@/views/lowcode/components/querier-table/querier-table.type'
import { ActionButtonProps } from '@/views/lowcode/components/common/ActionButton.vue'

const message = useMessage()

// 提示区文本配置
const helps = ref<QuerierTableHelpTextProps[]>([{ content: '提示文本1' }, { content: '提示文本2' }])

// 查询区配置
const searchs = ref<QuerierTableSearchFieldProps[]>([
  {
    label: '目录名',
    helps: '目录名查询条件帮助提示',
    prop: 'name',
    span: 6,
    symbolType: 'EQ',
    inputType: 'input',
    placeholder: '请输入用户名'
  }
])

// 表格列配置
const columns = ref<QuerierTableBodyColumnProps[]>([
  {
    label: '主键',
    rowKey: true,
    prop: 'id'
  },
  {
    label: '目录名',
    prop: 'name'
  },
  {
    label: '操作',
    columnType: 'action'
  }
])

// 行操作配置
const rowActions = ref<ActionButtonProps[]>([
  {
    label: '查看',
    type: 'primary',
    onClick: (row: any) => {
      message.success(`查看${JSON.stringify(row)}`)
    }
  },
  {
    label: '编辑',
    type: 'warning',
    onClick: (row: any) => {
      message.success(`编辑${row}`)
    }
  }
])

// 数据加载函数
const loadData = async (data: QueryDomainParams) => {
  return await requestOriginal({
    method: 'post',
    url: '/lowcode/deploy-api/lowcode-media-dir/select-page',
    data
  })
}
</script>
