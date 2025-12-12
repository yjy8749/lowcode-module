import {
  AlignItemsOptions,
  DesignerEditorCmd,
  WidgetRenderContext,
  DesignerEditorData,
  DisplayOptions,
  FlexDirectionOptions,
  FlexWrapOptions,
  JustifyContentOptions,
  SeekDataFunction,
  CheckDataDefineResult,
  SeekWidgetFunction,
  WidgetDataDefine,
  WidgetDefine,
  WidgetInstance,
  WidgetPropDefine,
  WidgetPropDefineBind,
  WidgetPropDefineBindType,
  WidgetDataDefineRequestHeaders,
  WidgetDataDefineRequestFormData,
  WidgetItemOptions,
  SeekWidgetFunctionResult,
  WidgetPropDefineBindBase,
  DesignerEditorEventBind,
  DesignerEditorEvalFunction,
  DEFAULT_EVAL_FUNCTION_DEALY,
  DesignerEditorEventDefine,
  EvalFnContext,
  DesignerEditor,
  PAGE_DEFINE_NO,
  CssSymbols,
  GetDataArgs,
  SLOT_DEFAULT_KEY
} from './designer-editor.type'
import { cloneDeep } from 'lodash-es'
import { isArray, isEmpty, isFunction, isString, isNullOrUnDef } from '@/utils/is'
import { jsonParse } from '@/utils'
import { useWidgetDefine } from './widgets'
import {
  DATA_EMPTY_NAME_FLAG,
  DATA_VALUE_ITEM_FLAG,
  readValueByJsonPath,
  joinKeys,
  generateVid,
  copyValue
} from '../common/utils'
import { useDebounceFn, useThrottleFn } from '@vueuse/core'
import {
  edgeInsetsDefine,
  eventDefine,
  formatInputNumberDefine,
  inputDefine,
  inputNumberDefine,
  propBindDefine,
  radioButtonDefine
} from './designer-editor.props'
import request from '@/config/axios'
import { useMessage } from '@/hooks/web/useMessage'
import { useDataDefineAnalyzer, useDataDefineExecutor } from './components/dataDefine/hooks'
import { writePropValuesCmd, writeWidgetValueCmd } from './designer-editor.cmd'
import { computed } from 'vue'
import { highlightTextHtml } from '../common/utils'
import download from '@/utils/download'
import { requestOriginal } from '@/api/lowcode/utils'

/** 参数是否为 DesignerEditor */
export function isDesignerEditor(val?: any): val is DesignerEditor {
  return (
    !isNullOrUnDef(val) &&
    !isNullOrUnDef(val.getStore) &&
    !isNullOrUnDef(val.getEmitter) &&
    isFunction(val.getStore) &&
    isFunction(val.getEmitter)
  )
}

const message = useMessage()

const DEFAULT_CACHE_OPTIONS = {
  ttl: 1000,
  cacheKey: (args) => {
    return isDesignerEditor(args[0]) ? JSON.stringify(args.slice(1)) : JSON.stringify(args)
  }
}

type CacheableFunction<P extends any[], T> = (...args: P) => T

interface CacheOptions<P extends any[]> {
  ttl: number
  cacheKey: (args: P) => string
}

/** 基于 Vue 3 computed 的响应式缓存函数 */
function useCacheable<P extends any[], T>(
  fn: CacheableFunction<P, T>,
  options?: CacheOptions<P>
): CacheableFunction<P, T> {
  const cache = new Map<string, { value: ComputedRef<T>; expiresAt: number }>()

  options ??= DEFAULT_CACHE_OPTIONS
  function getCacheKey(args: P): string {
    return joinKeys(fn.name, options?.cacheKey(args))
  }

  return function (...args: P): T {
    const key = getCacheKey(args)
    const now = Date.now()
    if (cache.has(key)) {
      const cached = cache.get(key)!
      if (now < cached.expiresAt) {
        return cached.value.value
      }
      cache.delete(key)
    }

    const result = computed<T>(() => {
      return fn(...args)
    })
    const expiresAt = now + options.ttl
    cache.set(key, { value: result, expiresAt })

    let isEnableTtl = true
    if (!isNullOrUnDef(args[0]?.getStore) && isFunction(args[0]?.getStore)) {
      //仅设计模式下开启ttl
      isEnableTtl = args[0].getStore().isDesignMode.value
    }
    if (isEnableTtl) {
      setTimeout(() => {
        cache.delete(key)
      }, options.ttl)
    }
    return result.value
  }
}

/** 构建自定义事件Key */
export function getCustomEventKey(key: string): string {
  return `${PAGE_DEFINE_NO}custom__${key}`
}

/** 构建组件完整Key */
export function widgetFullKey(args: { _moduleName?: string; _key?: string }) {
  if (!isNullOrUnDef(args._moduleName)) {
    return joinKeys(args._moduleName, args._key)
  } else {
    return `${args._key}`
  }
}

/** 构建Const Data Define Key */
export function buildConstVid(widget: WidgetInstance, name: string): string {
  return joinKeys(widget._vid, name)
}

/** 获取组件id or var */
export function getWidgetShortVidOrVar(widget: WidgetInstance): string {
  return widget._var ?? widget._vid.substring(widget._vid.length - 6)
}

/** 获取组件展示label */
export function getWidgetShowLabel(widget: WidgetInstance): string {
  return `${widget.label}${getWidgetShortVidOrVar(widget)}`
}

/** 复制组件id or var */
export function copyWidgetVidOrVar(widget?: WidgetInstance) {
  copyValue(widget?._var ?? widget?._vid, !isNullOrUnDef(widget?._var) ? '组件变量' : '组件ID')
}

/** 解析属性定义默认值 */
export function toDefaultValue(
  editor: DesignerEditor,
  propDefines?: WidgetPropDefine[]
): Record<string, any> {
  return Object.fromEntries(
    (propDefines ?? [])
      .map((define) => {
        if (isFunction(define.defaultValue)) {
          return [define.key, define.defaultValue?.(editor)]
        } else {
          return [define.key, define.defaultValue]
        }
      })
      .filter((e) => !isNullOrUnDef(e[1]))
  )
}

/** 创建组件实例-默认 */
export function createWidgetInstanceDefault(
  editor: DesignerEditor,
  widgetDef: WidgetDefine,
  slotKey?: string,
  defaultProps?: Record<string, any>
): WidgetInstance {
  if (isNullOrUnDef(widgetDef._key)) {
    throw new Error('widgetDef._key 不能是 undefined')
  }
  if (isNullOrUnDef(widgetDef._moduleName)) {
    throw new Error('widgetDef._moduleName 不能是 undefined')
  }
  return {
    _vid: generateVid(),
    _key: widgetDef._key!,
    _moduleName: widgetDef._moduleName!,
    label: widgetDef.label,
    slotKey: slotKey,
    props: {
      ...toDefaultValue(editor, widgetDef.baseDesignerProps),
      ...toDefaultValue(editor, widgetDef.advDesignerProps),
      ...toDefaultValue(editor, widgetDef.styleDesignerProps),
      ...toDefaultValue(editor, widgetDef.innerStyleDesignerProps),
      ...toDefaultValue(editor, widgetDef.outerStyleDesignerProps),
      ...cloneDeep(widgetDef.props ?? {}),
      ...defaultProps
    },
    slots: [],
    slotChildren: []
  }
}
/** 创建带有上下文的组件实例-默认 */
export function createWidgetRenderContextDefault(
  editor: DesignerEditor,
  widgetDef: WidgetDefine,
  slotKey?: string,
  args?: {
    parentWidget?: WidgetInstance
    parentRenderContext?: WidgetRenderContext
    options?: WidgetItemOptions
    defaultProps?: Record<string, any>
  }
): {
  editor: DesignerEditor
  parentWidget?: WidgetInstance
  parentRenderContext?: WidgetRenderContext
  widget: WidgetInstance
  widgetRenderContext: WidgetRenderContext
} {
  return {
    editor,
    parentWidget: args?.parentWidget,
    parentRenderContext: args?.parentRenderContext,
    widget: createWidgetInstanceDefault(editor, widgetDef, slotKey, args?.defaultProps),
    widgetRenderContext: regenWidgetRenderContext(
      editor,
      args?.parentWidget,
      args?.parentRenderContext,
      args?.options
    )
  }
}

/** 判断组件是否为定义实例 */
export function isWidgetInstanceOf(w: WidgetInstance, d: { _key?: string; _moduleName?: string }) {
  return w._moduleName == d._moduleName && w._key == d._key
}

/** 创建组件实例 */
export async function createWidgetInstance(
  editor: DesignerEditor,
  widgetDef: WidgetDefine,
  args?: {
    _vid?: string
    _var?: string
    slotKey?: string
    parentWidget?: WidgetInstance
    parentRenderContext?: WidgetRenderContext
    options?: WidgetItemOptions
    defaultProps?: Record<string, any>
    slots?: WidgetInstance[]
  }
): Promise<WidgetInstance> {
  let widget: WidgetInstance
  if (!isNullOrUnDef(widgetDef.create)) {
    widget = await widgetDef.create(editor, widgetDef, args)
  } else {
    widget = createWidgetInstanceDefault(editor, widgetDef, undefined, args?.defaultProps)
  }
  widget._vid = args?._vid ?? widget._vid
  widget._var = args?._var ?? widget._var
  widget.slotKey = args?.slotKey ?? widget.slotKey
  widget.slots = args?.slots ?? widget.slots
  return widget
}

/** 创建数据定义 */
export function createDataDefine(args?: Partial<WidgetDataDefine>): WidgetDataDefine {
  return {
    _vid: generateVid(),
    _var: undefined,
    _type: 'def',
    widgetId: undefined,
    name: undefined,
    scope: 'global',
    propDefines: [],
    jsonData: '{}',
    refBind: {},
    isAutoLoad: true,
    requestUrlMode: 'REF_PROJECT',
    requestUrl: undefined,
    requestMethod: 'get',
    isShowLoading: true,
    isShowErrorMsg: true,
    isShowSuccessMsg: false,
    successMsg: undefined,
    requestHeadersType: 'disable',
    requestHeaders: undefined,
    requestFormDataType: 'disable',
    requestFormData: undefined,
    requestBodyType: 'disable',
    requestBody: undefined,
    responseBody: undefined,
    jsonDataPath: 'data',
    runtimeFunction: undefined,
    analyzerFunction: undefined,
    onSuccess: undefined,
    onError: undefined,
    ...(args ?? {})
  }
}

