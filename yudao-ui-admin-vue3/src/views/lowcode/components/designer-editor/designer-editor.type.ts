//页宽类型
import { JSX } from 'vue/jsx-runtime'
import type { MenuItem } from '@imengyu/vue3-context-menu'
import { ComputedRef, VNode, WritableComputedRef } from 'vue'
import { FormItemProps } from 'element-plus/es/components/form/src/form-item'
import { MaterialFileDataVO } from '@/api/lowcode/materialfiledata'
import { Emitter } from 'mitt'
import { UseWidgetMenusArgs } from './designer-editor.menu'
import { ButtonType, ComponentSize } from 'element-plus'
import { jsonStringify } from '../common/utils'
import { isEmpty } from '@/utils/is'

export const FILE_SOURCE_DESIGNER = 2

export const DESIGNER_DATA_TYPE_MAIN = 0

export const PAGE_DEFINE_NO = '__page__'

export const DEFAULT_EVAL_FUNCTION_DEALY = 200

export const WIDGET_VIF_FUNCTION_KEY = '_vIfFun'

export const WIDGET_VIF_PERMIS_KEY = '_vIfPermis'

export const SLOT_DEFAULT_KEY = 'slot#default'

// 菜单操作类型
export type WidgetMenuAction = 'add' | 'move'

// 菜单定义
export type WidgetMenuItem = {
  /** 菜单 _key */
  _key?: string
  /** 菜单名称 */
  label?: MenuItem['label'] | ((w?: WidgetInstance) => string | VNode)
  /** 是否禁用 */
  disabled?: MenuItem['disabled'] | ((w?: WidgetInstance) => boolean | ComputedRef<boolean>)
  /** 是否隐藏 */
  hidden?: MenuItem['hidden'] | ((w?: WidgetInstance) => boolean | ComputedRef<boolean>)
  /** 点击触发 */
  onClick?: MenuItem['onClick'] | ((e?: MouseEvent | KeyboardEvent, w?: WidgetInstance) => void)
  /** 子级菜单 */
  children?: WidgetMenuItem[] | ((w?: WidgetInstance) => WidgetMenuItem[])
} & MenuItem

// Api接口地址模式
export type RequestUrlModeType = 'REF_PROJECT' | 'REF_BASE'

// 边缘插入
export interface EdgeInsetsInputData {
  top?: string
  right?: string
  bottom?: string
  left?: string
}

//数据定义检查结果
export interface CheckDataDefineResult {
  /** 数据定义所在组件Id */
  refedWidgetId?: string
  /** 数据Id */
  refedDataId?: string
  /** 引用属性Key */
  refedPropKey?: string
  /** 数据Label */
  label?: string
}

//组件属性数据绑定信息
export interface WidgetPropDefineBindBind {
  /** 引用数据定义所在组件Id */
  refWidgetId?: string
  /** 引用数据type */
  refDataType?: WidgetDataDefineType
  /** 引用数据Id */
  refDataId?: string
  /** 引用数据Label */
  label?: string
}

// 组件属性数据基础绑定信息
export interface WidgetPropDefineBindBase {
  /** 绑定信息 */
  bind?: WidgetPropDefineBindBind
  /** 绑定属性key */
  refPropKey?: string
}

// 组件属性数据绑定
export interface WidgetPropDefineBind {
  /** 绑定属性key */
  bindList?: WidgetPropDefineBindBase[]
  /** 属性绑定处理函数 */
  refFunction?: string
}

// 数据定义类型
export type WidgetDataDefineType =
  | 'def'
  | 'remote'
  | 'ref'
  | 'bind'
  | 'runtime'
  | 'const'
  | 'submit'

// 请求方法
export type WidgetDataDefineRequestMethod = 'get' | 'post' | 'put' | 'delete' | 'patch'

// 请求头
export interface WidgetDataDefineRequestHeaders {
  /** 名称 */
  name?: string
  /** 值 */
  value?: string
}

// 请求表单
export interface WidgetDataDefineRequestFormData {
  /** 名称 */
  name?: string
  /** 值 */
  value?: string
}

// 数据定义属性类型
export type WidgetDataDefinePropType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'object'
  | 'array'
  | 'undefined'

