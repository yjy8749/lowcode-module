import { generateVid, joinKeys } from '../common/utils'
import { isNullOrUnDef, isEmpty } from '@/utils/is'
import mitt from 'mitt'
import { useMessage } from '@/hooks/web/useMessage'
import {
  DesignerEditorTask,
  DesignerEditorCmd,
  WidgetRenderContext,
  DesignerEditorData,
  FILE_SOURCE_DESIGNER,
  DesignerStoreState,
  DraggingData,
  DesignerStore,
  GetDataResult,
  DESIGNER_DATA_TYPE_MAIN,
  WidgetDataDefine
} from './designer-editor.type'
import { MaterialFileDataApi, MaterialFileDataVO } from '@/api/lowcode/materialfiledata'
import { promiseWithLoading } from './designer-editor.utils'

function defaultEditorData(): DesignerEditorData {
  return {
    _vid: generateVid(),
    pageBgColor: undefined,
    drawerPanelAutoOpen: false,
    designPageWidth: undefined,
    requestUrlMode: 'REF_PROJECT',
    requestUrlBase: undefined,
    widgetTree: []
  }
}

function defaultMaterialFileData(fileId: number): MaterialFileDataVO {
  return {
    id: 0,
    fileId,
    fileSource: FILE_SOURCE_DESIGNER,
    dataType: DESIGNER_DATA_TYPE_MAIN,
    version: 0,
    data: JSON.stringify(defaultEditorData())
  }
}

function defaultDesignerStoreState(isPreview?: boolean, isDesign?: boolean): DesignerStoreState {
  return {
    loadtime: new Date().getTime(),
    loading: false,
    loadingContext: {},
    saving: false,
    executing: false,
    isDesignMode: isDesign ?? (isPreview == true ? false : true),
    isPreviewMode: isPreview === true ? true : false,
    drawerPanelOpened: false,
    loadErrorMsg: undefined,
    materialFileData: undefined,
    editorData: defaultEditorData(),
    widgetRenderContext: {},
    widgetExposeContext: {},
    executorResult: {},
    undoLogList: [],
    redoLogList: [],
    selectedWidgetId: undefined,
    taskQueue: [],
    pendingTaskIds: new Set(),
    taskExecuteTimer: undefined,
    locationWidgetId: undefined,
    locationDataId: undefined,
    dragging: false,
    draggingData: undefined,
    refreshWidgetId: undefined
  }
}

const CACHE: Record<number, DesignerStore | undefined> = {}