/** 获取组件树 */
export function useWidgetTree(editor: DesignerEditor): WidgetInstance[] {
  return readEditorDataValue(editor, 'widgetTree')
}

/** 根据参数检索组件 */
export function seekWidget(
  list?: WidgetInstance[],
  args?: { _vid?: string; _var?: string }
): WidgetInstance | undefined {
  if (!isNullOrUnDef(list) && !isNullOrUnDef(args)) {
    for (let i = 0; i < list.length; i++) {
      const item = list[i]
      if (
        (!isNullOrUnDef(args._vid) && item._vid == args._vid) ||
        (!isNullOrUnDef(args._var) && item._var == args._var)
      ) {
        return item
      } else {
        const r1 = seekWidget(item.slots, args)
        if (!isNullOrUnDef(r1)) {
          return r1
        }
        const r2 = seekWidget(item.slotChildren, args)
        if (!isNullOrUnDef(r2)) {
          return r2
        }
      }
    }
  }
  return undefined
}

/** 根据 id 获取组件实际函数 */
export function useWidgetByIdActual(
  editor: DesignerEditor,
  _vid?: string
): WidgetInstance | undefined {
  console.time(`组件检索 useWidgetByIdActual ${_vid}`)
  const r = seekWidget(useWidgetTree(editor), { _vid })
  console.timeEnd(`组件检索 useWidgetByIdActual ${_vid}`)
  return r
}

/** 根据 id 获取组件缓存函数 */
const useWidgetByIdCacheable = useCacheable(useWidgetByIdActual)

/** 根据 id 获取组件 */
export function useWidgetById(editor: DesignerEditor, _vid?: string): WidgetInstance | undefined {
  return useWidgetByIdCacheable(editor, _vid)
}

/** 根据 var 获取组件实际函数 */
export function useWidgetByVarActual(
  editor: DesignerEditor,
  _var?: string
): WidgetInstance | undefined {
  console.time(`组件检索 useWidgetByVarActual ${_var}`)
  const r = seekWidget(useWidgetTree(editor), { _var })
  console.timeEnd(`组件检索 useWidgetByVarActual ${_var}`)
  return r
}

/** 根据 var 获取组件缓存函数 */
const useWidgetByVarCacheable = useCacheable(useWidgetByVarActual)

/** 根据 var 获取组件 */
export function useWidgetByVar(editor: DesignerEditor, _var?: string): WidgetInstance | undefined {
  return useWidgetByVarCacheable(editor, _var)
}

/** 获取组件获取 slot children */
export function useWidgetSlotChildren(
  editor: DesignerEditor,
  _vid?: string
): WidgetInstance[] | undefined {
  return useWidgetById(editor, _vid)?.slotChildren
}

/** 获取组件树或者插槽List */
export function useSlotChildrenOrTree(
  editor: DesignerEditor,
  _vid?: string
): WidgetInstance[] | undefined {
  return !isNullOrUnDef(_vid) ? useWidgetSlotChildren(editor, _vid) : useWidgetTree(editor)
}

/** 根据ID查询组件所在位置 */
export function indexOfWidgetById(list?: WidgetInstance[], _vid?: string): number {
  if (!isNullOrUnDef(list) && !isNullOrUnDef(_vid)) {
    return list?.findIndex((e) => e._vid == _vid)
  }
  return -1
}

/** 根据组件所在位置返回组件 */
export function getWidgetAtIndex(
  list?: WidgetInstance[],
  index?: number
): WidgetInstance | undefined {
  if (!isNullOrUnDef(list) && !isNullOrUnDef(index) && index >= 0 && index < list.length) {
    return list[index]
  }
  return undefined
}

/** 添加组件到对应位置 */
export function addWidgetAtIndex(
  list?: WidgetInstance[],
  widget?: WidgetInstance,
  index?: number
): boolean {
  if (!isNullOrUnDef(list) && !isNullOrUnDef(widget) && !isNullOrUnDef(index) && index >= 0) {
    if (!list[index] || list[index]._vid != widget._vid) {
      list.splice(index, 0, widget)
    }
    return true
  }
  return false
}

/** 从对应位置移除组件 */
export function delWidgetAtIndex(list?: WidgetInstance[], index?: number): boolean {
  if (!isNullOrUnDef(list) && !isNullOrUnDef(index) && index >= 0 && index < list.length) {
    if (list[index]) {
      list.splice(index, 1)
    }
    return true
  }
  return false
}

/** 根据ID移除组件 */
export function delWidgetById(list?: WidgetInstance[], _vid?: string): boolean {
  if (!isNullOrUnDef(list) && !isNullOrUnDef(_vid)) {
    return delWidgetAtIndex(list, indexOfWidgetById(list, _vid))
  }
  return false
}

/** 根据位置索引移动组件 */
export function moveWidgetByIndex(list?: WidgetInstance[], from?: number, to?: number): boolean {
  if (!isNullOrUnDef(list) && !isNullOrUnDef(from) && !isNullOrUnDef(to) && from >= 0 && to >= 0) {
    if (from == to) {
      return true
    }
    const temp = list.splice(from, 1)[0]
    if (!isNullOrUnDef(temp)) {
      list.splice(to, 0, temp)
      return true
    }
  }
  return false
}

/** 根据组件id移动组件 */
export function moveWidgetById(list?: WidgetInstance[], _vid?: string, to?: number): boolean {
  if (!isNullOrUnDef(list) && !isNullOrUnDef(_vid) && !isNullOrUnDef(to) && to >= 0) {
    const toWidget = getWidgetAtIndex(list, to)
    if (!isNullOrUnDef(toWidget) && toWidget._vid == _vid) {
      return true
    }
    return moveWidgetByIndex(list, indexOfWidgetById(list, _vid), to)
  }
  return false
}

/** 重新生成vid, 如果vid需要替换则用新的替换 */
function regenerateVid(_oldVid: string, _regenVidMap?: Record<string, string>) {
  let _vid = _oldVid
  if (!isNullOrUnDef(_regenVidMap)) {
    Object.entries(_regenVidMap).forEach(([_old, _new]) => {
      if (_vid.includes(_old)) {
        _vid = _vid.replaceAll(_old, _new)
      }
    })
  }
  return _vid === _oldVid ? generateVid() : _vid
}

/** 重新生成数据定义ID */
function regenOtherIdAndReBind(widget: WidgetInstance, _regenVidMap: Record<string, string>) {
  useWidgetDataDefines(widget).forEach((data) => {
    const _oldVid = data._vid
    const _newId = regenerateVid(data._vid, _regenVidMap)
    _regenVidMap[_oldVid] = _newId
    data._vid = _newId
    data._var = undefined
    data.widgetId = widget._vid
  })
  if (!isNullOrUnDef(widget.propsBind)) {
    Object.entries(widget.propsBind).forEach(([_, propBind]) => {
      propBind?.bindList?.forEach((refBind) => {
        if (!isNullOrUnDef(refBind.bind?.refWidgetId)) {
          const _oldVid = refBind.bind.refWidgetId
          if (_regenVidMap[_oldVid]) {
            refBind.bind.refWidgetId = _regenVidMap[_oldVid]
          }
          if (!isNullOrUnDef(refBind?.bind?.refDataId)) {
            refBind.bind.refDataId = refBind.bind.refDataId.replace(
              _oldVid,
              refBind.bind.refWidgetId
            )
          }
        }
        if (!isNullOrUnDef(refBind?.bind?.refDataId) && _regenVidMap[refBind?.bind?.refDataId]) {
          refBind.bind.refDataId = _regenVidMap[refBind.bind.refDataId]
        }
      })
    })
  }
}

/** 重新生成组件Id */
function regenWidgetId(widget: WidgetInstance, _regenVidMap?: Record<string, string>) {
  _regenVidMap ??= {}
  const _oldVid = widget._vid
  widget._vid = regenerateVid(_oldVid, _regenVidMap)
  widget._var = undefined
  _regenVidMap[_oldVid] = widget._vid
  regenOtherIdAndReBind(widget, _regenVidMap)
  widget.slots.forEach((slot) => {
    regenWidgetId(slot, _regenVidMap)
  })
  widget.slotChildren.forEach((child) => {
    regenWidgetId(child, _regenVidMap)
  })
}

/** 克隆组件, 重新生成组件ID和组件变量名 */
export function cloneWidget(widget: WidgetInstance): WidgetInstance {
  const newWidget = cloneDeep(widget)
  regenWidgetId(newWidget)
  return newWidget
}

/** 读取组件属性值 */
export function readPropValue(widget?: WidgetInstance, propKey?: string): any | undefined {
  if (!isNullOrUnDef(widget) && !isNullOrUnDef(propKey) && !isNullOrUnDef(widget.props)) {
    return widget.props[propKey]
  }
  return undefined
}

/** 根据组件id读取属性 */
export function readPropValueById(
  editor: DesignerEditor,
  _vid?: string,
  propKey?: string
): any | undefined {
  return readPropValue(useWidgetById(editor, _vid), propKey)
}

/** 写入组件属性值 */
export function writePropValue(widget?: WidgetInstance, propKey?: string, propVal?: any): void {
  if (!isNullOrUnDef(widget) && !isNullOrUnDef(propKey)) {
    widget.props ??= {}
    widget.props[propKey] = propVal
  }
}

/** 根据组件id写入属性 */
export function writePropValueById(
  editor: DesignerEditor,
  _vid?: string,
  propKey?: string,
  propVal?: any
): void {
  writePropValue(useWidgetById(editor, _vid), propKey, propVal)
}