// 数据定义属性绑定接收类型
export type WidgetPropDefineBindType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'object'
  | 'array'
  | 'undefined'
  | 'any'
  | 'string[]'
  | 'number[]'
  | 'boolean[]'
  | 'object[]'
  | 'array[]'
  | 'undefined[]'
  | 'any[]'

//数据作用域
export type WidgetDataDefeinScope = 'global' | 'self-children' | 'children'

// 需求说明
export interface WidgetPrd {
  /** 颜色标识 */
  color?: string
  /** 内容 */
  content?: string
}

// 数据定义
export interface WidgetDataDefine {
  /** 数据定义唯一id */
  _vid: string
  /** 数据定义变量名 */
  _var?: string
  /** 数据定义类型 */
  _type: WidgetDataDefineType
  /** 所在组件id */
  widgetId?: string
  /** 数据定义名称 */
  name?: string
  /** 数据定义作用域 */
  scope?: WidgetDataDefeinScope
  /** 数据属性定义 */
  propDefines?: WidgetDataDefinePropDefine[]
  /** 数据JSON */
  jsonData?: string
  /** 引用数据绑定 */
  refBind: WidgetPropDefineBind
  /** Api接口地址模式 */
  requestUrlMode: RequestUrlModeType
  /** 请求地址 */
  requestUrl?: string
  /** 请求方法 */
  requestMethod?: WidgetDataDefineRequestMethod
  /** 是否显示loading */
  isShowLoading?: boolean
  /** 是否显示错误信息 */
  isShowErrorMsg?: boolean
  /** 是否显示成功信息 */
  isShowSuccessMsg?: boolean
  /** 成功信息 */
  successMsg?: string
  /** 请求Header数据类型 */
  requestHeadersType?: 'disable' | 'enable-input' | 'enable-bind'
  /** 请求Header */
  requestHeaders?: WidgetPropDefineBind | WidgetDataDefineRequestHeaders[]
  /** 请求表单数据类型 */
  requestFormDataType?: 'disable' | 'enable-input' | 'enable-bind'
  /** 请求表单数据 */
  requestFormData?: WidgetPropDefineBind | WidgetDataDefineRequestFormData[]
  /** 请求Body类型 */
  requestBodyType?: 'disable' | 'enable-input' | 'enable-bind'
  /** 请求Body */
  requestBody?: WidgetPropDefineBind | string
  /** 响应Body */
  responseBody?: string
  /** 数据json路径 */
  jsonDataPath?: string
  /** 数据是否自动加载 */
  isAutoLoad?: boolean
  /** 数据运行时转换函数 */
  runtimeFunction?: string
  /** 数据结构分析转换函数 */
  analyzerFunction?: string
  /** 数据加载成功触发可执行函数 */
  onSuccess?: DesignerEditorEvalFunction
  /** 数据加载失败触发可执行函数 */
  onError?: DesignerEditorEvalFunction
}

// 数据定义属性
export interface WidgetDataDefinePropDefine {
  /** 数据属性唯一id */
  _vid: string
  /** 数据属性key */
  _key?: string
  /** 数据属性名称 */
  name?: string
  /** 数据属性定义类型 */
  type?: WidgetDataDefinePropType
  /** 数据属性值 */
  value?: string
  /** 数据数组值属性类型 */
  itemType?: WidgetDataDefinePropType
  /** 数据数组值属性定义 */
  itemDefines?: WidgetDataDefinePropDefine[]
  /** 数据属性备注 */
  comment?: string
}

// 组件编辑器动态选项
export interface WidgetPropEditableOptionsValue {
  /** 值 */
  value?: string | string[]
  /** 选项列表 */
  options: Array<WidgetPropDefineOptions>
}

// 组件编辑器选项属性
export interface WidgetPropDefineOptions {
  /** 属性_vid */
  _vid?: string
  /** 属性Icon */
  icon?: string
  /** 属性名称 */
  label: string
  /** 属性值 */
  value: string
  /** 子选项 */
  children?: WidgetPropDefineOptions[]
}

// 拖拽数据
export interface DraggingData {
  slotId?: string
  index?: number
}

