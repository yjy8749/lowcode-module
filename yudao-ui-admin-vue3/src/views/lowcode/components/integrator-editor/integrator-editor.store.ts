import { isNullOrUnDef, isEmpty } from '@/utils/is'
import { joinKeys } from '../common/utils'
import { MaterialFileDataApi, MaterialFileDataVO } from '@/api/lowcode/materialfiledata'
import { useMessage } from '@/hooks/web/useMessage'
import {
  FILE_SOURCE_INTEGRATOR,
  INTEGRATOR_DATA_TYPE_MAIN,
  IntegratorEditorData,
  IntegratorStore,
  IntegratorStoreState,
  IntegratorSyncConfig
} from './integrator-editor.type'
import { IntegratorEditorApi } from '@/api/lowcode/editor/integrator'

function defaultEditorData(args?: Partial<IntegratorEditorData>): IntegratorEditorData {
  return {
    currentStep: 0,
    querierSelectedIds: [],
    designerSelectedIds: [],
    integratorConfigIds: [],
    integratorSyncConfigs: [],
    integratorSyncLogs: [],
    ...args
  }
}

function defaultMaterialFileData(fileId: number): MaterialFileDataVO {
  return {
    id: 0,
    fileId,
    fileSource: FILE_SOURCE_INTEGRATOR,
    version: 0,
    dataType: INTEGRATOR_DATA_TYPE_MAIN,
    data: JSON.stringify(defaultEditorData())
  }
}

function defaultIntegratorStoreState(isPreview?: boolean): IntegratorStoreState {
  return {
    isPreviewMode: isPreview ?? false,
    loading: false,
    loadErrorMsg: undefined,
    saving: false,
    materialFileData: undefined,
    editorData: defaultEditorData(),
    selectedConfigLoading: false,
    selectedConfigs: [],
    syncing: false
  }
}

const CACHE: Record<number, IntegratorStore | undefined> = {}