/** 读取组件属性绑定 */
export function readPropBind(
  widget?: WidgetInstance,
  propKey?: string
): WidgetPropDefineBind | undefined {
  if (!isNullOrUnDef(widget) && !isNullOrUnDef(propKey) && !isNullOrUnDef(widget.propsBind)) {
    return widget.propsBind[propKey]
  }
  return undefined
}

/** 根据组件id读取组件属性绑定 */
export function readPropBindById(
  editor: DesignerEditor,
  _vid?: string,
  propKey?: string
): WidgetPropDefineBind | undefined {
  return readPropBind(useWidgetById(editor, _vid), propKey)
}

/** 写入组件属性绑定 */
export function writePropBind(
  widget?: WidgetInstance,
  propKey?: string,
  propBind?: WidgetPropDefineBind
): void {
  if (!isNullOrUnDef(widget) && !isNullOrUnDef(propKey)) {
    widget.propsBind ??= {}
    widget.propsBind[propKey] = propBind
  }
}

/** 根据组件id写入组件属性绑定 */
export function writePropBindById(
  editor: DesignerEditor,
  _vid?: string,
  propKey?: string,
  propBind?: WidgetPropDefineBind
): void {
  writePropBind(useWidgetById(editor, _vid), propKey, propBind)
}

/** 读取组件事件绑定 */
export function readWidgetEventBind(
  widget?: WidgetInstance,
  eventKey?: string
): DesignerEditorEventBind | undefined {
  if (!isNullOrUnDef(widget) && !isNullOrUnDef(eventKey) && !isNullOrUnDef(widget.eventsBind)) {
    return widget.eventsBind[eventKey]
  }
  return undefined
}

/** 根据组件id读取事件绑定 */
export function readWidgetEventBindById(
  editor: DesignerEditor,
  _vid?: string,
  eventKey?: string
): DesignerEditorEventBind | undefined {
  return readWidgetEventBind(useWidgetById(editor, _vid), eventKey)
}

/** 写入组件事件绑定 */
export function writeWidgetEventBind(
  widget?: WidgetInstance,
  eventKey?: string,
  eventBindVal?: DesignerEditorEventBind
): void {
  if (!isNullOrUnDef(widget) && !isNullOrUnDef(eventKey)) {
    widget.eventsBind ??= {}
    widget.eventsBind[eventKey] = eventBindVal
  }
}

/** 根据组件id写入组件事件绑定 */
export function writeWidgetEventBindById(
  editor: DesignerEditor,
  _vid?: string,
  eventKey?: string,
  eventBindVal?: DesignerEditorEventBind
): void {
  writeWidgetEventBind(useWidgetById(editor, _vid), eventKey, eventBindVal)
}

/** 读取组件对象属性 */
export function readWidgetValue(widget?: WidgetInstance, propKey?: string): any | undefined {
  if (!isNullOrUnDef(widget) && !isNullOrUnDef(propKey)) {
    return widget[propKey]
  }
}

/** 根据组件id读取组件对象属性 */
export function readWidgetValueById(
  editor: DesignerEditor,
  _vid?: string,
  propKey?: string
): any | undefined {
  return readWidgetValue(useWidgetById(editor, _vid), propKey)
}

/** 写入组件对象属性 */
export function writeWidgetValue(
  editor: DesignerEditor,
  widget?: WidgetInstance,
  propKey?: string,
  propVal?: any
): void {
  if (!isNullOrUnDef(widget) && !isNullOrUnDef(propKey)) {
    if (propKey == '_var') {
      const varWidget = useWidgetByVar(editor, propVal)
      if (!isNullOrUnDef(varWidget) && widget._vid != varWidget._vid) {
        message.error('组件变量名不能重复')
        return
      }
      const idWidget = useWidgetById(editor, propVal)
      if (!isNullOrUnDef(idWidget)) {
        message.error('不能使用组件ID作为组件变量名')
        return
      }
    }
    widget[propKey] = propVal
  }
}
/** 写入组件对象属性 */
export function writeWidgetValueById(
  editor: DesignerEditor,
  _vid?: string,
  propKey?: string,
  propVal?: any
): void {
  writeWidgetValue(editor, useWidgetById(editor, _vid), propKey, propVal)
}

/** 读取组件对象属性绑定 */
export function readWidgetValueBind(
  widget?: WidgetInstance,
  propKey?: string
): WidgetPropDefineBind | undefined {
  if (!isNullOrUnDef(widget) && !isNullOrUnDef(propKey) && !isNullOrUnDef(widget._binds)) {
    return widget._binds[propKey]
  }
  return undefined
}

/** 根据组件id读取组件对象属性绑定 */
export function readWidgetValueBindById(
  editor: DesignerEditor,
  _vid?: string,
  propKey?: string
): WidgetPropDefineBind | undefined {
  return readWidgetValueBind(useWidgetById(editor, _vid), propKey)
}

/** 写入组件对象属性绑定 */
export function writeWidgetValueBind(
  widget?: WidgetInstance,
  propKey?: string,
  propBind?: WidgetPropDefineBind
): void {
  if (!isNullOrUnDef(widget) && !isNullOrUnDef(propKey)) {
    widget._binds ??= {}
    widget._binds[propKey] = propBind
  }
}

/** 根据组件id写入组件对象属性绑定 */
export function writeWidgetValueBindById(
  editor: DesignerEditor,
  _vid?: string,
  propKey?: string,
  propBind?: WidgetPropDefineBind
): void {
  writeWidgetValueBind(useWidgetById(editor, _vid), propKey, propBind)
}

/** 写入页面属性 */
export function writeEditorDataValue(
  editor: DesignerEditor,
  propKey: keyof DesignerEditorData,
  propVal?: any
): void {
  const store = editor.getStore()
  store.setEditorData(propKey, propVal)
}

/** 读取页面属性 */
export function readEditorDataValue(
  editor: DesignerEditor,
  propKey: keyof DesignerEditorData
): any | undefined {
  return editor.getStore().state.value.editorData[propKey]
}

/** 读取页面事件绑定 */
export function readPageEventBind(
  editor: DesignerEditor,
  eventKey?: string
): DesignerEditorEventBind | undefined {
  const eventsBind = readEditorDataValue(editor, 'eventsBind')
  if (!isNullOrUnDef(eventKey) && !isNullOrUnDef(eventsBind)) {
    return eventsBind[eventKey]
  }
  return undefined
}

/** 属性定义转换为绑定定义 */
export function convertPropDefineToBind(define: WidgetPropDefine): WidgetPropDefine {
  if (!(define.bindable ?? false) || define.type === 'propBind') {
    return define
  }
  return propBindDefine({
    key: define.key,
    label: define.label,
    helps: define.helps,
    isShow: define.isShow,
    onSaveBind: define.onSaveBind,
    bindType: define.bindType,
    hideLabel: define.hideLabel,
    isArray: define.isArray,
    formItemProps: {
      ...define.formItemProps,
      labelPosition: 'left'
    }
  })
}

/** 默认检索父组件方法 */
export function defaultSeekParentFunction(): SeekWidgetFunction {
  return (_, seekLink) => ({ seekWidget: undefined, seekLink })
}

/** 引用值转换函数执行 */
export function executeValueFunction(refFunction?: string, ...args: any[]): any | undefined {
  try {
    if (isEmpty(refFunction)) {
      console.error('executeValueFunction refFunction is empty return undefined')
      return undefined
    }
    return eval(refFunction!)(...args)
  } catch (error) {
    console.error('executeValueFunction error return undefined', error)
    return undefined
  }
}

/** 引用值转换函数执行 */
export function executeBindRefFunction(refFunction?: string, args?: any[]): any {
  if (!isEmpty(refFunction)) {
    return executeValueFunction(refFunction, ...(args ?? []))
  } else {
    return isArray(args) && args.length == 1 ? args[0] : args
  }
}

/** 默认检索数据方法 */
export function defaultSeekDataFunction(editor: DesignerEditor): SeekDataFunction {
  return (propBind, defaultValue) => {
    try {
      if (!isNullOrUnDef(propBind?.bindList)) {
        const bindListArgs: any = []
        for (const refBind of propBind.bindList) {
          const { refPropKey } = refBind ?? {}
          const { refWidgetId, refDataId } = refBind?.bind ?? {}

          if (isNullOrUnDef(refWidgetId) || isNullOrUnDef(refDataId) || isNullOrUnDef(refPropKey)) {
            console.error('propBind is undefined return undefined', propBind)
            return undefined
          }

          const dataDefine = useDataDefine(editor, { _vid: refWidgetId }, { _vid: refDataId })
          if (isNullOrUnDef(dataDefine)) {
            console.error('propBind ref dataDefine is undefined return undefined', propBind)
            return undefined
          }

          const { value } = useDataDefineExecutor(editor, { dataDefine, immediate: true })

          bindListArgs.push(readValueByJsonPath(value.value, refPropKey))
        }
        return executeBindRefFunction(propBind?.refFunction, bindListArgs)
      } else {
        console.info('propBind is unbind return defaultValue')
        return defaultValue
      }
    } catch (e) {
      console.error('seek data error return default value', e)
      return defaultValue
    }
  }
}

/** 父组件检索函数包装 */
function wrapSeekParentFunction(
  parentWidget?: WidgetInstance,
  parentRenderContext?: WidgetRenderContext
): SeekWidgetFunction {
  return (args, seekLink): SeekWidgetFunctionResult => {
    seekLink ??= []
    if (!isNullOrUnDef(parentWidget)) {
      seekLink.push(parentWidget)
      if (
        (!isNullOrUnDef(args?._vid) && parentWidget._vid == args?._vid) ||
        (!isNullOrUnDef(args?._var) && parentWidget._var == args?._var) ||
        (!isNullOrUnDef(args?._moduleName) &&
          !isNullOrUnDef(args?._key) &&
          widgetFullKey(parentWidget) == widgetFullKey(args)) ||
        (!isNullOrUnDef(args?._moduleName) &&
          isNullOrUnDef(args?._key) &&
          parentWidget._moduleName == args._moduleName) ||
        (!isNullOrUnDef(args?.putable) &&
          args.putable &&
          parentRenderContext?.options?.putable == true)
      ) {
        console.log('检索到父组件', args, parentWidget.label)
        return { seekWidget: parentWidget, seekLink }
      } else if (!isNullOrUnDef(parentRenderContext?.seekParent)) {
        if (args?.directParent) {
          console.warn('未检索到直接上级组件, 当前上级组件', parentWidget.label, args)
          return { seekWidget: undefined, seekLink }
        } else {
          console.warn('父组件不正确，继续向上检索', parentWidget.label, args)
          return parentRenderContext.seekParent(args, seekLink)
        }
      }
    }
    console.warn('已检索完所有父组件，未找到符合条件的父组件', args)
    return { seekWidget: undefined, seekLink }
  }
}