// 编辑器Store State
export interface DesignerStoreState {
  loadtime: number
  loading: boolean
  loadingContext: Record<string, boolean>
  loadErrorMsg?: string
  saving: boolean
  executing: boolean
  isDesignMode: boolean
  isPreviewMode: boolean
  drawerPanelOpened: boolean
  materialFileData?: MaterialFileDataVO
  editorData: DesignerEditorData
  widgetRenderContext: Record<string, WidgetRenderContext | undefined>
  widgetExposeContext: Record<string, Record<string, any> | undefined>
  executorResult: Record<string, GetDataResult | undefined>
  undoLogList: DesignerEditorCmd[]
  redoLogList: DesignerEditorCmd[]
  selectedWidgetId?: string
  taskQueue: DesignerEditorTask[]
  pendingTaskIds: Set<string>
  taskExecuteTimer?: any
  locationWidgetId?: string
  locationDataId?: string
  dragging: boolean
  draggingData?: DraggingData
  refreshWidgetId?: string
}

/** 编辑器Store */
export interface DesignerStore {
  state: Ref<DesignerStoreState>
  isLoaded: ComputedRef<boolean>
  isLoading: ComputedRef<boolean>
  isLoadError: ComputedRef<boolean>
  isDesignMode: ComputedRef<boolean>
  isPreviewMode: ComputedRef<boolean>
  isSaving: ComputedRef<boolean>
  isUndoLogEmpty: ComputedRef<boolean>
  isRedoLogEmpty: ComputedRef<boolean>
  emitter: Emitter<Record<string, unknown>>
  hasLoadingContext: ComputedRef<boolean>
  setState: (key: keyof DesignerStoreState, val: any) => void
  resetState: () => void
  setEditorData: (key: keyof DesignerEditorData, val: any) => void
  setLocation: (args?: { widgetId?: string; dataId?: string }) => void
  setDragging: (dragging: boolean, data?: DraggingData) => void
  setSelected: (widdget?: { _vid: string }) => void
  addUndoLog: (log: DesignerEditorCmd) => void
  getAndPopUndoLog: () => DesignerEditorCmd | undefined
  addRedoLog: (log: DesignerEditorCmd) => void
  getAndPopRedoLog: () => DesignerEditorCmd | undefined
  putExecutorResult: (def?: WidgetDataDefine, value?: GetDataResult) => void
  putWidgetExposeContext: (_vid?: string, value?: Record<string, any>) => void
  putWidgetRenderContext: (_vid?: string, value?: WidgetRenderContext) => void
  useWidgetRenderContext: (_vid?: string) => WidgetRenderContext | undefined
  executeTask: () => Promise<void>
  addTask: (task: DesignerEditorTask) => void
  loadMaterialFileData: (isPreview?: boolean) => Promise<void>
  saveMaterialFileData: () => Promise<void>
  setRefresh: (widdget?: { _vid: string }) => void
  refreshEditor: () => Promise<void>
  putLoadingContext: (key: string, val: boolean) => void
}

// 编辑器
export interface DesignerEditor {
  getStore: () => DesignerStore
  getEmitter: () => Emitter<Record<string, unknown>>
  executeCmd: (cmd: DesignerEditorCmd) => boolean
  rollbackCmd: (cmd: DesignerEditorCmd) => boolean
  getPageParams: () => Promise<any>
  getPageSlots: () => any
  dialog: (options: any) => Promise<any>
  close: (...args: any[]) => Promise<any>
  inject: Record<string, Function>
}

// 编辑器上下文
export interface WidgetRenderContext {
  /** 检索父组件方法 */
  seekParent: SeekWidgetFunction
  /** 检索数据方法 */
  seekData: SeekDataFunction
  /** 组件容器属性*/
  options?: WidgetItemOptions
}

// 编辑器组件参数上下文
export interface WidgetItemProps {
  editor: DesignerEditor
  parentWidget?: WidgetInstance
  parentRenderContext: WidgetRenderContext
  widget: WidgetInstance
  widgetIndex?: number
  options?: WidgetItemOptions
}
// 编辑器渲染组件参数上下文
export interface WidgetRenderProps {
  editor: DesignerEditor
  parentWidget?: WidgetInstance
  parentRenderContext: WidgetRenderContext
  widget: WidgetInstance
  widgetDefine: WidgetDefine
  widgetRenderContext: WidgetRenderContext
  widgetIndex?: number
}

// 组件检索结果
export interface SeekWidgetFunctionResult {
  // 检索组件结果
  seekWidget?: WidgetInstance
  // 组件检索链路
  seekLink?: WidgetInstance[]
}

