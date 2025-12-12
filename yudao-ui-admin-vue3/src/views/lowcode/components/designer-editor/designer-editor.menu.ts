import { MenuItem } from '@imengyu/vue3-context-menu'
import { isArray, isEmpty, isNullOrUnDef } from '@/utils/is'
import { useMessage } from '@/hooks/web/useMessage'
import {
  addWidgetCmd,
  autoSaveImmediately,
  copyWidgetCmd,
  deleteWidgetCmd,
  moveWidgetCmd,
  writeEditorDataValueCmd
} from './designer-editor.cmd'
import {
  copyWidgetVidOrVar,
  createWidgetInstance,
  checkDataDefineAreBound,
  checkDataDefineAreRefed,
  getWidgetShowLabel,
  useWidgetDataDefines,
  useWidgetDataDefinesAndRuntime
} from './designer-editor.utils'
import { useWidgetDefine, useWidgetModule, useWidgetModules } from './widgets/index'
import {
  WidgetInstance,
  WidgetModuleInfo,
  WidgetRenderContext,
  WidgetMenuAction,
  DesignerEditor,
  WidgetItemOptions
} from './designer-editor.type'
import { useDataDefineExecutor } from './components/dataDefine/hooks'

const message = useMessage()

/** 撤销操作 */
export function useUndoMenu(editor: DesignerEditor): MenuItem {
  return {
    icon: 'svg-icon:lowcode-icon-undo',
    label: '撤销',
    onClick() {
      const cmd = editor.getStore().getAndPopUndoLog()
      if (cmd) {
        editor.rollbackCmd(cmd)
      }
    }
  }
}
/** 重做操作 */
export function useRedoMenu(editor: DesignerEditor): MenuItem {
  return {
    icon: 'svg-icon:lowcode-icon-redo',
    label: '重做',
    onClick() {
      const cmd = editor.getStore().getAndPopRedoLog()
      if (cmd) {
        editor.executeCmd(cmd)
      }
    }
  }
}
/** 模式切换 */
export function usePreviewModeSwitchMenu(editor: DesignerEditor): MenuItem {
  const { isPreviewMode, loadMaterialFileData } = editor.getStore()
  return {
    icon: isPreviewMode.value ? 'ep:edit' : 'ep:view',
    label: isPreviewMode.value ? '编辑模式' : '预览模式',
    onClick: () => {
      loadMaterialFileData(!isPreviewMode.value)
    }
  }
}

