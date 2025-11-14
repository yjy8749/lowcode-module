import { IntegratorConfigVO } from '@/api/lowcode/editor/integrator'
import { MaterialFileDataVO } from '@/api/lowcode/materialfiledata'

export const FILE_SOURCE_INTEGRATOR = 3

export const INTEGRATOR_DATA_TYPE_MAIN = 0

/** 编辑器Store State */
export interface IntegratorStoreState {
  loading: boolean
  loadErrorMsg?: string
  saving: boolean
  isPreviewMode: boolean
  materialFileData?: MaterialFileDataVO
  editorData: IntegratorEditorData
  selectedConfigLoading: boolean
  selectedConfigs: IntegratorConfigVO[]
  syncing: boolean
}

/** 编辑器Store */
export interface IntegratorStore {
  state: Ref<IntegratorStoreState>
  isLoaded: ComputedRef<boolean>
  isLoading: ComputedRef<boolean>
  isLoadError: ComputedRef<boolean>
  isPreviewMode: ComputedRef<boolean>
  isSaving: ComputedRef<boolean>
  isSelectedConfigLoading: ComputedRef<boolean>
  isSyncing: ComputedRef<boolean>
  setState: (key: keyof IntegratorStoreState, val: any) => void
  resetState: () => void
  loadMaterialFileData: () => Promise<void>
  saveMaterialFileData: (editorData: IntegratorEditorData) => Promise<void>
  nexStep: () => Promise<void>
  prevStep: () => Promise<void>
  setQuerierSelectedIds: (ids: number[]) => void
  setDesignerSelectedIds: (ids: number[]) => void
  setIntegratorConfigIds: (ids: number[]) => void
  pushSyncLog: (type: string, msg: string) => void
  toggleSyncConfigIsPull: (id: number) => void
  loadSyncConfigs: () => Promise<void>
  startAsync: () => Promise<void>
}

// 编辑器
export interface IntegratorEditor {
  getStore: () => IntegratorStore
}

export interface IntegratorSyncConfig {
  id: number
  configName: string
  isPull: boolean
  isDone: boolean
  querierSuccessIds: number[]
  designerSuccessIds: number[]
}

export interface IntegratorEditorData {
  currentStep: number
  querierSelectedIds: number[]
  designerSelectedIds: number[]
  integratorConfigIds: number[]
  integratorSyncConfigs: IntegratorSyncConfig[]
  integratorSyncLogs: { type: string; msg: string }[]
}