//组件检索函数
export type SeekWidgetFunction = (
  // 检索组件参数
  args?: {
    _vid?: string
    _var?: string
    _key?: string
    _moduleName?: string
    putable?: boolean
    directParent?: boolean
  },
  // 组件检索链路
  seekLink?: WidgetInstance[]
) => SeekWidgetFunctionResult

//组件数据检索函数
export type SeekDataFunction = (
  // 数据绑定参数
  propBind?: WidgetPropDefineBind,
  // 默认值
  defaultValue?: any
) => any | undefined

//组件容器属性
export interface WidgetItemOptions {
  /** 是否可选择 */
  selectable?: boolean
  /** 是否可添加 */
  putable?: boolean
  /** 是否可排序 */
  sortable?: boolean
  /** 是否可删除 */
  deleteable?: boolean
  /** 是否可复制 */
  copyable?: boolean
}

// 编辑器上下文
export interface WidgetPropRenderContext {
  /** 编辑器实例 */
  editor: DesignerEditor
  /** 组件实例 */
  widget: WidgetInstance
  /** 编辑器上下文 */
  widgetRenderContext: WidgetRenderContext
  /** 组件定义 */
  widgetDefine: WidgetDefine
  /** 组件属性定义 */
  propDefine: WidgetPropDefine
}

// 组件渲染函数
export type WidgetPropRender = (
  modelValue: WritableComputedRef<any>,
  propRenderContext: WidgetPropRenderContext
) => () => JSX.Element

// 组件编辑器属性
export interface WidgetPropDefine {
  /** 属性Key */
  key: string
  /** 属性名称 */
  label: string
  /** 属性输入类型 */
  type?: string
  /** 属性帮助提示 */
  helps?: string
  /** 是否数组 */
  isArray?: boolean
  /** 数组最大长度 */
  maxLength?: number
  /** 属性最小长度 */
  minLength?: number
  /** 属性是否显示 */
  isShow?: (propRenderContext: WidgetPropRenderContext) => boolean
  /** 属性保存hook */
  onSave?: (editor: DesignerEditor, widget: WidgetInstance, propKey: string, propValue: any) => void
  /** 属性绑定保存hook */
  onSaveBind?: (
    editor: DesignerEditor,
    widget: WidgetInstance,
    propKey: string,
    propValue: any
  ) => void
  /** 默认值 */
  defaultValue?: ((editor: DesignerEditor) => any | undefined) | any
  /** 属性数据绑定值类型 */
  bindType?:
    | WidgetPropDefineBindType[]
    | ((
        propDefine?: WidgetPropDefine,
        propDefines?: WidgetDataDefinePropDefine[]
      ) => string | undefined)
  /** 属性渲染函数 */
  render?: WidgetPropRender
  /** 属性插槽渲染函数 */
  slots?: { label?: WidgetPropRender; labelRight?: WidgetPropRender }
  /** 隐藏标签 */
  hideLabel?: boolean
  /** Form Item Props */
  formItemProps?: Partial<FormItemProps> & {
    _labelPosition?: (val?: any) => FormItemProps['labelPosition'] | undefined
  }
  /** 拖拽排序, 仅 isArray 为true 时支持 */
  dragSortable?: boolean
  /** 是否可绑定 */
  bindable?: boolean
  /** 数据定义是否可绑定 */
  isDataDefineBindable?: (widget: WidgetInstance, dataDefine: WidgetDataDefine) => boolean
}

// 事件定义
export interface DesignerEditorEventDefine {
  /** 函数类型 */
  type?: DesignerEditorEvalFunctionType
  /** 事件Key */
  key: string
  /** 事件名称 */
  label: string
  /** 事件提示 */
  helps?: string
  /** 函数帮助 */
  fnHelps?: string
}

// 获取数据参数
export interface GetDataArgs {
  ignoreLoading?: boolean
  headers?: any
  formParams?: any
  requestBody?: any
  requestUrl?: string
  requestMethod?: string
  isShowErrorMsg?: boolean
  isShowSuccessMsg?: boolean
  successMsg?: string
  isShowLoading?: boolean
}

// 获取数据执行状态
export type GetDataStatus = 'executing' | 'fail' | 'success'

// 获取数据结果
export interface GetDataResult {
  status: GetDataStatus
  failError?: any
  data?: any
}