export function useDesignerStore(args: {
  fileId?: number
  version?: number
  isPreview?: boolean
  isDesign?: boolean
  editorData?: DesignerEditorData
}): DesignerStore {
  const cacheKey = joinKeys(args.fileId, args.version, args.isPreview, args.editorData?._vid)
  if (!isNullOrUnDef(CACHE[cacheKey])) {
    return CACHE[cacheKey]
  }

  const message = useMessage()

  const emitter = mitt()

  const state = ref(defaultDesignerStoreState(args.isPreview, args.isDesign))

  const setState = (key: keyof DesignerStoreState, val: any) => {
    state.value[key as string] = val
  }

  const setEditorData = (key: keyof DesignerEditorData, val: any) => {
    state.value.editorData[key as string] = val
  }

  const resetState = () => {
    Object.entries(defaultDesignerStoreState(args.isPreview, args.isDesign)).forEach(
      ([key, val]) => {
        state.value[key] = val
      }
    )
  }

  const setLocation = (args?: { widgetId?: string; dataId?: string }) => {
    state.value.locationWidgetId = args?.widgetId
    state.value.locationDataId = args?.dataId
  }

  const setDragging = (dragging: boolean, data?: DraggingData) => {
    state.value.dragging = dragging
    state.value.draggingData = data
  }

  const setRefresh = (args?: { _vid?: string }) => {
    if (state.value.refreshWidgetId == args?._vid) {
      state.value.refreshWidgetId = undefined
      nextTick(() => {
        state.value.refreshWidgetId = args?._vid
      })
    } else {
      state.value.refreshWidgetId = args?._vid
    }
  }

  const setSelected = (widdget?: { _vid: string }) => {
    if (state.value.selectedWidgetId != widdget?._vid) {
      state.value.selectedWidgetId = widdget?._vid
      if (!isNullOrUnDef(widdget) && state.value.editorData.drawerPanelAutoOpen) {
        state.value.drawerPanelOpened = true
      }
    } else {
      if (isNullOrUnDef(widdget)) {
        state.value.selectedWidgetId = undefined
        state.value.drawerPanelOpened = false
      }
    }
  }

  const addUndoLog = (log: DesignerEditorCmd) => {
    state.value.undoLogList.push(log)
    if (state.value.undoLogList.length > 100) {
      state.value.undoLogList.pop()
    }
    state.value.redoLogList = []
  }

  const getAndPopUndoLog = (): DesignerEditorCmd | undefined => {
    return state.value.undoLogList.pop()
  }

  const addRedoLog = (log: DesignerEditorCmd) => {
    state.value.redoLogList.push(log)
    if (state.value.redoLogList.length > 100) {
      state.value.redoLogList.pop()
    }
  }

  const getAndPopRedoLog = (): DesignerEditorCmd | undefined => {
    return state.value.redoLogList.pop()
  }

  const executeTask = async () => {
    while (!isEmpty(state.value.taskQueue)) {
      const task = state.value.taskQueue.shift()!
      const taskId = (task.id as any)._vid || task.id
      try {
        await task.execute()
        state.value.pendingTaskIds.delete(taskId)
      } catch (error) {
        console.error(`Task ${task.id} failed:`, error)
      }
    }
  }

  const addTask = (task: DesignerEditorTask) => {
    const taskId = (task.id as any)._vid || task.id
    if (state.value.pendingTaskIds.has(taskId)) return
    state.value.pendingTaskIds.add(taskId)
    state.value.taskQueue.push(task)
    clearTimeout(state.value.taskExecuteTimer)
    state.value.taskExecuteTimer = setTimeout(() => {
      promiseWithLoading((val) => putLoadingContext(taskId, val), executeTask())
    }, 300)
  }

  const putLoadingContext = (key: string, loading: boolean) => {
    state.value.loadingContext[key] = loading
  }

  const putExecutorResult = (def?: WidgetDataDefine, value?: GetDataResult) => {
    if (!isNullOrUnDef(def) && ['def', 'remote', 'const', 'submit'].includes(def._type)) {
      const tempData = state.value.executorResult[def._vid]?.data
      state.value.executorResult[def._vid] = value
      if (!isNullOrUnDef(tempData)) {
        state.value.executorResult[def._vid]!.data ??= tempData
      }
    }
  }

  const putWidgetExposeContext = (_vid?: string, value?: Record<string, any>) => {
    if (!isNullOrUnDef(_vid)) {
      state.value.widgetExposeContext[_vid] = value
    }
  }

  const putWidgetRenderContext = (_vid?: string, value?: WidgetRenderContext) => {
    if (!isNullOrUnDef(_vid)) {
      state.value.widgetRenderContext[_vid] = value
    }
  }

  const useWidgetRenderContext = (_vid: string) => {
    return state.value.widgetRenderContext[_vid]
  }

  const loadMaterialFileData = async (isPreview?: boolean) => {
    if (!isNullOrUnDef(args.editorData)) {
      //本地加载
      resetState()
      state.value.loading = false
      state.value.isPreviewMode = true
      state.value.isDesignMode = false
      state.value.editorData = args.editorData
    } else if (!isNullOrUnDef(args.fileId)) {
      //远程加载
      if (state.value.loading) return
      try {
        resetState()
        state.value.loading = true
        state.value.isPreviewMode = isPreview ?? state.value.isPreviewMode
        const fileData = await MaterialFileDataApi.getMaterialFileData({
          fileId: args.fileId,
          fileSource: FILE_SOURCE_DESIGNER,
          dataType: DESIGNER_DATA_TYPE_MAIN,
          version: args.version
        })
        state.value.materialFileData = fileData ?? defaultMaterialFileData(args.fileId)
        state.value.editorData = JSON.parse(state.value.materialFileData?.data ?? '{}')
      } catch (e) {
        state.value.loadErrorMsg = `${e}`
      } finally {
        state.value.loading = false
      }
    } else {
      state.value.loadErrorMsg = `参数不正确, 无法加载页面数据`
    }
  }

  const saveMaterialFileData = async () => {
    if (state.value.saving) return
    try {
      state.value.saving = true
      const saveData = { ...(state.value.materialFileData ?? {}) }
      saveData.version = (saveData.version ?? 0) + 1
      saveData.data = JSON.stringify(state.value.editorData)
      const newFileData = await MaterialFileDataApi.saveMaterialFileData(saveData)
      if (newFileData?.version != saveData.version) {
        message.confirm(`保存失败, 是否重新加载?`).then(() => loadMaterialFileData())
        return
      }
      state.value.materialFileData = newFileData
    } finally {
      state.value.saving = false
    }
  }

  const refreshEditor = async () => {
    if (state.value.loading) return
    state.value.loading = true
    nextTick(() => {
      state.value.loading = false
    })
  }

  onUnmounted(() => {
    CACHE[cacheKey] = undefined
    emitter.all.clear()
  })

  const store: DesignerStore = {
    state,
    emitter,
    isPreviewMode: computed(() => state.value.isPreviewMode),
    isDesignMode: computed(() => state.value.isDesignMode),
    isLoaded: computed(() => !isNullOrUnDef(state.value.materialFileData)),
    isLoading: computed(() => state.value.loading),
    isLoadError: computed(() => !isEmpty(state.value.loadErrorMsg)),
    isSaving: computed(() => state.value.saving),
    isUndoLogEmpty: computed(() => isEmpty(state.value.undoLogList)),
    isRedoLogEmpty: computed(() => isEmpty(state.value.redoLogList)),
    hasLoadingContext: computed(
      () => !isNullOrUnDef(Object.values(state.value.loadingContext).find((e) => e))
    ),
    setState,
    resetState,
    setEditorData,
    setLocation,
    setDragging,
    setRefresh,
    setSelected,
    executeTask,
    addTask,
    addUndoLog,
    getAndPopUndoLog,
    addRedoLog,
    getAndPopRedoLog,
    putExecutorResult,
    putWidgetExposeContext,
    putWidgetRenderContext,
    useWidgetRenderContext,
    loadMaterialFileData,
    saveMaterialFileData,
    refreshEditor,
    putLoadingContext
  }

  CACHE[cacheKey] = store

  return store
}