/** 自定义组件属性 */
export function customWidgetOptions(options?: WidgetItemOptions): WidgetItemOptions {
  return {
    selectable: false,
    putable: false,
    sortable: false,
    deleteable: false,
    copyable: false,
    ...options
  }
}

/** 重新生成组件上下文 */
export function regenWidgetRenderContext(
  editor: DesignerEditor,
  parentWidget?: WidgetInstance,
  parentRenderContext?: WidgetRenderContext,
  options?: WidgetItemOptions
): WidgetRenderContext {
  const contextOptions = parentRenderContext?.options
  return {
    ...parentRenderContext,
    seekParent: wrapSeekParentFunction(parentWidget, parentRenderContext),
    seekData: parentRenderContext?.seekData ?? defaultSeekDataFunction(editor),
    options: {
      ...options,
      selectable: (contextOptions?.selectable ?? true) && (options?.selectable ?? true),
      putable: (contextOptions?.selectable ?? true) && (options?.putable ?? false)
    }
  }
}

/** 根据参数检索数据定义 */
export function seekDataDefine(
  editor: DesignerEditor,
  list?: WidgetInstance[],
  args?: { _vid?: string; _var?: string }
): WidgetDataDefine | undefined {
  let seekResult: WidgetDataDefine | undefined
  if (!isNullOrUnDef(list) && !isNullOrUnDef(args)) {
    list?.some((item) => {
      const dataDefinesWithRuntime = useWidgetDataDefinesAndRuntime(editor, item)
      const findRef = dataDefinesWithRuntime.find((def) => {
        return (
          (!isNullOrUnDef(args._vid) && def._vid == args._vid) ||
          (!isNullOrUnDef(args._var) && def._var == args._var)
        )
      })
      if (!isNullOrUnDef(findRef)) {
        seekResult = findRef
        return true
      }
      const r1 = seekDataDefine(editor, item.slots, args)
      if (!isNullOrUnDef(r1)) {
        seekResult = r1
        return true
      }
      const r2 = seekDataDefine(editor, item.slotChildren, args)
      if (!isNullOrUnDef(r2)) {
        seekResult = r2
        return true
      }
      return false
    })
  }
  return seekResult
}

/** 根据 id 获取数据定义实际函数 */
export function useDataDefineByIdActual(
  editor: DesignerEditor,
  _vid?: string
): WidgetDataDefine | undefined {
  console.time(`数据定义检索 useDataDefineByIdActual ${_vid}`)
  const r = seekDataDefine(editor, useWidgetTree(editor), { _vid })
  console.timeEnd(`数据定义检索 useDataDefineByIdActual ${_vid}`)
  return r
}

/** 根据 id 获取数据定义缓存函数 */
const useDataDefineByIdCacheable = useCacheable(useDataDefineByIdActual)

/** 根据 id 获取数据定义 */
export function useDataDefineById(
  editor: DesignerEditor,
  _vid?: string
): WidgetDataDefine | undefined {
  return useDataDefineByIdCacheable(editor, _vid) as any
}

/** 根据 var 获取数据定义实际函数 */
export function useDataDefineByVarActual(
  editor: DesignerEditor,
  _var?: string
): WidgetDataDefine | undefined {
  console.time(`数据定义检索 useDataDefineByVarActual ${_var}`)
  const r = seekDataDefine(editor, useWidgetTree(editor), { _var })
  console.timeEnd(`数据定义检索 useDataDefineByVarActual ${_var}`)
  return r
}

/** 根据 var 获取数据定义缓存函数 */
const useDataDefineByVarCacheable = useCacheable(useDataDefineByVarActual)

/** 根据 var 获取数据定义 */
export function useDataDefineByVar(
  editor: DesignerEditor,
  _var?: string
): WidgetDataDefine | undefined {
  return useDataDefineByVarCacheable(editor, _var) as any
}

/** 获取组件数据定义实际函数 */
export function useDataDefineActual(
  editor: DesignerEditor,
  widgetArgs?: { _vid?: string; _var?: string },
  dataArgs?: { _vid?: string; _var?: string }
): WidgetDataDefine | undefined {
  const fullTimeKey = `${JSON.stringify(widgetArgs ?? {})} ${JSON.stringify(dataArgs ?? {})}`
  console.time(`获取组件数据定义 useDataDefineActual ${fullTimeKey}`)
  let widget: WidgetInstance | undefined = undefined
  if (!isNullOrUnDef(widgetArgs?._var)) {
    widget = useWidgetByVarActual(editor, widgetArgs._var)
  } else if (!isNullOrUnDef(widgetArgs?._vid)) {
    widget = useWidgetByIdActual(editor, widgetArgs._vid)
  } else {
    widget = undefined
  }
  const r = useWidgetDataDefinesAndRuntime(editor, widget).find(
    (d) =>
      (!isNullOrUnDef(dataArgs?._vid) && d._vid == dataArgs?._vid) ||
      (!isNullOrUnDef(dataArgs?._var) && d._var == dataArgs?._var)
  )
  console.timeEnd(`获取组件数据定义 useDataDefineActual ${fullTimeKey}`)
  return r
}

/** 获取组件数据定义缓存函数 */
const useDataDefineCacheable = useCacheable(useDataDefineActual, {
  ...DEFAULT_CACHE_OPTIONS,
  cacheKey: (args) => {
    return joinKeys(args[1]?._vid, args[1]?._var, args[2]?._vid, args[2]?._var)
  }
})

/** 获取组件数据定义 */
export function useDataDefine(
  editor: DesignerEditor,
  widgetArgs?: { _vid?: string; _var?: string },
  dataArgs?: { _vid?: string; _var?: string }
): WidgetDataDefine | undefined {
  return useDataDefineCacheable(editor, widgetArgs, dataArgs) as any
}

/** 获取组件全部数据定义 */
export function useWidgetDataDefines(widget?: WidgetInstance): WidgetDataDefine[] {
  return [...(widget?.dataDefines ?? [])]
}

/** 合并runtimeDataDefines */
export function megeRuntimeDataDefines(a: WidgetDataDefine, b: WidgetDataDefine): WidgetDataDefine {
  const aPropDefines = a.propDefines ?? []
  const bPropDefines = b.propDefines ?? []
  const aKeys = a.propDefines?.map((e) => e._key) ?? []
  return {
    ...a,
    propDefines: [...aPropDefines, ...bPropDefines.filter((e) => !aKeys.includes(e._key))]
  }
}

/** 获取组件全部数据定义包括Runtime实际函数 */
export function useWidgetDataDefinesAndRuntimeActual(
  editor: DesignerEditor,
  widget?: WidgetInstance
): WidgetDataDefine[] {
  console.time(`数据定义检索 useWidgetDataDefinesAndRuntimeActual ${widget?._vid}`)
  const dataDefines = useWidgetDataDefines(widget)
  if (!isNullOrUnDef(widget)) {
    const widgetDefine = useWidgetDefine(widget)
    const runtimeDataDefines = widgetDefine.runtimeDataDefines
    if (!isNullOrUnDef(runtimeDataDefines)) {
      const runtimeList = runtimeDataDefines(editor, widget)
      return [...runtimeList, ...dataDefines]
    }
  }
  console.timeEnd(`数据定义检索 useWidgetDataDefinesAndRuntimeActual ${widget?._vid}`)
  return dataDefines
}

/** 获取组件全部数据定义包括Runtime缓存函数 */
const useWidgetDataDefinesAndRuntimeCacheable = useCacheable(useWidgetDataDefinesAndRuntimeActual, {
  ...DEFAULT_CACHE_OPTIONS,
  cacheKey(args) {
    return `${args[1]?._vid}`
  }
})

/** 获取组件全部数据定义包括Runtime */
export function useWidgetDataDefinesAndRuntime(
  editor: DesignerEditor,
  widget?: WidgetInstance
): WidgetDataDefine[] {
  return useWidgetDataDefinesAndRuntimeCacheable(editor, widget) as any
}