/** 在弹框中打开 */
export function useOpenInDesignerPageDialog(
  editor: DesignerEditor,
  args: UseWidgetMenusArgs
): MenuItem {
  return {
    icon: 'ep:view',
    label: '弹框预览模式',
    onClick: async () => {
      await autoSaveImmediately(editor)
      const { materialFileData } = editor.getStore().state.value
      if (isNullOrUnDef(materialFileData)) {
        return message.error('未加载到物料文件数据')
      }
      const openDesignerPageDialog = (args.inject ?? {})['openDesignerPageDialog'] as Function
      const result = await openDesignerPageDialog?.({
        title: '预览测试弹框',
        width: '1200px',
        fileId: materialFileData!.fileId,
        version: materialFileData!.version
      })
      message.info(JSON.stringify(result))
    }
  }
}
/** 发布页面 */
export function useDeployPageMenu(editor: DesignerEditor, args: UseWidgetMenusArgs): MenuItem {
  return {
    icon: 'ep:upload-filled',
    label: '发布页面',
    onClick: async () => {
      await autoSaveImmediately(editor)
      const { materialFileData } = editor.getStore().state.value
      if (isNullOrUnDef(materialFileData)) {
        return message.error('未加载到物料文件数据')
      }
      const openDeployMenuDialog = (args.inject ?? {})['openDeployMenuDialog'] as Function
      openDeployMenuDialog?.({
        fileId: materialFileData!.fileId,
        version: materialFileData!.version
      })
    }
  }
}
/** 选择父组件 */
export function useSelectParentMenu(editor: DesignerEditor, args: UseWidgetMenusArgs): MenuItem {
  return {
    icon: 'svg-icon:lowcode-icon-to-parent',
    label: '选择父级',
    onClick: () => {
      editor.getStore().setSelected(args.parentWidget)
    }
  }
}
/** 组件说明编辑 */
export function useEditPrdMenu(args: UseWidgetMenusArgs): MenuItem {
  return {
    icon: 'ep:document',
    label: '编辑说明',
    onClick: () => {
      const openWidgetPrdForm = (args.inject ?? {})['openWidgetPrdForm'] as Function
      openWidgetPrdForm?.(args.widget)
    }
  }
}
/** 组件结构树 */
export function useWidgetTreeMenu(args?: Partial<UseWidgetMenusArgs>): MenuItem {
  return {
    icon: 'svg-icon:lowcode-icon-node-tree',
    label: '页面结构',
    onClick: () => {
      const openWidgetTreeDrawer = (args?.inject ?? {})['openWidgetTreeDrawer'] as Function
      openWidgetTreeDrawer?.()
    }
  }
}
/** 组件说明列表 */
export function useWidgetPrdMenu(args?: Partial<UseWidgetMenusArgs>): MenuItem {
  return {
    icon: 'ep:document',
    label: '组件说明',
    onClick: () => {
      const openWidgetPrdDrawer = (args?.inject ?? {})['openWidgetPrdDrawer'] as Function
      openWidgetPrdDrawer?.()
    }
  }
}
/** 组件排序-下移 */
export function useSortDownMenu(editor: DesignerEditor, args: UseWidgetMenusArgs): MenuItem {
  return {
    icon: 'ep:sort-down',
    label: '排序-下移',
    hidden: !(args.widgetRenderContext.options?.sortable ?? true),
    onClick: () => {
      editor.executeCmd(
        moveWidgetCmd(editor, {
          widget: args.widget,
          toSlotId: args.parentWidget?._vid,
          toIndex: args.widgetIndex + 1,
          fromSlotId: args.parentWidget?._vid,
          fromIndex: args.widgetIndex
        })
      )
    }
  }
}
/** 组件排序-上移 */
export function useSortUpMenu(editor: DesignerEditor, args: UseWidgetMenusArgs): MenuItem {
  return {
    icon: 'ep:sort-up',
    label: '排序-上移',
    hidden: !(args.widgetRenderContext.options?.sortable ?? true),
    onClick: () => {
      editor.executeCmd(
        moveWidgetCmd(editor, {
          widget: args.widget,
          toSlotId: args.parentWidget?._vid,
          toIndex: Math.max(args.widgetIndex - 1, 0),
          fromSlotId: args.parentWidget?._vid,
          fromIndex: args.widgetIndex
        })
      )
    }
  }
}
/** 组件复制 */
export function useWidgetCopyMenu(editor: DesignerEditor, args: UseWidgetMenusArgs): MenuItem {
  return {
    icon: 'ep:copy-document',
    label: '复制',
    hidden: !(args.widgetRenderContext.options?.copyable ?? true),
    onClick: () => {
      editor.executeCmd(
        copyWidgetCmd(editor, {
          originalWidget: args.widget,
          toSlotId: args.parentWidget?._vid
        })
      )
    }
  }
}
/** 组件删除 */
export function useWidgetDeleteMenu(editor: DesignerEditor, args: UseWidgetMenusArgs): MenuItem {
  return {
    icon: 'ep:delete',
    label: '删除',
    hidden: !(args.widgetRenderContext.options?.deleteable ?? true),
    onClick: () => {
      const unDeleteDefine = useWidgetDataDefinesAndRuntime(editor, args.widget).find((def) => {
        const refedList = checkDataDefineAreRefed(editor, args.widget, def, true, undefined, true)
        if (!isEmpty(refedList)) {
          message.error(`数据 ${def.name} 被 ${refedList[0].label} 引用中不能删除`)
          return true
        }
        const boundList = checkDataDefineAreBound(editor, args.widget, def, true, undefined, true)
        if (!isEmpty(boundList)) {
          message.error(`数据 ${def.name} 被 ${boundList[0].label} 绑定中不能删除`)
          return true
        }
      })
      if (isNullOrUnDef(unDeleteDefine)) {
        const hasResultMap: Record<string, boolean> = {}
        useWidgetDataDefines(args.widget).forEach((dataDefine) => {
          const { value } = useDataDefineExecutor(editor, { dataDefine })
          hasResultMap[dataDefine._vid] = !isNullOrUnDef(value.value)
        })
        editor.executeCmd({
          ...deleteWidgetCmd(editor, {
            fromSlotId: args.parentWidget?._vid,
            widget: args.widget
          }),
          async executeSuccess() {
            useWidgetDataDefines(args.widget).forEach((dataDefine) => {
              if (hasResultMap[dataDefine._vid]) {
                useDataDefineExecutor(editor, { dataDefine }).getData()
              }
            })
          },
          async rollbackSuccess() {
            useWidgetDataDefines(args.widget).forEach((dataDefine) => {
              if (hasResultMap[dataDefine._vid]) {
                useDataDefineExecutor(editor, { dataDefine }).getData()
              }
            })
          }
        })
      }
    }
  }
}
/** 清空所有组件 */
export function useWidgetClearMenu(editor: DesignerEditor): MenuItem {
  return {
    icon: 'ep:circle-close',
    label: '清空',
    onClick: async () => {
      await message.confirm(`是否清空全部数据?`)
      editor.executeCmd(writeEditorDataValueCmd(editor, { key: 'widgetTree', value: [] }))
    }
  }
}
/** 打开组件属性面板 */
export function useOpenWidgetDrawerPanelMenu(editor: DesignerEditor): MenuItem {
  return {
    icon: 'ep:set-up',
    label: '组件属性',
    onClick: async () => {
      editor.getStore().setState('drawerPanelOpened', true)
    }
  }
}
/** 打开页面属性面板 */
export function useOpenPageDrawerPanelMenu(editor: DesignerEditor): MenuItem {
  return {
    icon: 'ep:set-up',
    label: '页面属性',
    onClick: async () => {
      const store = editor.getStore()
      store.setSelected()
      nextTick(() => {
        store.setState('drawerPanelOpened', true)
      })
    }
  }
}
/** 编辑数据导出 */
export function useEditorDataExportMenu(args?: Partial<UseWidgetMenusArgs>): MenuItem {
  return {
    icon: 'ep:download',
    label: '导出数据',
    onClick: () => {
      const openEditorDataDialog = (args?.inject ?? {})['openEditorDataDialog'] as Function
      openEditorDataDialog?.(false)
    }
  }
}
/** 编辑数据导入 */
export function useEditorDataImportMenu(args?: Partial<UseWidgetMenusArgs>): MenuItem {
  return {
    icon: 'ep:upload',
    label: '导入数据',
    onClick: () => {
      const openEditorDataDialog = (args?.inject ?? {})['openEditorDataDialog'] as Function
      openEditorDataDialog?.(true)
    }
  }
}
/** 添加组件 */
export function useWidgetAddMenu(
  editor: DesignerEditor,
  args?: Partial<UseWidgetMenusArgs>
): MenuItem {
  const action: WidgetMenuAction = 'add'
  const allModules = Object.values(useWidgetModules()) as WidgetModuleInfo[]

  let putableParent: WidgetInstance | undefined

  if (args?.widgetRenderContext?.options?.putable == true) {
    putableParent = args.widget
  }

  if (isNullOrUnDef(putableParent)) {
    const seekParentResult = args?.widgetRenderContext?.seekParent({ putable: true })
    putableParent = seekParentResult?.seekWidget
  }

  return {
    label: !isNullOrUnDef(putableParent) ? getWidgetShowLabel(putableParent) : '添加组件',
    icon: 'ep:circle-plus',
    children: allModules.map((moduleInfo) => {
      const hiddenInMenu = moduleInfo.hiddenInMenu?.(
        action,
        putableParent,
        args?.widgetRenderContext
      )
      const disableInMenu = moduleInfo.disableInMenu?.(
        action,
        putableParent,
        args?.widgetRenderContext
      )
      return {
        label: moduleInfo.label,
        icon: moduleInfo.icon,
        hidden: hiddenInMenu,
        disabled: isEmpty(moduleInfo.defines) || disableInMenu,
        children: moduleInfo.defines?.map((define): MenuItem => {
          return {
            label: define.label,
            icon: define.icon,
            hidden: define.hiddenInMenu?.(action, putableParent, args?.widgetRenderContext),
            disabled: define.disableInMenu?.(action, putableParent, args?.widgetRenderContext),
            onClick: async () => {
              const widget = await createWidgetInstance(editor, define, {
                parentWidget: args?.widget,
                parentRenderContext: args?.widgetRenderContext,
                defaultProps: args?.options
              })
              editor.executeCmd(
                addWidgetCmd(editor, {
                  toSlotId: putableParent?._vid,
                  toIndex: args?.widgetIndex ? args.widgetIndex + 1 : 0,
                  widget
                })
              )
              editor.getStore().setSelected(widget)
            }
          }
        })
      }
    })
  }
}

