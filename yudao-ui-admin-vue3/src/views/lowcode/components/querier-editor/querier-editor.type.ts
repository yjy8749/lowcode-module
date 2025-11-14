import { MaterialFileDataVO } from '@/api/lowcode/materialfiledata'

export const FILE_SOURCE_QUERIER = 1

export const DEFAULT_CACHE_TTL = 5000

export const QUERIER_DATA_TYPE_MAIN = 0

/** 编辑器Store State */
export interface QuerierStoreState {
  loading: boolean
  loadErrorMsg?: string
  saving: boolean
  deploying: boolean
  isPreviewMode: boolean
  materialFileData?: MaterialFileDataVO
  editorData: QuerierEditorData
}

/** 编辑器Store */
export interface QuerierStore {
  state: Ref<QuerierStoreState>
  isLoaded: ComputedRef<boolean>
  isLoading: ComputedRef<boolean>
  isLoadError: ComputedRef<boolean>
  isPreviewMode: ComputedRef<boolean>
  isSaving: ComputedRef<boolean>
  isDeploying: ComputedRef<boolean>
  setState: (key: keyof QuerierStoreState, val: any) => void
  resetState: () => void
  loadMaterialFileData: () => Promise<void>
  saveMaterialFileData: (editorData: QuerierEditorData) => Promise<void>
  deployApiDeploy: (editorData: QuerierEditorData, isOfflineOther?: boolean) => Promise<void>
}

// 编辑器
export interface QuerierEditor {
  getStore: () => QuerierStore
}

export interface QuerierEditorData {
  dataSourceTableRef?: string
  dataSourceId: number
  queryXml?: string
  channels?: number[]
  queryTypes?: string[]
  apiName?: string
}
export interface QueryInterceptorPostHandleValue {
  value?: string
}
export interface QueryInterceptorPreHandleValue {
  value?: string
}
export interface QueryDomainValidTestValue {
  clazz?: string
  value?: string
}
export interface QuerySql {
  value?: string
}
export interface QueryFilterValue {
  clazz?: string
  value?: string
}
export interface QueryInterceptorValue {
  clazz?: string
  preHandleValue?: QueryInterceptorPreHandleValue
  postHandleValue?: QueryInterceptorPostHandleValue
}
export interface QueryField {
  id?: string
  name?: string
  comment?: string
  hidden?: boolean
  required?: string
  symbols?: string
  sortable?: boolean
  authType?: string
  value?: string
  disableExpt?: boolean
}
export interface QueryTable {
  id?: string
  table?: string
  desc?: string
  joinOn?: string
  leftJoinOn?: string
  disableTenant?: boolean
  disableLogicDelete?: boolean
  querySql?: QuerySql
  validTestValue?: QueryDomainValidTestValue
  queryFieldList?: QueryField[]
}
export interface QueryInterceptor {
  queryInterceptorValueList?: QueryInterceptorValue[]
}
export interface QueryWhere {
  value?: string
}
export interface QueryFilter {
  queryFilterValueList?: QueryFilterValue[]
}
export interface QueryDomain {
  desc?: string
  permission?: string
  maxReturnRows?: number
  cache?: boolean
  ttl?: number
  login?: boolean
  mainTableList?: QueryTable[]
  queryTableList?: QueryTable[]
  queryFieldList?: QueryField[]
  queryWhere?: QueryWhere
  queryInterceptor?: QueryInterceptor
  queryFilter?: QueryFilter
}