/** 根据参数检索数据定义被引用List */
export function checkDataDefineAreRefedFor(
  editor: DesignerEditor,
  list?: WidgetInstance[],
  refWidget?: WidgetInstance,
  refDataDefine?: WidgetDataDefine,
  existQuery?: boolean,
  refPropKey?: string,
  excludeSelf?: boolean
): CheckDataDefineResult[] {
  const isRefBindRefed = (refBind?: any): refBind is WidgetPropDefineBindBase => {
    return (
      !isNullOrUnDef(refBind?.bind) &&
      refBind.bind?.refWidgetId == refWidget?._vid &&
      refBind.bind?.refDataId == refDataDefine?._vid &&
      (isNullOrUnDef(refPropKey) || refBind.refPropKey == refPropKey)
    )
  }

  const isDefBind = (val?: any): val is WidgetPropDefineBind => {
    return !isNullOrUnDef(val)
  }

  const seekResults: CheckDataDefineResult[] = []
  if (!isNullOrUnDef(list) && !isNullOrUnDef(refWidget) && !isNullOrUnDef(refDataDefine)) {
    for (let i = 0; i < list.length; i++) {
      const item = list[i]
      if (excludeSelf && item._vid == refWidget?._vid) {
        continue
      }
      const dataDefinesWithRuntime = useWidgetDataDefinesAndRuntime(editor, item)
      for (let j = 0; j < dataDefinesWithRuntime.length; j++) {
        const def = dataDefinesWithRuntime[j]
        const refBindBaseList: WidgetPropDefineBindBase[] = []
        if (def._type == 'ref' && !isNullOrUnDef(def.refBind)) {
          for (const refBindItem of def.refBind.bindList ?? []) {
            if (isRefBindRefed(refBindItem)) {
              refBindBaseList.push(refBindItem)
            }
          }
        } else if (def._type == 'remote') {
          if (def.requestHeadersType == 'enable-bind' && isDefBind(def.requestHeaders)) {
            for (const refBindItem of def.requestHeaders.bindList ?? []) {
              if (isRefBindRefed(refBindItem)) {
                refBindBaseList.push(refBindItem)
              }
            }
          }
          if (def.requestFormDataType == 'enable-bind' && isDefBind(def.requestFormData)) {
            for (const refBindItem of def.requestFormData.bindList ?? []) {
              if (isRefBindRefed(refBindItem)) {
                refBindBaseList.push(refBindItem)
              }
            }
          }
          if (def.requestBodyType == 'enable-bind' && isDefBind(def.requestBody)) {
            for (const refBindItem of def.requestBody.bindList ?? []) {
              if (isRefBindRefed(refBindItem)) {
                refBindBaseList.push(refBindItem)
              }
            }
          }
        }
        for (const refBindItem of refBindBaseList) {
          seekResults.push({
            refedWidgetId: item._vid,
            refedDataId: def._vid,
            refedPropKey: refBindItem.refPropKey,
            label: `${def.name} [ ${getWidgetShortVidOrVar(item)} ]`
          })
          if (!isEmpty(seekResults) && existQuery) {
            return seekResults
          }
        }
        const r1 = checkDataDefineAreRefedFor(
          editor,
          item.props.slots,
          refWidget,
          refDataDefine,
          existQuery,
          refPropKey
        )
        if (!isEmpty(r1)) {
          seekResults.push(...r1)
          if (!isEmpty(seekResults) && existQuery) {
            return seekResults
          }
        }
        const r2 = checkDataDefineAreRefedFor(
          editor,
          item.slotChildren,
          refWidget,
          refDataDefine,
          existQuery,
          refPropKey
        )
        if (!isEmpty(r2)) {
          seekResults.push(...r2)
          if (!isEmpty(seekResults) && existQuery) {
            return seekResults
          }
        }
      }
    }
  }
  return seekResults
}

/** 根据参数检索数据定义被绑定List */
export function checkDataDefineAreBoundFor(
  list?: WidgetInstance[],
  bindWidget?: WidgetInstance,
  bindDataDefine?: { _vid: string },
  existQuery?: boolean,
  bindPropKey?: string,
  excludeSelf?: boolean
): CheckDataDefineResult[] {
  const isRefBindBound = (bindRef?: any): bindRef is WidgetPropDefineBindBase => {
    return (
      !isNullOrUnDef(bindRef?.bind) &&
      bindRef.bind?.refWidgetId == bindWidget?._vid &&
      bindRef.bind?.refDataId == bindDataDefine?._vid &&
      (isNullOrUnDef(bindPropKey) || bindRef.refPropKey == bindPropKey)
    )
  }

  const seekResults: CheckDataDefineResult[] = []
  if (!isNullOrUnDef(list) && !isNullOrUnDef(bindWidget) && !isNullOrUnDef(bindDataDefine)) {
    for (let i = 0; i < list.length; i++) {
      const item = list[i]
      if (excludeSelf && item._vid == bindWidget?._vid) {
        continue
      }
      if (!isNullOrUnDef(item.propsBind)) {
        for (const key in item.propsBind) {
          const bindRef = item.propsBind[key]
          for (const refBind of bindRef?.bindList ?? []) {
            if (isRefBindBound(refBind)) {
              seekResults.push({
                refedWidgetId: item._vid,
                refedPropKey: refBind.refPropKey,
                label: `${key} [ ${getWidgetShortVidOrVar(item)} ]`
              })
              if (!isEmpty(seekResults) && existQuery) {
                return seekResults
              }
            }
          }
        }
      }
      const r1 = checkDataDefineAreBoundFor(
        item.props.slots,
        bindWidget,
        bindDataDefine,
        existQuery,
        bindPropKey
      )
      if (!isEmpty(r1)) {
        seekResults.push(...r1)
        if (!isEmpty(seekResults) && existQuery) {
          return seekResults
        }
      }
      const r2 = checkDataDefineAreBoundFor(
        item.slotChildren,
        bindWidget,
        bindDataDefine,
        existQuery,
        bindPropKey
      )
      if (!isEmpty(r2)) {
        seekResults.push(...r2)
        if (!isEmpty(seekResults) && existQuery) {
          return seekResults
        }
      }
    }
  }
  return seekResults
}

/** 根据参数检索被绑定的数据定义scope不正确的list */
export function checkInvalidPropBindByScopeFor(
  editor: DesignerEditor,
  widget?: WidgetInstance,
  parentLink?: WidgetInstance[],
  existQuery?: boolean
): WidgetPropDefineBind[] {
  const parentIds = parentLink?.map((i) => i._vid) ?? []
  const invalidBindValues = new Map<string, WidgetPropDefineBind>()
  const validBindValues = new Map<string, WidgetPropDefineBind>()
  if (!isNullOrUnDef(widget?.propsBind)) {
    for (const key in widget.propsBind) {
      const bindRef = widget.propsBind[key]
      for (const refBind of bindRef?.bindList ?? []) {
        const { refWidgetId, refDataId } = refBind.bind ?? {}
        if (!isNullOrUnDef(bindRef) && !isNullOrUnDef(refWidgetId) && !isNullOrUnDef(refDataId)) {
          if (validBindValues.has(refDataId ?? '')) {
            continue
          }
          if (invalidBindValues.has(refDataId ?? '')) {
            continue
          }
          const boundDataDefine = useDataDefine(editor, { _vid: refWidgetId }, { _vid: refDataId })
          if (!isNullOrUnDef(boundDataDefine) && boundDataDefine.scope != 'global') {
            if (!parentIds.includes(refWidgetId)) {
              invalidBindValues.set(refDataId, bindRef)
              if (existQuery) {
                return [...invalidBindValues.values()]
              }
            }
          }
          validBindValues.set(refDataId, bindRef)
        }
      }
    }
  }
  return [...invalidBindValues.values()]
}

/** 获取数据定义被引用的list */
export function checkDataDefineAreRefed(
  editor: DesignerEditor,
  widget?: WidgetInstance,
  define?: WidgetDataDefine,
  existQuery?: boolean,
  key?: string,
  excludeSelf?: boolean
): CheckDataDefineResult[] {
  console.time('数据定义引用检索 checkDataDefineAreRefed')
  const r = checkDataDefineAreRefedFor(
    editor,
    useWidgetTree(editor),
    widget,
    define,
    existQuery,
    key,
    excludeSelf
  )
  console.timeEnd('数据定义引用检索 checkDataDefineAreRefed')
  return r
}

/** 获取数据定义被绑定的list */
export function checkDataDefineAreBound(
  editor: DesignerEditor,
  widget?: WidgetInstance,
  dataDefine?: { _vid: string },
  existQuery?: boolean,
  key?: string,
  excludeSelf?: boolean
): CheckDataDefineResult[] {
  console.time('数据定义绑定检索 checkDataDefineAreBound')
  const r = checkDataDefineAreBoundFor(
    useWidgetTree(editor),
    widget,
    dataDefine,
    existQuery,
    key,
    excludeSelf
  )
  console.timeEnd('数据定义绑定检索 checkDataDefineAreBound')
  return r
}

/** 根据参数检索被绑定的数据定义scope不正确的list */
export function checkInvalidPropBindByScope(
  editor: DesignerEditor,
  widget?: WidgetInstance,
  toSlot?: WidgetInstance,
  slotRenderContext?: WidgetRenderContext,
  existQuery?: boolean
): WidgetPropDefineBind[] {
  console.time('绑定的数据定义作用域检查 checkInvalidPropBindByScope')
  let parentLink = slotRenderContext?.seekParent().seekLink ?? []
  if (!isNullOrUnDef(toSlot)) {
    parentLink = [toSlot, ...parentLink]
  }
  const r = checkInvalidPropBindByScopeFor(editor, widget, parentLink, existQuery)
  console.timeEnd('绑定的数据定义作用域检查 checkInvalidPropBindByScope')
  return r
}

export function checkPropDefineBindType(
  propDefine?: WidgetPropDefine,
  bindPropDefines?: WidgetDataDefine['propDefines']
): string | undefined {
  if (!isNullOrUnDef(propDefine?.bindType)) {
    if (isArray(propDefine.bindType)) {
      return checkBindTypeBindPropDefines(propDefine.bindType, bindPropDefines, propDefine.isArray)
    } else {
      return propDefine.bindType(propDefine, bindPropDefines)
    }
  }
}

// 绑定类型检查
export function checkBindTypeBindPropDefines(
  bindTypes?: WidgetPropDefineBindType[],
  bindPropDefines?: WidgetDataDefine['propDefines'],
  isArrayInput?: boolean
): string | undefined {
  if (isEmpty(bindPropDefines)) {
    return `未选择绑定属性`
  }
  if (isEmpty(bindTypes)) {
    return
  }
  if (bindTypes?.includes('any')) {
    return
  }
  const firstPropDefine = bindPropDefines?.[0]
  if (isArrayInput) {
    if (firstPropDefine?.name == DATA_EMPTY_NAME_FLAG && firstPropDefine.type == 'array') {
      if (firstPropDefine.itemType == 'array') {
        return checkBindTypeBindPropDefines(bindTypes, firstPropDefine.itemDefines)
      } else {
        if (bindTypes?.includes(`${firstPropDefine.itemType}`)) {
          return
        }
      }
    }
    return `绑定类型不正确, 需绑定 ${bindTypes?.join(',')} 类型的数组数据`
  } else {
    if (firstPropDefine?.name == DATA_EMPTY_NAME_FLAG) {
      if (firstPropDefine.type == 'array') {
        if (bindTypes?.includes('any[]')) {
          return
        }
        if (bindTypes?.includes(`${firstPropDefine.itemType}[]`)) {
          return
        }
      }
    } else if (firstPropDefine?.name == DATA_VALUE_ITEM_FLAG) {
      if (bindTypes?.includes(`${firstPropDefine.type}`)) {
        return
      }
    } else {
      if (bindTypes?.includes(`object`)) {
        return
      }
    }
    return `绑定类型不正确, 需绑定 ${bindTypes?.join(',')} 类型数据`
  }
}