// 可执行函数上下文
export interface EvalFnContext {
  $request: (arg1?: any, arg2?: GetDataArgs) => Promise<any>
  $download: () => any
  $message: () => any
  $emit: (key: string, data: any) => void
  $close: (...args: any[]) => Promise<any>
  $dialog: (options: any) => Promise<any>
  $useExposeContext: (arg1?: string) => Promise<Record<string, any> | undefined>
  $data: (
    arg1: string | (GetDataArgs & { _var: string; refresh?: boolean }),
    data?: any,
    options?: any
  ) => Promise<any>
  $submit: (arg1?: string | (GetDataArgs & { _var: string })) => Promise<any>
  $log: (...args: any[]) => void
}

// 可执行函数类型 简单函数 自定义函数(防抖,节流), 鼠标函数(阻止默认, 阻止冒泡)
export type DesignerEditorEvalFunctionType = 'simple-function' | 'function' | 'mouse-function'

// 可执行函数
export interface DesignerEditorEvalFunction {
  /** 函数类型 */
  type?: DesignerEditorEvalFunctionType
  /** 可执行函数 */
  evalFunction?: string
  /** 函数防抖 */
  debounce?: boolean
  /** 函数节流 */
  throttle?: boolean
  /** 防抖/节流间隔时间 */
  dealy?: number
  /** 阻止事件冒泡 */
  stop?: boolean
  /** 阻止事件默认行为 */
  prevent?: boolean
}

// 按钮绑定类型
export interface ActionButtonConfig {
  /** 按钮类型 */
  type?: ButtonType
  /** 按钮名称 */
  label?: string
  /** 按钮图标 */
  icon?: string
  /** 按钮触发函数 */
  onClick?: DesignerEditorEvalFunction
  /** 按钮权限校验 */
  _vIfPermis?: string[]
  /** 按钮显示隐藏判断 */
  _vIfFun?: DesignerEditorEvalFunction
  /** 按钮尺寸 */
  size?: ComponentSize
  /** 是否为朴素按钮 */
  plain?: boolean
  /** 是否为链接按钮 */
  link?: boolean
}

// 事件绑定类型 组件事件, 生命周期事件, 自定义事件
export type DesignerEditorEventType = 'widget' | 'lifecycle' | 'custom'

// 事件绑定
export interface DesignerEditorEventBind extends DesignerEditorEvalFunction {
  /** 事件类型 */
  eventType: DesignerEditorEventType
}

// 组件实例
export interface WidgetInstance {
  /** 组件唯一id */
  _vid: string
  /** 组件变量名 */
  _var?: string
  /** 组件key */
  _key: string
  /** 组件所属模块名称 */
  _moduleName: string
  /** 在画板中隐藏 */
  _hidden?: boolean
  /** 组件权限控制 */
  _vIfPermis?: string[]
  /** v-if 函数控制 */
  _vIfFun?: DesignerEditorEvalFunction
  /** 组件字段绑定 */
  _binds?: Record<string, WidgetPropDefineBind | undefined>
  /** 组件中文名称 */
  label: string
  /** 组件icon */
  icon?: string
  /** 组件属性 */
  props: Record<string, any>
  /** 组件属性绑定 */
  propsBind?: Record<string, WidgetPropDefineBind | undefined>
  /** 所属插槽Key */
  slotKey?: string
  /** 插槽组件 */
  slots: WidgetInstance[]
  /** 插槽子组件 */
  slotChildren: WidgetInstance[]
  /** 数据定义 */
  dataDefines?: WidgetDataDefine[]
  /** 组件事件绑定 */
  eventsBind?: Record<string, DesignerEditorEventBind | undefined>
  /** 需求描述 */
  prd?: WidgetPrd
}

