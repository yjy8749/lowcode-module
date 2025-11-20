import { Component } from 'vue'
import { ActionButtonProps } from '../common/ActionButton.vue'

export const ALL_OPTIONS_VALUE = '__ALL__'

export const COLUMN_INDEX_PROP = '__INDEX__'

export const COLUMN_ACTION_PROP = '__ACTION__'

export interface QueryDomainWhereParams {
  name?: string
  symbol?: string
  value?: any
  values?: any[]
  ands?: QueryDomainWhereParams[]
  ors?: QueryDomainWhereParams[]
}

export interface QueryDomainPageSortParams {
  field?: string
  order?: string
}

export interface QueryDomainPageParams {
  pageNo?: number
  pageSize?: number
  sortingFields?: QueryDomainPageSortParams[]
}

export interface QueryDomainParams {
  pageParams?: QueryDomainPageParams
  whereParams?: QueryDomainWhereParams[]
}

export interface QuerierTableHelpTextProps {
  title?: string
  content?: string
  url?: string
}

export interface QuerierTableBodyColumnProps {
  label?: string
  prop?: string
  width?: string
  hidden?: boolean
  splitChar?: string
  columnType?: 'index' | 'action' | 'datetime' | 'route' | 'link' | 'html' | 'dict' | 'image'
  datetimeFormat?: string
  dataPattern?: string
  dictType?: string
  defaultSlot?: Component
  fixed?: boolean | 'left' | 'right'
  rowKey?: boolean
}

export interface QuerierTableOptions {
  label: string
  value: string | number | boolean
  children?: QuerierTableOptions[]
}

export interface QuerierTableBodyRowActionsProps {
  scope?: { row: any; $index: number }
  expandRowActions?: boolean
  foldRowActions?: boolean
  autoFoldNum?: number
  rowActions?: ActionButtonProps[]
}

export interface QuerierTableSearchFieldProps {
  label?: string
  helps?: string
  prop?: string
  symbolType?: string
  inputType?: string
  defaultValue?: any
  hidden?: boolean
  span?: number
  placeholder?: string
  dictType?: string
}

export interface QuerierTableBodyProps {
  data?: any[]
  columns?: QuerierTableBodyColumnProps[]
  expandRowActions?: boolean
  foldRowActions?: boolean
  autoFoldNum?: number
  rowActions?: ActionButtonProps[]
  height?: number
  stripe?: boolean
  border?: boolean
  selectable?: boolean
  selectedRows?: any[]
  minSelectCount?: number
  maxSelectCount?: number
  appendSelectMode?: boolean
  rowSelectable?: (row: any) => boolean
  rowKey?: (row: any) => string | undefined
}

export interface QuerierTableSearchProps {
  searchBtnSpan?: number
  searchs?: QuerierTableSearchFieldProps[]
  searchActions?: ActionButtonProps[]
  disableSetting?: boolean
}

export interface QuerierTableOperationProps {
  operationActions?: ActionButtonProps[]
}

export interface QuerierTableCommonProps {
  helps?: QuerierTableHelpTextProps[]
  defaultPageSize?: number
  enableSearch?: boolean
  enablePagination?: boolean
  loadOnInit?: boolean
  defaultWhereParams?:
    | QueryDomainWhereParams[]
    | (() => QueryDomainWhereParams[])
    | (() => Promise<QueryDomainWhereParams[]>)
  loadData?: (params: QueryDomainParams) => Promise<any>
  itemProcess?: (item?: any) => any | Promise<any>
  itemSelectable?: (item?: any) => boolean | Promise<boolean>
}

export type QuerierTableProps = QuerierTableCommonProps &
  QuerierTableSearchProps &
  QuerierTableOperationProps &
  QuerierTableBodyProps

export interface QuerierTableSettingProps {
  columnHiddenCfg: Record<string, boolean>
}