/** 获取数据定义 */
export function useDataDefinesFor(
  editor: DesignerEditor,
  list?: WidgetInstance[],
  args?: { _types?: string[]; isAutoLoad?: boolean }
): WidgetDataDefine[] {
  const seekResults: any[] = []
  if (!isNullOrUnDef(list)) {
    list?.forEach((item) => {
      const dataDefinesWithRuntime = useWidgetDataDefinesAndRuntime(editor, item)
      dataDefinesWithRuntime.forEach((def) => {
        if (
          (isNullOrUnDef(args?._types) || args!._types!.includes(def._type)) &&
          (isNullOrUnDef(args?.isAutoLoad) || args!.isAutoLoad == def.isAutoLoad)
        ) {
          seekResults.push(def)
        }
      })
      seekResults.push(...useDataDefinesFor(editor, item.slots, args))
      seekResults.push(...useDataDefinesFor(editor, item.slotChildren, args))
    })
  }
  return seekResults
}

/** 获取数据定义 */
export function useDataDefines(
  editor: DesignerEditor,
  args?: { _types?: string[]; isAutoLoad?: boolean }
) {
  console.time('数据定义检索 useDataDefines')
  const r = useDataDefinesFor(editor, useWidgetTree(editor), args)
  console.timeEnd('数据定义检索 useDataDefines')
  return r
}

/** 构建组件数据定义刷新指令 */
export function buildDataDefineRefreshCmd(
  editor: DesignerEditor,
  widget?: WidgetInstance,
  dataDefine?: WidgetDataDefine
): DesignerEditorCmd | undefined {
  if (!isNullOrUnDef(widget) && !isNullOrUnDef(dataDefine)) {
    const { analyzer } = useDataDefineAnalyzer(editor, { dataDefine: cloneDeep(dataDefine) })
    if (dataDefine._type == 'ref' && analyzer.value.tryAnalysisRefDefines()) {
      const dataDefineList = useWidgetDataDefines(widget)
      const index = dataDefineList.findIndex((e) => e._vid == dataDefine._vid)
      dataDefineList[index] = analyzer.value.dataDefine
      return writeWidgetValueCmd(editor, {
        widget: widget,
        key: 'dataDefines',
        value: dataDefineList
      })
    }
  }
}

/** 获取当前选择组件 */
export function useSelectedWidget(editor: DesignerEditor): WidgetInstance | undefined {
  return useWidgetById(editor, editor.getStore().state.value.selectedWidgetId)
}

/** 获取当前选择组件上下文 */
export function useSelectedWidgetRenderContext(
  editor: DesignerEditor
): WidgetRenderContext | undefined {
  const { state, useWidgetRenderContext } = editor.getStore()
  return useWidgetRenderContext(state.value.selectedWidgetId)
}

/** 获取页面root上下文 */
export function useRootRenderContext(editor: DesignerEditor): WidgetRenderContext {
  return {
    seekParent: defaultSeekParentFunction(),
    seekData: defaultSeekDataFunction(editor)
  }
}

/** 创建单个插槽 */
export function createSlotItem(editor: DesignerEditor, slotKey?: string): WidgetInstance {
  const slotDefine = useWidgetDefine({ _moduleName: 'innerWidgetDefines', _key: 'slotRender' })
  const slotItem = createWidgetInstanceDefault(editor, slotDefine, slotKey ?? SLOT_DEFAULT_KEY)
  slotItem.props.span = 24
  return slotItem
}

/** 获取组件上下文 */
export function useWidgetRenderContext(
  editor: DesignerEditor,
  _vid?: string
): WidgetRenderContext | undefined {
  if (!isNullOrUnDef(_vid)) {
    return editor.getStore().useWidgetRenderContext(_vid)
  } else {
    return useRootRenderContext(editor)
  }
}

/** 获取当前选择组件定义 */
export function useSelectedWidgetDefine(editor: DesignerEditor): WidgetDefine | undefined {
  return useWidgetDefine(useSelectedWidget(editor) ?? {})
}

/** 获取父组件检索函数 */
export function useSeekParentFunction(
  widgetRenderContext?: WidgetRenderContext
): SeekWidgetFunction {
  return widgetRenderContext?.seekParent ?? defaultSeekParentFunction()
}

/** 获取组件数据检索函数 */
export function useSeekDataFunction(
  editor: DesignerEditor,
  widgetRenderContext?: WidgetRenderContext
): SeekDataFunction {
  return widgetRenderContext?.seekData ?? defaultSeekDataFunction(editor)
}

/** 运行时重新生成获取组件数据检索函数 */
export function regenSeekDataFunctionRuntime(
  editor: DesignerEditor,
  widgetRenderContext?: WidgetRenderContext,
  runtimeData?: Record<string, any>,
  propBind?: WidgetPropDefineBind,
  defaultValue?: any
): any | undefined {
  try {
    const seekData = useSeekDataFunction(editor, widgetRenderContext)
    if (!isNullOrUnDef(propBind?.bindList) && !isNullOrUnDef(runtimeData)) {
      const bindListArgs: any[] = []
      for (const refBind of propBind.bindList) {
        const runtimeJsonData = runtimeData?.[refBind.bind?.refDataId ?? '']
        if (!isNullOrUnDef(runtimeJsonData)) {
          bindListArgs.push(readValueByJsonPath(runtimeJsonData, refBind.refPropKey))
        } else {
          bindListArgs.push(seekData({ bindList: [refBind] }, undefined))
        }
      }
      return executeBindRefFunction(propBind?.refFunction, bindListArgs)
    } else {
      return seekData(propBind, defaultValue)
    }
  } catch (e) {
    console.error('seekDataFunctionRuntime value error return defaultValue', defaultValue, e)
    return defaultValue
  }
}

/** 包装Css样式属性Key */
export function wrapCSSKey(type: string, propKey: string) {
  return `_CSS_${type}_${propKey}`
}

/** 是否是Css样式属性Key */
export function isCSSPropKey(propKey: string, type?: string): boolean {
  return propKey.startsWith(`_CSS_${type ?? ''}${type ? '_' : ''}`)
}

/** 包装自定义Css样式属性Key */
export function wrapCusCSSKey(type: string, propKey: string) {
  return `_CSS_CUS_${type}_${propKey}`
}

/** 是否是自定义Css样式属性Key */
export function isCusCSSPropKey(propKey: string, type?: string): boolean {
  return propKey.startsWith(`_CSS_CUS_${type ?? ''}${type ? '_' : ''}`)
}

/** 解包Css样式属性Key */
export function unwrapCSSKey(type: string, propKey: string) {
  return propKey.replace(`_CSS_${type}_`, '')
}

/** 构建组件容器样式 */
export function buildCSSStyleDef(type: string): WidgetPropDefine[] {
  const _wrapKey = (propKey: string) => wrapCSSKey(type, propKey)

  const _wrapCusKey = (propKey: string) => wrapCusCSSKey(type, propKey)

  const isDisplayIs = (type: string) => {
    return ({ widget }) => {
      return !isNullOrUnDef(widget.props) && widget.props[_wrapKey('display')] == type
    }
  }

  return [
    radioButtonDefine(
      {
        key: _wrapKey('display'),
        label: '布局方式(display)'
      },
      DisplayOptions,
      {
        _cancelable: true,
        _chunkSize: 4
      }
    ),
    // waterfall 布局参数
    inputNumberDefine({
      key: _wrapKey('column-count'),
      label: '瀑布流列数(column-count)',
      isShow: isDisplayIs('waterfall')
    }),
    formatInputNumberDefine(
      {
        key: _wrapKey('column-gap'),
        label: '瀑布流列间距(column-gap)',
        helps: '行间距需通过子元素 margin-bottom 设置',
        isShow: isDisplayIs('waterfall')
      },
      {
        symbol: ['px', 'rem']
      }
    ),
    // grid 布局参数
    inputNumberDefine({
      key: _wrapCusKey('grid-template-columns-cnt'),
      label: '每行列数',
      helps: '网格布局每行列数,自动生成列模版',
      isShow: isDisplayIs('grid'),
      onSave: (editor, widget, propKey, propValue) => {
        editor.executeCmd(
          writePropValuesCmd(editor, {
            widget: widget,
            values: {
              [propKey]: propValue,
              [_wrapKey('grid-template-columns')]: `repeat(${propValue}, 1fr)`
            }
          })
        )
      }
    }),
    inputDefine({
      key: _wrapKey('grid-template-columns'),
      label: '列模版(grid-template-columns)',
      isShow: isDisplayIs('grid')
    }),
    formatInputNumberDefine(
      {
        key: _wrapKey('grid-row-gap'),
        label: '行间距(grid-row-gap)',
        isShow: isDisplayIs('grid')
      },
      {
        symbol: ['px', 'rem']
      }
    ),
    formatInputNumberDefine(
      {
        key: _wrapKey('grid-column-gap'),
        label: '列间距(grid-column-gap)',
        isShow: isDisplayIs('grid')
      },
      {
        symbol: ['px', 'rem']
      }
    ),
    // flex 布局参数
    radioButtonDefine(
      {
        key: _wrapKey('flex-direction'),
        label: '排列方向(flex-direction)',
        isShow: isDisplayIs('flex')
      },
      FlexDirectionOptions,
      {
        _cancelable: true
      }
    ),
    radioButtonDefine(
      {
        key: _wrapKey('flex-wrap'),
        label: '换行(flex-wrap)',
        isShow: isDisplayIs('flex')
      },
      FlexWrapOptions,
      {
        _cancelable: true
      }
    ),
    formatInputNumberDefine(
      {
        key: _wrapKey('gap'),
        label: '间距(gap)',
        isShow: isDisplayIs('flex')
      },
      {
        symbol: ['px', 'rem']
      }
    ),
    radioButtonDefine(
      {
        key: _wrapKey('justify-content'),
        label: '主轴分布(justify-content)',
        isShow: isDisplayIs('flex')
      },
      JustifyContentOptions,
      {
        _optionsOnlyIcon: true,
        _cancelable: true,
        _chunkSize: 3
      }
    ),
    radioButtonDefine(
      {
        key: _wrapKey('align-items'),
        label: '主轴排列(align-items)',
        isShow: isDisplayIs('flex')
      },
      AlignItemsOptions,
      {
        _optionsOnlyIcon: true,
        _cancelable: true,
        _chunkSize: 3
      }
    ),
    // 普通属性
    inputNumberDefine({
      key: _wrapKey('flex'),
      label: '空间适配(flex)'
    }),
    formatInputNumberDefine(
      {
        key: _wrapKey('width'),
        label: '宽度(width)'
      },
      {
        symbol: CssSymbols
      }
    ),
    formatInputNumberDefine(
      {
        key: _wrapKey('height'),
        label: '高度(height)'
      },
      {
        symbol: CssSymbols
      }
    ),
    radioButtonDefine(
      {
        key: _wrapKey('overflow'),
        label: '超出其容器边界时(overflow)'
      },
      [
        { label: '隐藏', value: 'hidden' },
        { label: '滚动', value: 'scroll' }
      ],
      {
        _cancelable: true
      }
    ),
    edgeInsetsDefine(
      {
        key: _wrapKey('padding'),
        label: '内边距(padding)'
      },
      {
        symbol: ['px', 'rem']
      }
    ),
    edgeInsetsDefine(
      {
        key: _wrapKey('margin'),
        label: '外边距(margin)'
      },
      {
        symbol: ['px', 'rem']
      }
    )
  ]
}