// 组件定义
export type WidgetDefine = {
  /** 组件唯一id */
  _vid?: string
  /** 组件key */
  _key?: string
  /** 组件所属模块名称 */
  _moduleName?: string
  /** 组件icon */
  icon?: string
  /** 组件Tips */
  tips?: string
  /** 组件排序 */
  sort?: number
  /** 组件属性 */
  props?: Record<string, any>
  /** 组件设计器基础属性 */
  baseDesignerProps?: WidgetPropDefine[]
  /** 组件设计器高级属性 */
  advDesignerProps?: WidgetPropDefine[]
  /** 组件设计器样式属性 */
  styleDesignerProps?: WidgetPropDefine[]
  /** 禁用组件外容器 */
  disableOuter?: boolean
  /** 组件外容器样式属性 */
  outerStyleDesignerProps?: WidgetPropDefine[]
  /** 禁用组件内容器 */
  disableInner?: boolean
  /** 组件内容器样式属性 */
  innerStyleDesignerProps?: WidgetPropDefine[]
  /** 组件事件定义 */
  events?: DesignerEditorEventDefine[]
  /** 组件创建实例钩子方法 */
  create?: (
    editor: DesignerEditor,
    define: WidgetDefine,
    args?: {
      parentWidget?: WidgetInstance
      parentRenderContext?: WidgetRenderContext
      options?: WidgetItemOptions
      defaultProps?: Record<string, any>
    }
  ) => WidgetInstance | Promise<WidgetInstance>
  /** 组件渲染函数 */
  render: (args: WidgetRenderProps) => () => JSX.Element
  /** 更新组件属性 */
  saveProps?: (
    editor: DesignerEditor,
    widget: WidgetInstance,
    propKey: string,
    propValue: any
  ) => void
  /** 更新组件属性绑定 */
  savePropsBind?: (
    editor: DesignerEditor,
    widget: WidgetInstance,
    propKey: string,
    propsBindValue: any
  ) => void
  /** 更新组件事件绑定 */
  saveEventBind?: (
    editor: DesignerEditor,
    widget: WidgetInstance,
    eventKey: string,
    eventBindValue?: DesignerEditorEventBind
  ) => void
  /** 禁止定义数据 */
  enableDataDefineTypes?: ('def' | 'remote' | 'ref')[]
  /** 组件菜单 */
  menus?: (editor: DesignerEditor, args: UseWidgetMenusArgs) => MenuItem[]
  /** 是否菜单中禁用 */
  disableInMenu?: (
    action: WidgetMenuAction,
    widget?: WidgetInstance,
    widgetRenderContext?: WidgetRenderContext
  ) => boolean | ComputedRef<boolean>
  /** 是否菜单中隐藏 */
  hiddenInMenu?: (
    action: WidgetMenuAction,
    widget?: WidgetInstance,
    widgetRenderContext?: WidgetRenderContext
  ) => boolean | ComputedRef<boolean>
  /** 运行时数据定义 */
  runtimeDataDefines?: (editor: DesignerEditor, widget: WidgetInstance) => WidgetDataDefine[]
} & Omit<WidgetInstance, '_vid' | '_key' | '_moduleName' | 'props' | 'slots' | 'slotChildren'>

// 组件模块配置
export interface WidgetModuleInfo {
  /** 模块名称 */
  name?: string
  /** 模块Icon */
  icon?: string
  /** 模块Label */
  label?: string
  /** 模块忽略注册组件 */
  ignores?: (string | undefined)[]
  /** 模块下组件定义 */
  defines?: WidgetDefine[]
  /** 模块菜单 */
  menus?: (editor: DesignerEditor, args: UseWidgetMenusArgs) => MenuItem[]
  /** 是否菜单中禁用 */
  disableInMenu?: (
    action: WidgetMenuAction,
    widget?: WidgetInstance,
    widgetRenderContext?: WidgetRenderContext
  ) => boolean | ComputedRef<boolean>
  /** 是否菜单中隐藏 */
  hiddenInMenu?: (
    action: WidgetMenuAction,
    widget?: WidgetInstance,
    widgetRenderContext?: WidgetRenderContext
  ) => boolean | ComputedRef<boolean>
}

// 编辑器指令
export interface DesignerEditorCmd {
  /** 指令Key */
  cmd: string
  /** 指令可执行函数 */
  execute: () => boolean
  /** 指令回滚函数 */
  rollback?: () => boolean
  /** 指令执行后触发自动保存间隔 */
  disableAutoSave?: boolean
  /** 指令执行后触发自动保存间隔 */
  saveInterval?: number
  /** 指令执行成功回调 */
  executeSuccess?: () => void
  /** 指令执行失败回调 */
  executeFail?: () => void
  /** 指令回滚成功回调 */
  rollbackSuccess?: () => void
  /** 指令回滚失败回调 */
  rollbackFail?: () => void
}