export function useIntegratorStore(fileId: number, isPreview?: boolean): IntegratorStore {
  const cacheKey = joinKeys(fileId, isPreview)

  if (!isNullOrUnDef(CACHE[cacheKey])) {
    return CACHE[cacheKey]
  }

  const message = useMessage()

  const state = ref(defaultIntegratorStoreState(isPreview))

  const setState = (key: keyof IntegratorStoreState, val: any) => {
    state.value[key as string] = val
  }

  const resetState = () => {
    Object.entries(defaultIntegratorStoreState(isPreview)).forEach(([key, val]) => {
      state.value[key] = val
    })
  }

  const loadMaterialFileData = async () => {
    if (state.value.loading) return
    try {
      resetState()
      state.value.loading = true
      const fileData = await MaterialFileDataApi.getMaterialFileData({
        fileId,
        fileSource: FILE_SOURCE_INTEGRATOR,
        dataType: INTEGRATOR_DATA_TYPE_MAIN
      })
      state.value.materialFileData = fileData ?? defaultMaterialFileData(fileId)
      state.value.editorData = JSON.parse(state.value.materialFileData?.data ?? '{}')
    } catch (e) {
      state.value.loadErrorMsg = `${e}`
    } finally {
      state.value.loading = false
    }
  }

  const saveMaterialFileData = async (editorData: IntegratorEditorData, ignoreSaving?: boolean) => {
    if (state.value.saving) return
    try {
      if (!ignoreSaving) state.value.saving = true
      const saveData = { ...(state.value.materialFileData ?? {}) }
      saveData.version = (saveData.version ?? 0) + 1
      saveData.data = JSON.stringify(editorData)
      const newFileData = await MaterialFileDataApi.saveMaterialFileData(saveData)
      if (newFileData?.version != saveData.version) {
        message.confirm(`保存失败, 是否重新加载?`).then(loadMaterialFileData)
        return
      }
      state.value.materialFileData = newFileData
    } finally {
      if (!ignoreSaving) state.value.saving = false
    }
  }

  const nexStep = async () => {
    if (state.value.editorData.currentStep == 1) {
      if (
        isEmpty(state.value.editorData.querierSelectedIds) &&
        isEmpty(state.value.editorData.designerSelectedIds)
      ) {
        return message.error('请选择要集成的接口和页面数据')
      }
    }
    if (state.value.editorData.currentStep == 2) {
      if (isEmpty(state.value.editorData.integratorConfigIds)) {
        return message.error('请选择要使用的集成配置')
      }
    }
    if (state.value.editorData.currentStep++ > 3) {
      state.value.editorData.currentStep = 0
    }
    await saveMaterialFileData(state.value.editorData)
  }

  const prevStep = async () => {
    if (state.value.editorData.currentStep-- < 0) {
      state.value.editorData.currentStep = 0
    }
  }

  const setQuerierSelectedIds = (ids: number[]) => {
    state.value.editorData.querierSelectedIds = ids ?? []
  }

  const setDesignerSelectedIds = (ids: number[]) => {
    state.value.editorData.designerSelectedIds = ids ?? []
  }

  const setIntegratorConfigIds = (ids: number[]) => {
    state.value.editorData.integratorConfigIds = ids ?? []
  }

  const pushSyncLog = (type: string, msg: string) => {
    state.value.editorData.integratorSyncLogs = [
      ...state.value.editorData.integratorSyncLogs,
      { type, msg }
    ]
  }

  const toggleSyncConfigIsPull = (id: number) => {
    state.value.editorData.integratorSyncConfigs = state.value.editorData.integratorSyncConfigs.map(
      (e) => {
        return e.id == id ? { ...e, isPull: !e.isPull } : { ...e, isPull: false }
      }
    )
  }

  const loadSyncConfigs = async () => {
    if (!isEmpty(state.value.editorData.integratorConfigIds)) {
      try {
        state.value.selectedConfigLoading = true
        state.value.selectedConfigs = await IntegratorEditorApi.getIntegratorConfigList({
          ids: state.value.editorData.integratorConfigIds
        })
      } finally {
        state.value.selectedConfigLoading = false
      }
    } else {
      state.value.selectedConfigs = []
    }
    state.value.editorData.integratorSyncConfigs = state.value.selectedConfigs.map((cfg) => {
      const existCfg = state.value.editorData.integratorSyncConfigs.find((e) => e.id == cfg.id)
      return {
        id: cfg.id,
        configName: cfg.configName,
        isPull: existCfg?.isPull ?? false,
        isDone: false,
        querierSuccessIds: [],
        designerSuccessIds: []
      }
    })
  }

  const startAsyncForFile = async (cfg: IntegratorSyncConfig, fileId: number) => {
    try {
      pushSyncLog('primary', `======== 开始同步文件 ${fileId} ========`)
      pushSyncLog('info', `开始同步文件 配置 ${cfg.configName}, 文件: ${fileId}`)
      await IntegratorEditorApi.integratorEntrySync({
        configId: cfg.id,
        isPull: cfg.isPull,
        fileId
      })
      pushSyncLog('success', `同步文件成功 配置 ${cfg.configName}, 文件: ${fileId}`)
    } catch (e) {
      console.error(`startAsyncForFile error ${e}`, e)
      pushSyncLog('danger', `同步文件失败 配置 ${cfg.configName}, 文件: ${fileId} ${e}`)
    }
  }

  const startAsyncForConfig = async (cfg: IntegratorSyncConfig) => {
    try {
      cfg.querierSuccessIds = []
      cfg.designerSuccessIds = []
      pushSyncLog('primary', `======== 开始同步配置 ${cfg.configName} ${cfg.id} ========`)
      if (!isEmpty(state.value.editorData.querierSelectedIds)) {
        pushSyncLog('primary', `同步配置 ${cfg.configName} 查询器接口数据`)
        cfg.isDone = false
        for (const id of state.value.editorData.querierSelectedIds) {
          await startAsyncForFile(cfg, id)
          cfg.querierSuccessIds.push(id)
        }
        cfg.isDone = true
      }
      if (!isEmpty(state.value.editorData.designerSelectedIds)) {
        pushSyncLog('primary', `同步配置 ${cfg.configName} 设计器页面数据`)
        cfg.isDone = false
        for (const id of state.value.editorData.designerSelectedIds) {
          await startAsyncForFile(cfg, id)
          cfg.designerSuccessIds.push(id)
        }
        cfg.isDone = true
      }
      pushSyncLog('success', `同步配置成功 ${cfg.configName} ${cfg.id}`)
    } catch (e) {
      console.error(`startAsyncForConfig error ${e}`, e)
      pushSyncLog('danger', `同步配置失败 ${cfg.configName} ${cfg.id} ${e}`)
    }
  }

  const startAsync = async () => {
    try {
      state.value.editorData.integratorSyncLogs = []
      state.value.syncing = true
      pushSyncLog('primary', '开始同步...')
      const pullConfigs = state.value.editorData.integratorSyncConfigs.filter((e) => e.isPull)
      if (!isEmpty(pullConfigs)) {
        pushSyncLog('primary', '开始同步 拉取 模式的配置数据')
        for (const cfg of pullConfigs) {
          await startAsyncForConfig(cfg)
        }
      }
      const pushConfigs = state.value.editorData.integratorSyncConfigs.filter((e) => !e.isPull)
      if (!isEmpty(pushConfigs)) {
        pushSyncLog('primary', '开始同步 推送 模式的配置数据')
        for (const cfg of pushConfigs) {
          await startAsyncForConfig(cfg)
        }
      }
      pushSyncLog('success', '同步成功...')
      await saveMaterialFileData(state.value.editorData, true)
    } finally {
      state.value.syncing = false
    }
  }

  onUnmounted(() => {
    CACHE[cacheKey] = undefined
  })

  const store: IntegratorStore = {
    state,
    isPreviewMode: computed(() => state.value.isPreviewMode),
    isLoaded: computed(() => !isNullOrUnDef(state.value.materialFileData)),
    isLoading: computed(() => state.value.loading),
    isLoadError: computed(() => !isEmpty(state.value.loadErrorMsg)),
    isSaving: computed(() => state.value.saving),
    isSelectedConfigLoading: computed(() => state.value.selectedConfigLoading),
    isSyncing: computed(() => state.value.syncing),
    setState,
    resetState,
    loadMaterialFileData,
    saveMaterialFileData,
    nexStep,
    prevStep,
    setQuerierSelectedIds,
    setDesignerSelectedIds,
    setIntegratorConfigIds,
    pushSyncLog,
    toggleSyncConfigIsPull,
    loadSyncConfigs,
    startAsync
  }

  CACHE[cacheKey] = store

  return store
}