/** 构建组件容器样式 */
export function buildCSSObj(
  type: 'inner' | 'outer',
  widget: WidgetInstance
): Record<string, string> {
  const styleObj = Object.fromEntries(
    Object.keys(widget.props)
      .filter((propKey) => isCSSPropKey(propKey, type) && !isCusCSSPropKey(propKey, type))
      .map((propKey) => {
        const cssKey = unwrapCSSKey(type, propKey)
        const cssValue = readPropValue(widget, propKey)
        if (!isNullOrUnDef(cssValue)) {
          if (cssKey == 'margin' || cssKey == 'padding') {
            const { top = '0', right = '0', bottom = '0', left = '0' } = cssValue
            return [cssKey, `${top} ${right} ${bottom} ${left}`]
          }
        }
        return [cssKey, cssValue]
      })
  )
  return styleObj
}

/** 构建组件外容器样式 */
export function buildOuterCSSObj(widget: WidgetInstance): Record<string, string> {
  return buildCSSObj('outer', widget)
}

/** 构建组件内容器样式 */
export function buildInnerCSSObj(widget: WidgetInstance): Record<string, string> {
  return buildCSSObj('inner', widget)
}

/** Object 转换成 css 格式字符串 */
export function cssObjToStyleString(cssObj: Record<string, string> = {}): string {
  return Object.keys(cssObj)
    .filter((key) => !isEmpty(cssObj[key]))
    .map((key) => `${key}: ${cssObj[key]};`)
    .join('')
}

/** 合并Url */
export function mergeUrls(urlBase: string, relativeUrl: string): string {
  // 去掉 urlBase 结尾的 /
  if (urlBase.endsWith('/')) {
    urlBase = urlBase.slice(0, -1)
  }

  // 去掉 relativeUrl 开头的 /
  if (relativeUrl.startsWith('/')) {
    relativeUrl = relativeUrl.slice(1)
  }

  // 拼接两个 URL
  return `${urlBase}/${relativeUrl}`
}

/** 执行 Promise 显示 loading 动画 */
export async function promiseWithLoading(
  setLoading: (val: boolean) => void,
  promiseResult: Promise<any>
): Promise<any> {
  setLoading(true)
  try {
    return await promiseResult
  } finally {
    setLoading(false)
  }
}

/** 异步读取引用数据方法 */
export async function refBindGetData(editor: DesignerEditor, refBind: WidgetPropDefineBind) {
  const dataDefine = createDataDefine({ _type: 'ref', refBind })
  const { value, isNotExecuted, getData } = useDataDefineExecutor(editor, { dataDefine })
  return isNotExecuted.value ? await getData() : value.value
}

/** header配置转换为object */
export function headersFormDataToObject(
  headers?: WidgetDataDefineRequestHeaders[] | WidgetDataDefineRequestFormData[]
) {
  return Object.fromEntries(
    (headers ?? [])
      .filter((e) => !isEmpty(e.name) && !isEmpty(e.value))
      .map((e) => [e.name, e.value])
  )
}

/** 读取远程数据方法 */
export async function requestDataDefine(
  editor: DesignerEditor,
  define: WidgetDataDefine,
  args?: any
): Promise<any> {
  // 配置请求头
  let headers: any = {}
  if (!isNullOrUnDef(define.requestHeaders)) {
    if (define.requestHeadersType == 'enable-input') {
      headers = headersFormDataToObject(define.requestHeaders as WidgetDataDefineRequestHeaders[])
    } else if (define.requestHeadersType == 'enable-bind') {
      headers = (await refBindGetData(editor, define.requestHeaders as WidgetPropDefineBind)) ?? {}
    }
  }
  if (!isNullOrUnDef(args?.headers)) {
    headers = { ...headers, ...args?.headers }
  }

  // 配置请求表单数据
  let formParams: any = {}
  if (!isNullOrUnDef(define.requestFormData)) {
    if (define.requestFormDataType == 'enable-input') {
      formParams = headersFormDataToObject(
        define.requestFormData as WidgetDataDefineRequestHeaders[]
      )
    } else if (define.requestFormDataType == 'enable-bind') {
      formParams =
        (await refBindGetData(editor, define.requestFormData as WidgetPropDefineBind)) ?? {}
    }
  }
  if (!isNullOrUnDef(args?.formParams)) {
    formParams = { ...formParams, ...args?.formParams }
  }

  // 配置请求体
  let requestBody: any = {}
  if (!isNullOrUnDef(define.requestBodyType)) {
    if (define.requestBodyType == 'enable-input') {
      requestBody = jsonParse((define.requestBody as string) ?? '{}')
    } else if (define.requestBodyType == 'enable-bind') {
      requestBody = (await refBindGetData(editor, define.requestBody as WidgetPropDefineBind)) ?? {}
    }
  }
  if (!isNullOrUnDef(args?.requestBody)) {
    requestBody = { ...requestBody, ...args?.requestBody }
  }

  // 请求地址
  let requestUrl = define.requestUrl ?? ''
  if (!requestUrl.startsWith('http')) {
    const requestUrlMode = define.requestUrlMode ?? readEditorDataValue(editor, 'requestUrlMode')
    if (requestUrlMode == 'REF_BASE') {
      const requestUrlBase = readEditorDataValue(editor, 'requestUrlBase')
      requestUrl = mergeUrls(requestUrlBase, requestUrl)
    }
  }
  if (!isNullOrUnDef(args?.requestUrl)) {
    requestUrl = args.requestUrl
  }

  const requestMethod = args?.requestUrl ?? define.requestMethod ?? ''

  const isShowErrorMsg = args?.isShowErrorMsg ?? define.isShowErrorMsg ?? true

  //执行请求
  let requestPromise: Promise<any>
  if (!isNullOrUnDef(request[requestMethod])) {
    requestPromise = requestOriginal({
      method: requestMethod.toUpperCase(),
      url: requestUrl,
      params: formParams,
      headers,
      data: requestBody,
      ignoreErrorMsg: !isShowErrorMsg
    })
  } else {
    requestPromise = Promise.reject(`Unsupported requestMethod[ ${requestMethod} ]`)
  }
  const isShowSuccessMsg = args?.isShowSuccessMsg ?? define.isShowSuccessMsg ?? false
  const successMsg = args?.successMsg ?? define.successMsg ?? '操作成功'

  requestPromise.then((resp) => {
    if (isShowSuccessMsg) {
      message.success(successMsg)
    }
    return resp
  })

  const isShowLoading = args?.isShowLoading ?? define.isShowLoading ?? false
  if (isShowLoading && !args?.ignoreLoading) {
    return promiseWithLoading((val) => {
      editor.getStore().putLoadingContext(define._vid, val)
    }, requestPromise)
  }
  return requestPromise
}

/** 读取远程数据方法 */
export function requestDataDefineBatch(
  editor: DesignerEditor,
  ...defines: WidgetDataDefine[]
): Promise<any> {
  const requestPromiseAll = defines.map((e) => requestDataDefine(editor, e))
  const isShowLoading = defines.some((e) => e.isShowLoading)
  if (isShowLoading) {
    return promiseWithLoading((val) => {
      defines.forEach((def) => {
        editor.getStore().putLoadingContext(def._vid, val)
      })
    }, Promise.all(requestPromiseAll))
  }
  return Promise.all(requestPromiseAll)
}

/** 事件key是否有效 */
export function isEventKeyValid(key?: string): boolean {
  return !defaultLifecycleEvents()
    .map((e) => e.key)
    .includes(key ?? '')
}

/** 默认生命周期事件定义 */
export function defaultLifecycleEvents(): DesignerEditorEventDefine[] {
  return [
    eventDefine('onBeforeMount', {
      type: 'simple-function',
      label: '初始渲染前',
      isLifecycle: true
    }),
    eventDefine('onMounted', {
      type: 'simple-function',
      label: '渲染完成后',
      isLifecycle: true
    }),
    eventDefine('onBeforeUnmount', {
      type: 'simple-function',
      label: '取消挂载前',
      isLifecycle: true
    }),
    eventDefine('onUnmounted', {
      type: 'simple-function',
      label: '取消挂载后',
      isLifecycle: true
    })
  ]
}