/** 获取菜单参数 */
export interface UseWidgetMenusArgs {
  parentWidget?: WidgetInstance
  parentRenderContext?: WidgetRenderContext
  widget: WidgetInstance
  widgetRenderContext: WidgetRenderContext
  widgetIndex: number
  options?: WidgetItemOptions
  widgetMenus?: MenuItem[]
  rootMenus?: MenuItem[]
  inject?: Record<string, Function>
}

/** 获取菜单 */
export function useWidgetMenus(
  editor: DesignerEditor,
  args?: Partial<UseWidgetMenusArgs>
): MenuItem[] {
  const { isPreviewMode, isDesignMode, isUndoLogEmpty, isRedoLogEmpty } = editor.getStore()

  const rootMenus: MenuItem[] = []

  const pushDivided = () => {
    rootMenus.push({ divided: 'self' })
  }

  const pushMenu = (item: MenuItem | MenuItem[], divided: boolean = true) => {
    if (isArray(item)) {
      rootMenus.push(...item)
    } else {
      rootMenus.push(item)
    }
    if (divided) {
      pushDivided()
    }
  }

  if (isPreviewMode.value && isDesignMode.value) {
    pushMenu(
      [usePreviewModeSwitchMenu(editor), useDeployPageMenu(editor, args as UseWidgetMenusArgs)],
      false
    )
    return rootMenus
  }

  if (!isUndoLogEmpty.value) {
    pushMenu(useUndoMenu(editor), false)
  }

  if (!isRedoLogEmpty.value) {
    pushMenu(useRedoMenu(editor), false)
  }

  // 组件信息
  if (
    !isNullOrUnDef(args?.widget) &&
    !isNullOrUnDef(args?.widgetRenderContext) &&
    !isNullOrUnDef(args?.widgetIndex)
  ) {
    pushMenu({
      icon: args.widget.icon,
      label: getWidgetShowLabel(args.widget),
      children: [
        {
          icon: 'ep:copy-document',
          label: !isNullOrUnDef(args.widget._var) ? '复制var' : '复制ID',
          onClick() {
            copyWidgetVidOrVar(args.widget)
          }
        },
        useSelectParentMenu(editor, args as UseWidgetMenusArgs),
        useEditPrdMenu(args as UseWidgetMenusArgs),
        useWidgetCopyMenu(editor, args as UseWidgetMenusArgs),
        useSortDownMenu(editor, args as UseWidgetMenusArgs),
        useSortUpMenu(editor, args as UseWidgetMenusArgs),
        useWidgetDeleteMenu(editor, args as UseWidgetMenusArgs),
        // 附加菜单
        ...(args.widgetMenus ?? [])
      ]
    })
  }

  // 添加组件菜单
  pushMenu(useWidgetAddMenu(editor, args))

  // 附加菜单
  if (!isEmpty(args?.rootMenus)) {
    pushMenu(args?.rootMenus ?? [])
  }

  if (!isNullOrUnDef(args?.widget)) {
    const widgetModule = useWidgetModule(args.widget)
    const widgetDefine = useWidgetDefine(args.widget)
    const tempMenusLength = rootMenus.length

    // 组件定义菜单
    if (!isNullOrUnDef(widgetDefine.menus)) {
      pushMenu(widgetDefine.menus(editor, args as UseWidgetMenusArgs), false)
    }

    // 模块定义菜单
    if (!isNullOrUnDef(widgetModule.menus)) {
      pushMenu(widgetModule.menus(editor, args as UseWidgetMenusArgs), false)
    }

    if (rootMenus.length > tempMenusLength) {
      pushDivided()
    }
  }

  // 属性菜单
  if (!isNullOrUnDef(args?.widget)) {
    pushMenu([useOpenWidgetDrawerPanelMenu(editor)], false)
  }

  pushMenu(
    [
      useOpenPageDrawerPanelMenu(editor),
      {
        icon: 'ep:more-filled',
        label: '更多',
        children: [
          usePreviewModeSwitchMenu(editor),
          useOpenInDesignerPageDialog(editor, args as UseWidgetMenusArgs),
          useWidgetPrdMenu(args),
          useWidgetTreeMenu(args),
          useEditorDataExportMenu(args),
          useEditorDataImportMenu(args),
          useDeployPageMenu(editor, args as UseWidgetMenusArgs),
          useWidgetClearMenu(editor)
        ]
      }
    ],
    false
  )
  return rootMenus
}
