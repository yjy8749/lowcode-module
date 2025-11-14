import { isNullOrUnDef, isEmpty } from '@/utils/is'
import { joinKeys } from '../common/utils'
import { MaterialFileDataApi, MaterialFileDataVO } from '@/api/lowcode/materialfiledata'
import { DeployApiDeployReqVO, QuerierEditorApi } from '@/api/lowcode/editor/querier/index'
import { useMessage } from '@/hooks/web/useMessage'
import {
  FILE_SOURCE_QUERIER,
  QUERIER_DATA_TYPE_MAIN,
  QuerierEditorData,
  QuerierStore,
  QuerierStoreState
} from './querier-editor.type'

function defaultEditorData(args?: Partial<QuerierEditorData>): QuerierEditorData {
  return {
    dataSourceTableRef: '',
    dataSourceId: 0,
    queryXml: '',
    channels: [],
    queryTypes: [],
    ...args
  }
}

function defaultMaterialFileData(fileId: number): MaterialFileDataVO {
  return {
    id: 0,
    fileId,
    fileSource: FILE_SOURCE_QUERIER,
    version: 0,
    dataType: QUERIER_DATA_TYPE_MAIN,
    data: JSON.stringify(defaultEditorData())
  }
}

function defaultQuerierStoreState(isPreview?: boolean): QuerierStoreState {
  return {
    isPreviewMode: isPreview ?? false,
    loading: false,
    loadErrorMsg: undefined,
    saving: false,
    deploying: false,
    materialFileData: undefined,
    editorData: defaultEditorData()
  }
}

const CACHE: Record<number, QuerierStore | undefined> = {}

export function useQuerierStore(fileId: number, isPreview?: boolean): QuerierStore {
  const cacheKey = joinKeys(fileId, isPreview)

  if (!isNullOrUnDef(CACHE[cacheKey])) {
    return CACHE[cacheKey]
  }

  const message = useMessage()

  const state = ref(defaultQuerierStoreState(isPreview))

  const setState = (key: keyof QuerierStoreState, val: any) => {
    state.value[key as string] = val
  }

  const resetState = () => {
    Object.entries(defaultQuerierStoreState(isPreview)).forEach(([key, val]) => {
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
        fileSource: FILE_SOURCE_QUERIER,
        dataType: QUERIER_DATA_TYPE_MAIN
      })
      state.value.materialFileData = fileData ?? defaultMaterialFileData(fileId)
      state.value.editorData = JSON.parse(state.value.materialFileData?.data ?? '{}')
    } catch (e) {
      state.value.loadErrorMsg = `${e}`
    } finally {
      state.value.loading = false
    }
  }

  const saveMaterialFileData = async (editorData: QuerierEditorData) => {
    if (state.value.saving || state.value.deploying) return
    try {
      state.value.saving = true
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
      state.value.saving = false
    }
  }

  const deployApiDeploy = async (editorData: QuerierEditorData, isOfflineOther?: boolean) => {
    if (state.value.saving || state.value.deploying) return
    try {
      state.value.deploying = true
      const deployData: Partial<DeployApiDeployReqVO> = { ...(state.value.materialFileData ?? {}) }
      deployData.version = (deployData.version ?? 0) + 1
      deployData.data = JSON.stringify(editorData)
      deployData.isOfflineOther = isOfflineOther
      const newFileData = await QuerierEditorApi.deployApiDeploy(deployData)
      state.value.materialFileData = newFileData
    } finally {
      state.value.deploying = false
    }
  }

  onUnmounted(() => {
    CACHE[cacheKey] = undefined
  })

  const store: QuerierStore = {
    state,
    isPreviewMode: computed(() => state.value.isPreviewMode),
    isLoaded: computed(() => !isNullOrUnDef(state.value.materialFileData)),
    isLoading: computed(() => state.value.loading),
    isLoadError: computed(() => !isEmpty(state.value.loadErrorMsg)),
    isSaving: computed(() => state.value.saving),
    isDeploying: computed(() => state.value.deploying),
    setState,
    resetState,
    loadMaterialFileData,
    saveMaterialFileData,
    deployApiDeploy
  }

  CACHE[cacheKey] = store

  return store
}