// 编辑器数据
export interface DesignerEditorData {
  /** 唯一id */
  _vid: string
  /** 页面背景色 */
  pageBgColor?: string
  /** 自动打开属性面板 */
  drawerPanelAutoOpen: boolean
  /** 设计页面宽度 */
  designPageWidth?: string
  /** 请求接口地址模式 */
  requestUrlMode: RequestUrlModeType
  /** 请求接口相对Base地址 */
  requestUrlBase?: String
  /** 页面组件树 */
  widgetTree: WidgetInstance[]
  /** 全局事件定义 */
  events?: DesignerEditorEventDefine[]
  /** 事件绑定 */
  eventsBind?: Record<string, DesignerEditorEventBind | undefined>
  /** 编辑器关闭 */
  onPageClose?: DesignerEditorEvalFunction
}

// 编辑器任务
export interface DesignerEditorTask {
  /** 任务id */
  id: string | WidgetDataDefine
  /** 任务可执行函数 */
  execute: () => Promise<void>
}

// Promise Method
export interface PromiseCallback {
  resolve?: (data?: any) => void
  reject?: (reason?: any) => void
}

export const DisplayOptions: WidgetPropDefineOptions[] = [
  {
    label: '块级',
    value: 'block'
  },
  {
    label: '内联',
    value: 'inline'
  },
  {
    label: '弹性盒',
    value: 'flex'
  },
  {
    label: '网格',
    value: 'grid'
  },
  {
    label: '瀑布流',
    value: 'waterfall'
  }
]

export const FlexDirectionOptions: WidgetPropDefineOptions[] = [
  {
    label: '横向',
    value: 'row'
  },
  {
    label: '纵向',
    value: 'column'
  }
]

export const FlexWrapOptions: WidgetPropDefineOptions[] = [
  {
    label: '单行',
    value: 'nowrap'
  },
  {
    label: '多行',
    value: 'wrap'
  }
]

export const JustifyContentOptions: WidgetPropDefineOptions[] = [
  {
    label: 'Start',
    value: 'flex-start',
    icon: 'svg-icon:lowcode-icon-justify-start'
  },
  {
    label: 'Center',
    value: 'center',
    icon: 'svg-icon:lowcode-icon-justify-center'
  },
  {
    label: 'End',
    value: 'flex-end',
    icon: 'svg-icon:lowcode-icon-justify-end'
  },
  {
    label: 'SpaceBetween',
    value: 'space-between',
    icon: 'svg-icon:lowcode-icon-justify-space-between'
  },
  {
    label: 'SpaceAround',
    value: 'space-around',
    icon: 'svg-icon:lowcode-icon-justify-space-around'
  },
  {
    label: 'SpaceEvenly',
    value: 'space-evenly',
    icon: 'svg-icon:lowcode-icon-justify-space-evenly'
  }
]

export const LayoutJustifyOptions: WidgetPropDefineOptions[] = [
  {
    label: 'Start',
    value: 'start',
    icon: 'svg-icon:lowcode-icon-justify-start'
  },
  {
    label: 'Center',
    value: 'center',
    icon: 'svg-icon:lowcode-icon-justify-center'
  },
  {
    label: 'End',
    value: 'end',
    icon: 'svg-icon:lowcode-icon-justify-end'
  },
  {
    label: 'SpaceBetween',
    value: 'space-between',
    icon: 'svg-icon:lowcode-icon-justify-space-between'
  },
  {
    label: 'SpaceAround',
    value: 'space-around',
    icon: 'svg-icon:lowcode-icon-justify-space-around'
  },
  {
    label: 'SpaceEvenly',
    value: 'space-evenly',
    icon: 'svg-icon:lowcode-icon-justify-space-evenly'
  }
]

export const AlignItemsOptions: WidgetPropDefineOptions[] = [
  {
    label: 'Start',
    value: 'flex-start',
    icon: 'svg-icon:lowcode-icon-align-start'
  },
  {
    label: 'Center',
    value: 'center',
    icon: 'svg-icon:lowcode-icon-align-center'
  },
  {
    label: 'End',
    value: 'flex-end',
    icon: 'svg-icon:lowcode-icon-align-end'
  },
  {
    label: 'SpaceBetween',
    value: 'space-between',
    icon: 'svg-icon:lowcode-icon-align-space-between'
  },
  {
    label: 'SpaceAround',
    value: 'space-around',
    icon: 'svg-icon:lowcode-icon-align-space-around'
  },
  {
    label: 'SpaceEvenly',
    value: 'space-evenly',
    icon: 'svg-icon:lowcode-icon-align-space-evenly'
  }
]