// 可执行函数内置变量说明
export function evalFunctionBuiltInHelps(exts?: string[] | string) {
  if (isString(exts)) {
    exts = [exts]
  }
  const helps = [
    `变量:${highlightTextHtml('$request({method, url, data, params, ...options}) => Promise<数据>')}, axios发送http请求`,
    `变量:${highlightTextHtml('$request(define, options) => Promise<数据>')}, 根据数据定义发送http请求`,
    `变量:${highlightTextHtml('$download() => download')}, 获取download工具`,
    `变量:${highlightTextHtml('$message() => message')}, 获取message工具`,
    `变量:${highlightTextHtml('$emit(key, ...args)')}, 发布页面维度自定义事件`,
    `变量:${highlightTextHtml('$close(...args) => Promise<结果>')}, 触发页面关闭,获取结果`,
    `变量:${highlightTextHtml('$dialog({title, width, fileId, version, params}) => Promise<结果>')}, 触发弹框弹框关闭时返回结果`,
    `变量:${highlightTextHtml('$useExposeContext(_vid|_var) => Promise<上下文>')}, 获取组件暴露上下文, 默认获取当前组件的上下文`,
    `变量:${highlightTextHtml('$data(_var|参数, 数据, { partial }) => Promise<数据>')}, 根据数据变量获取数据或设置数据, 设置partial可部分更新`,
    `变量:${highlightTextHtml('$submit(_var|参数) => Promise<结果>')}, 触发提交数据`,
    `变量:${highlightTextHtml('$log(...args)')}, 打印日志, 显示数据`,
    `变量:${highlightTextHtml('$args')}, 函数参数数组, 示例:第一个参数$args[0]`,
    `变量:${highlightTextHtml('return Promise.resolve(结果)')}, 返回执行结果`,
    ...(exts ?? [])
  ]
  return `<p>${helps.join('</p><p>')}</p>`
}

/** 可执行函数tips */
export function getEvalFunctionTips(evalFunction: DesignerEditorEvalFunction): string | undefined {
  if (evalFunction.debounce) {
    return `防抖(${evalFunction.dealy ?? DEFAULT_EVAL_FUNCTION_DEALY}ms)`
  } else if (evalFunction.throttle) {
    return `节流(${evalFunction.dealy ?? DEFAULT_EVAL_FUNCTION_DEALY}ms)`
  }
}

/** 包装可执行函数 */
export function wrapEvalFunction(
  editor: DesignerEditor,
  evalFn?: DesignerEditorEvalFunction,
  evalFnContext?: EvalFnContext
): (...args: any[]) => any {
  evalFnContext ??= buildEvalFnContext(editor)
  const contextKeys = Object.keys(evalFnContext)
  const evalFunction = (...args) => {
    try {
      evalFn?.stop && args?.[0]?.stopPropagation && args?.[0]?.stopPropagation()
      evalFn?.prevent && args?.[0]?.preventDefault && args?.[0]?.preventDefault()
      const callResult = eval(
        `function _fn(${contextKeys.join(',')},...$args) {${evalFn?.evalFunction ?? ''}};_fn;`
      ).call(evalFnContext, ...contextKeys.map((key) => evalFnContext[key]), ...args)
      return callResult
    } catch (e) {
      message.error(`函数执行异常${e}`)
      throw e
    }
  }
  if (evalFn?.debounce) {
    return useDebounceFn(evalFunction, evalFn.dealy ?? DEFAULT_EVAL_FUNCTION_DEALY)
  } else if (evalFn?.throttle) {
    return useThrottleFn(evalFunction, evalFn.dealy ?? DEFAULT_EVAL_FUNCTION_DEALY)
  }
  return evalFunction
}

/** 执行包装可执行函数 */
function _executeEvalFunction(evalFunction: (...args: any[]) => Promise<any>, ...args: any[]): any {
  return evalFunction(...args)
}

/** 执行可执行函数免包装 */
export function executeEvalFunction(
  editor: DesignerEditor,
  evalFunction?: DesignerEditorEvalFunction | DesignerEditorEvalFunction[],
  evalFnContext?: EvalFnContext,
  ...args: any[]
): any {
  if (!isNullOrUnDef(evalFunction)) {
    if (isArray(evalFunction)) {
      return Promise.all(
        evalFunction.map((item) => executeEvalFunction(editor, item, evalFnContext, ...args))
      )
    } else {
      return _executeEvalFunction(wrapEvalFunction(editor, evalFunction, evalFnContext), ...args)
    }
  }
}

/** 组件Expose上下文检索 */
export function seekWidgetExposeContext(
  editor: DesignerEditor,
  key: any
): Record<string, any> | undefined {
  if (!isNullOrUnDef(key)) {
    let ctx: Record<string, any> | undefined
    const exposeContext = editor.getStore().state.value.widgetExposeContext
    if (!isNullOrUnDef(key._vid)) {
      ctx = exposeContext[key._vid]
    } else if (!isNullOrUnDef(key._var)) {
      const _vid = useWidgetByVar(editor, key._var)?._vid ?? ''
      ctx = exposeContext[_vid]
    } else {
      ctx = seekWidgetExposeContext(editor, { _vid: key })
      if (isNullOrUnDef(ctx)) {
        ctx = seekWidgetExposeContext(editor, { _var: key })
      }
    }
    return ctx
  }
  console.warn('must assign widget _vid o _var')
}

/** 执行数据定义 getData 获取结果 */
export async function executeGetData(
  editor: DesignerEditor,
  key?: string | { _var?: string },
  args?: GetDataArgs & { refresh?: boolean },
  data?: any,
  options?: { partial?: boolean }
): Promise<any> {
  const _var = isString(key) ? key : key?._var
  if (!isNullOrUnDef(_var)) {
    const dataDefine = useDataDefineByVar(editor, _var)
    if (!isNullOrUnDef(dataDefine)) {
      const { value, isNotExecuted, getData } = useDataDefineExecutor(editor, { dataDefine })
      if (!isNullOrUnDef(data)) {
        if (options?.partial) {
          const temp = { ...value.value }
          for (const key in data) {
            if (Object.hasOwn(data, key)) {
              temp[key] = data[key]
            }
          }
          value.value = temp
        } else {
          value.value = data
        }
        return value.value
      } else {
        return args?.refresh || isNotExecuted.value ? await getData(args) : value.value
      }
    } else {
      message.error('数据定义不存在')
      throw new Error('数据定义不存在')
    }
  }
  console.error('must assign data _var')
}

/** always await */
export async function alwaysWaitFor<T>(
  check: (fnResult?: T) => boolean,
  fn: () => Promise<T | undefined>,
  timeout: number = 5000
): Promise<T | undefined> {
  const startTime = new Date().getTime()
  do {
    try {
      const r = await fn()
      if (check(r)) {
        return r
      }
    } catch (e) {
      console.error('always waiting for result', e)
    }
    await nextTick()
  } while (new Date().getTime() - startTime < timeout)
  console.error('always waiting for result timeout error return undefined')
  return undefined
}

/** 构建可执行函数上下文 */
export function buildEvalFnContext(editor: DesignerEditor, defaultKey?: string): EvalFnContext {
  return {
    $request: (arg1, arg2) => {
      if (!isNullOrUnDef(arg1?.method && arg1?.url)) {
        return requestOriginal(arg1)
      } else {
        return requestDataDefine(editor, arg1, arg2)
      }
    },
    $download: () => download,
    $message: () => message,
    $emit: (key, data) => editor.getEmitter().emit(getCustomEventKey(key), data),
    $close: (...args) => editor.close(...args),
    $dialog: (options) => editor.dialog(options),
    $useExposeContext: async (arg1) => {
      const ctx = await alwaysWaitFor<Record<string, any>>(
        (val) => !isNullOrUnDef(val),
        async () => seekWidgetExposeContext(editor, arg1 ?? defaultKey)
      )
      if (!ctx) {
        const msg = `未检索到组件上下文, 请检查参数是否正确, 组件是否暴露上下文 参数: ${arg1 ?? defaultKey}`
        console.error(msg)
        if (!editor.getStore().isPreviewMode.value) {
          message.error(msg)
        }
        return undefined
      }
      return ctx
    },
    $data: (arg1, data, options) => {
      if (isString(arg1)) {
        return executeGetData(editor, arg1, undefined, data, options)
      } else {
        return executeGetData(editor, arg1._var, arg1, data, options)
      }
    },
    $submit: (arg1) => {
      if (isString(arg1)) {
        return executeGetData(editor, arg1, { refresh: true })
      } else {
        return executeGetData(editor, arg1?._var, { ...arg1, refresh: true })
      }
    },
    $log: (...args) => {
      console.info(...args)
      message.info(JSON.stringify(args))
    }
  }
}

/** 添加组件到插槽 */
export function addWidgetToSlot(
  widget: WidgetInstance,
  child: WidgetInstance,
  options: { index?: number; slotKey?: string; _vid?: string; _var?: string }
) {
  let slotWidget: WidgetInstance | undefined = widget.slots?.find(
    (item) =>
      (!isNullOrUnDef(options.slotKey) && item.slotKey == options.slotKey) ||
      (!isNullOrUnDef(options._vid) && item._vid == options._vid) ||
      (!isNullOrUnDef(options._var) && item._var == options._var)
  )
  if (!isNullOrUnDef(options.index)) {
    slotWidget = widget.slots[options.index]
  }
  if (!isNullOrUnDef(slotWidget)) {
    slotWidget.slotChildren.push(child)
  }
}

/** 切换默认函数 */
export function toggleDeffaultFunction(val?: string, defaultFn?: string) {
  val ??= ''
  defaultFn ??= ''
  if (val != defaultFn && val.startsWith('return (async() => {')) {
    return defaultFn
  } else {
    val = val
      .split('\n')
      .map((e) => `  ${e}`)
      .join('\n')
    return `return (async() => {\n${val}\n})()`
  }
}