export const LayoutAlignOptions: WidgetPropDefineOptions[] = [
  {
    label: 'Top',
    value: 'top',
    icon: 'svg-icon:lowcode-icon-align-start'
  },
  {
    label: 'Middle',
    value: 'middle',
    icon: 'svg-icon:lowcode-icon-align-center'
  },
  {
    label: 'Bottom',
    value: 'bottom',
    icon: 'svg-icon:lowcode-icon-align-end'
  }
]

export const ElCommonSizeOptions = [
  { label: '大型', value: 'large' },
  { label: '普通', value: 'default' },
  { label: '小型', value: 'small' }
]

export const ElCommonTypeOptions = [
  { label: '主要', value: 'primary' },
  { label: '成功', value: 'success' },
  { label: '警告', value: 'warning' },
  { label: '危险', value: 'danger' },
  { label: '信息', value: 'info' },
  { label: '默认', value: 'default' }
]

export const ElCommonTagTypeOptions = [
  { label: '成功', value: 'success' },
  { label: '信息', value: 'info' },
  { label: '警告', value: 'warning' },
  { label: '危险', value: 'danger' }
]

export const ElCommonTagEffectOptions = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'Plain', value: 'plain' }
]

export const CssSymbols = ['px', 'rem', '%']

export const RequestUrlModeOptions = [
  { value: 'REF_PROJECT', label: '跟随项目' },
  { value: 'REF_BASE', label: '相对Base' }
]

export const RequestMethodQueryOptions = [
  {
    value: 'get',
    label: 'GET'
  },
  {
    value: 'post',
    label: 'POST'
  }
]

export const RequestMethodModifyOptions = [
  {
    value: 'post',
    label: 'POST'
  },
  {
    value: 'delete',
    label: 'DELETE'
  },
  {
    value: 'put',
    label: 'PUT'
  },
  {
    value: 'patch',
    label: 'PATCH'
  }
]

export const CommonTextPattern = [
  {
    label: '手机号',
    value: jsonStringify({ pattern: '^1\\d{10}$', message: '请输入正确的手机号码' })
  },
  {
    label: '邮箱',
    value: jsonStringify({
      pattern: '^([A-Za-z0-9_\\-\\.])+\\@([A-Za-z0-9_\\-\\.])+\\.([A-Za-z]{2,4})$',
      message: '请输入正确的邮箱'
    })
  },
  {
    label: '身份证号',
    value: jsonStringify({
      pattern:
        '^[1-9]\\d{5}(18|19|([23]\\d))\\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\\d{3}[0-9Xx]$',
      message: '请输入正确的身份证号'
    })
  },
  {
    label: 'URL连接',
    value: jsonStringify({
      pattern: '^((https?|ftp|file):\\/\\/)?([\\da-z\\.-]+)\\.([a-z\\.]{2,6})([\\/\\w\\.-]*)*\\/?$',
      message: '请输入正确的URL连接'
    })
  }
]

export const ElDatePickerTypeOptions = [
  { value: 'year', label: '单个年份', format: 'YYYY' },
  { value: 'month', label: '单个月份', format: 'YYYY-MM' },
  { value: 'week', label: '单个年周', format: 'YYYY年第ww周', valueFormat: 'YYYY-ww' },
  { value: 'date', label: '单个日期', format: 'YYYY-MM-DD' },
  { value: 'datetime', label: '单个日期和时间', format: 'YYYY-MM-DD HH:mm:ss' },
  { value: 'years', label: '多个年份', format: 'YYYY' },
  { value: 'months', label: '多个月份', format: 'YYYY-MM' },
  { value: 'dates', label: '多个日期', format: 'YYYY-MM-DD' },
  { value: 'daterange', label: '日期范围选择', format: 'YYYY-MM-DD' },
  { value: 'datetimerange', label: '日期和时间范围选择', format: 'YYYY-MM-DD HH:mm:ss' },
  { value: 'monthrange', label: '月份范围选择', format: 'YYYY-MM' },
  { value: 'yearrange', label: '年份范围选择', format: 'YYYY' }
]
