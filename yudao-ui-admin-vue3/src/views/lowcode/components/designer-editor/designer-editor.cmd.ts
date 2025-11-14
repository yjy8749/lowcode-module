import {
  WidgetInstance,
  DesignerEditorCmd,
  DesignerEditorData,
  WidgetPropDefineBind,
  DesignerEditorEventBind,
  DesignerEditor
} from './designer-editor.type'
import {
  addWidgetAtIndex,
  cloneWidget,
  delWidgetAtIndex,
  delWidgetById,
  indexOfWidgetById,
  readEditorDataValue,
  readPropBind,
  readPropValue,
  readWidgetEventBind,
  readWidgetValue,
  readWidgetValueBind,
  useSlotChildrenOrTree,
  writeEditorDataValue,
  writePropBindById,
  writePropValueById,
  writeWidgetEventBindById,
  writeWidgetValueBindById,
  writeWidgetValueById
} from './designer-editor.utils'
import { isNullOrUnDef } from '@/utils/is'

/** 回调函数执行 */
const tryExecuteFn = (fn?: () => void) => {
  if (fn) {
    try {
      fn()
    } catch (e) {
      console.error(`execute callback fail`, e)
    }
  }
}
/** 自动保存Timer */
const _autoSaveTimer: Ref<any> = ref()
const _autoSaveExecuting = ref(false)
/** 触发自动保存 */
const autoSave = (editor: DesignerEditor, saveInterval?: number) => {
  if (_autoSaveTimer.value) {
    clearTimeout(_autoSaveTimer.value)
  }
  _autoSaveExecuting.value = true
  _autoSaveTimer.value = setTimeout(async () => {
    await editor.getStore().saveMaterialFileData()
    _autoSaveExecuting.value = false
    console.info(`auto save success`)
  }, saveInterval ?? 1000)
}
/** 立即执行自动保存 */
export async function autoSaveImmediately(editor: DesignerEditor) {
  if (_autoSaveExecuting.value) {
    clearTimeout(_autoSaveTimer.value)
    await editor.getStore().saveMaterialFileData()
    console.info(`auto save immediately success`)
  }
}
/** 指令执行 */
export function execute(editor: DesignerEditor, cmd: DesignerEditorCmd): boolean {
  try {
    if (cmd.execute()) {
      console.info(`execute ${cmd.cmd} success`)
      if (cmd.rollback) {
        editor.getStore().addUndoLog(cmd)
      }
      if (!cmd.disableAutoSave) {
        autoSave(editor, cmd.saveInterval)
      }
      tryExecuteFn(cmd.executeSuccess)
    } else {
      console.error(`execute ${cmd.cmd} fail`)
      tryExecuteFn(cmd.executeFail)
    }
    return true
  } catch (e) {
    console.error(`execute fail`, e)
  }
  return false
}
/** 指令回滚 */
export function rollback(editor: DesignerEditor, cmd: DesignerEditorCmd): boolean {
  try {
    if (cmd.rollback) {
      if (cmd.rollback()) {
        console.info(`rollback ${cmd.cmd} success`)
        editor.getStore().addRedoLog(cmd)
        if (!cmd.disableAutoSave) {
          autoSave(editor, cmd.saveInterval)
        }
        tryExecuteFn(cmd.rollbackSuccess)
      } else {
        console.error(`rollback ${cmd.cmd} fail`)
        tryExecuteFn(cmd.rollbackFail)
      }
    }
    return true
  } catch (e) {
    console.error(`rollback fail`, e)
  }
  return false
}
/** 批处理指令 */
export function batchCmd(cmdList: DesignerEditorCmd[]): DesignerEditorCmd {
  const cmdArgs = {
    cmdList
  }
  return {
    cmd: 'batchCmd',
    execute: () => {
      cmdArgs.cmdList.map((cmd) => {
        try {
          if (cmd.execute()) {
            console.info(`batch execute ${cmd.cmd} success`)
            tryExecuteFn(cmd.executeSuccess)
          } else {
            console.error(`batch execute ${cmd.cmd} fail`)
            tryExecuteFn(cmd.executeFail)
          }
        } catch (e) {
          console.error(`execute fail`, e)
        }
      })
      return true
    },
    rollback: () => {
      cmdArgs.cmdList.reverse().map((cmd) => {
        try {
          if (cmd.rollback) {
            if (cmd.rollback()) {
              console.info(`batch rollback ${cmd.cmd} success`)
              tryExecuteFn(cmd.rollbackSuccess)
            } else {
              console.error(`batch rollback ${cmd.cmd} fail`)
              tryExecuteFn(cmd.rollbackFail)
            }
          }
        } catch (e) {
          console.error(`rollback fail`, e)
        }
      })
      return true
    }
  }
}
/** Editor数据更新指令 */
interface WriteEditorDataValueCmdArgs {
  key: keyof DesignerEditorData
  value?: any
  subKey?: string
  subIndex?: number
}
export function writeEditorDataValueCmd(
  editor: DesignerEditor,
  args: WriteEditorDataValueCmdArgs
): DesignerEditorCmd {
  const cmdArgs: any = {
    ...args,
    isArray: !isNullOrUnDef(args.subIndex),
    isObj: !isNullOrUnDef(args.subKey)
  }
  const targetValue = readEditorDataValue(editor, cmdArgs.key)
  if (cmdArgs.isArray) {
    cmdArgs.oldValue = targetValue?.[cmdArgs.subIndex]
  } else if (cmdArgs.isObj) {
    cmdArgs.oldValue = targetValue?.[cmdArgs.subKey]
  } else {
    cmdArgs.oldValue = targetValue
  }
  return {
    cmd: 'writeEditorDataValueCmd',
    execute: () => {
      let updateVal = readEditorDataValue(editor, cmdArgs.key)
      if (cmdArgs.isArray) {
        updateVal[cmdArgs.subIndex] = cmdArgs.value
      } else if (cmdArgs.isObj) {
        updateVal[cmdArgs.subKey] = cmdArgs.value
      } else {
        updateVal = cmdArgs.value
      }
      writeEditorDataValue(editor, cmdArgs.key, updateVal)
      if (cmdArgs.key == 'widgetTree') {
        editor.getStore().setSelected()
      }
      return true
    },
    rollback: () => {
      let updateVal = readEditorDataValue(editor, cmdArgs.key)
      if (cmdArgs.isArray) {
        updateVal[cmdArgs.subIndex] = cmdArgs.oldValue
      } else if (cmdArgs.isObj) {
        updateVal[cmdArgs.subKey] = cmdArgs.oldValue
      } else {
        updateVal = cmdArgs.oldValue
      }
      writeEditorDataValue(editor, cmdArgs.key, updateVal)
      if (cmdArgs.key == 'widgetTree') {
        editor.getStore().setSelected()
      }
      return true
    }
  }
}
/** 组件定义更新指令 */
interface WriteWidgetValueCmdArgs {
  widget?: WidgetInstance
  key: keyof WidgetInstance
  value?: any
}
export function writeWidgetValueCmd(
  editor: DesignerEditor,
  args: WriteWidgetValueCmdArgs
): DesignerEditorCmd {
  const cmdArgs = {
    ...args,
    oldValue: readWidgetValue(args.widget, args.key)
  }
  return {
    cmd: 'writeWidgetValueCmd',
    execute: () => {
      writeWidgetValueById(editor, cmdArgs.widget?._vid, cmdArgs.key, cmdArgs.value)
      return true
    },
    rollback: () => {
      writeWidgetValueById(editor, cmdArgs.widget?._vid, cmdArgs.key, cmdArgs.oldValue)
      return true
    }
  }
}

/** 组件定义批量更新指令 */
interface WriteWidgetValuesCmdArgs {
  widget?: WidgetInstance
  values?: {
    [key in keyof WidgetInstance]?: any
  }
}
export function writeWidgetValuesCmd(
  editor: DesignerEditor,
  args: WriteWidgetValuesCmdArgs
): DesignerEditorCmd {
  return batchCmd([
    ...Object.entries(args.values ?? {}).map(([key, value]) => {
      return writeWidgetValueCmd(editor, {
        widget: args.widget,
        key: key as keyof WidgetInstance,
        value: value
      })
    })
  ])
}

/** 组件定义绑定更新指令 */
interface WriteWidgetValueBindCmdArgs {
  widget?: WidgetInstance
  key: string
  value?: WidgetPropDefineBind
}
export function writeWidgetValueBindCmd(
  editor: DesignerEditor,
  args: WriteWidgetValueBindCmdArgs
): DesignerEditorCmd {
  const cmdArgs = {
    ...args,
    oldValue: readWidgetValueBind(args.widget, args.key)
  }
  return {
    cmd: 'writeWidgetValueBindCmd',
    execute: () => {
      writeWidgetValueBindById(editor, cmdArgs.widget?._vid, cmdArgs.key, cmdArgs.value)
      return true
    },
    rollback: () => {
      writeWidgetValueBindById(editor, cmdArgs.widget?._vid, cmdArgs.key, cmdArgs.oldValue)
      return true
    }
  }
}

/** 组件属性更新指令 */
interface WritePropValueCmdArgs {
  widget?: WidgetInstance
  key: string
  value?: any
}
export function writePropValueCmd(
  editor: DesignerEditor,
  args: WritePropValueCmdArgs
): DesignerEditorCmd {
  const cmdArgs = {
    ...args,
    oldValue: readPropValue(args.widget, args.key)
  }
  return {
    cmd: 'writePropValueCmd',
    execute: () => {
      writePropValueById(editor, cmdArgs.widget?._vid, cmdArgs.key, cmdArgs.value)
      return true
    },
    rollback: () => {
      writePropValueById(editor, cmdArgs.widget?._vid, cmdArgs.key, cmdArgs.oldValue)
      return true
    }
  }
}
/** 组件属性更新指令 */
interface WritePropValuesCmdArgs {
  widget?: WidgetInstance
  values?: {
    [key in string]?: any
  }
}
export function writePropValuesCmd(
  editor: DesignerEditor,
  args: WritePropValuesCmdArgs
): DesignerEditorCmd {
  return batchCmd([
    ...Object.entries(args.values ?? {}).map(([key, value]) => {
      return writePropValueCmd(editor, {
        widget: args.widget,
        key: key,
        value: value
      })
    })
  ])
}
/** 添加组件指令 */
export interface AddWidgetCmdArgs {
  widget: WidgetInstance
  toSlotId?: string
  toIndex?: number
}
export function addWidgetCmd(editor: DesignerEditor, args: AddWidgetCmdArgs): DesignerEditorCmd {
  const cmdArgs = { ...args }
  return {
    cmd: 'addWidgetCmd',
    execute: () => {
      const widgetList = useSlotChildrenOrTree(editor, cmdArgs.toSlotId)
      const addIndex = cmdArgs.toIndex ?? widgetList?.length
      cmdArgs.toIndex = addIndex
      return addWidgetAtIndex(widgetList, cmdArgs.widget, addIndex)
    },
    rollback: () => {
      return delWidgetAtIndex(useSlotChildrenOrTree(editor, cmdArgs.toSlotId), cmdArgs.toIndex)
    }
  }
}
/** 组件删除指令 */
interface DeleteWidgetCmdArgs {
  widget: WidgetInstance
  fromSlotId?: string
}
export function deleteWidgetCmd(
  editor: DesignerEditor,
  args: DeleteWidgetCmdArgs
): DesignerEditorCmd {
  const cmdArgs = {
    ...args,
    atIndex: indexOfWidgetById(useSlotChildrenOrTree(editor, args.fromSlotId), args.widget._vid)
  }
  return {
    cmd: 'deleteWidgetCmd',
    execute: () => {
      const widgetList = useSlotChildrenOrTree(editor, cmdArgs.fromSlotId)
      const result = delWidgetById(widgetList, cmdArgs.widget._vid)
      if (result) {
        editor.getStore().setSelected()
      }
      return result
    },
    rollback: () => {
      const widgetList = useSlotChildrenOrTree(editor, cmdArgs.fromSlotId)
      const result = addWidgetAtIndex(widgetList, cmdArgs.widget, cmdArgs.atIndex)
      if (result) {
        editor.getStore().setSelected()
      }
      return result
    }
  }
}
/** 组件复制指令 */
interface CopyWidgetCmdArgs {
  originalWidget: WidgetInstance
  toSlotId?: string
}
export function copyWidgetCmd(editor: DesignerEditor, args: CopyWidgetCmdArgs): DesignerEditorCmd {
  const cmdArgs = { ...args, targetWidget: cloneWidget(args.originalWidget) }
  return {
    cmd: 'copyWidgetCmd',
    execute: () => {
      const widgetList = useSlotChildrenOrTree(editor, cmdArgs.toSlotId)
      return addWidgetAtIndex(widgetList, cmdArgs.targetWidget, widgetList?.length)
    },
    rollback: () => {
      const widgetList = useSlotChildrenOrTree(editor, cmdArgs.toSlotId)
      return delWidgetById(widgetList, cmdArgs.targetWidget._vid)
    }
  }
}
/** 组件移动指令 */
interface MoveWidgetCmdArgs {
  widget: WidgetInstance
  fromSlotId?: string
  fromIndex: number
  toSlotId?: string
  toIndex: number
}
export function moveWidgetCmd(editor: DesignerEditor, args: MoveWidgetCmdArgs): DesignerEditorCmd {
  const cmdArgs: MoveWidgetCmdArgs = { ...args }
  return {
    cmd: 'moveWidgetCmd',
    execute: () => {
      if (cmdArgs.fromSlotId == cmdArgs.toSlotId && cmdArgs.fromIndex == cmdArgs.toIndex) {
        return false
      }
      const toWidgetList = useSlotChildrenOrTree(editor, cmdArgs.toSlotId)
      if (!isNullOrUnDef(toWidgetList)) {
        const fromWidgetList = useSlotChildrenOrTree(editor, cmdArgs.fromSlotId)
        if (!delWidgetById(fromWidgetList, cmdArgs.widget._vid)) {
          return false
        }
        return addWidgetAtIndex(toWidgetList, cmdArgs.widget, cmdArgs.toIndex)
      }
      return false
    },
    rollback: () => {
      if (cmdArgs.fromSlotId == cmdArgs.toSlotId && cmdArgs.fromIndex == cmdArgs.toIndex) {
        return false
      }
      const fromWidgetList = useSlotChildrenOrTree(editor, cmdArgs.fromSlotId)
      if (!isNullOrUnDef(fromWidgetList)) {
        const toWidgetList = useSlotChildrenOrTree(editor, cmdArgs.toSlotId)
        if (!delWidgetById(toWidgetList, cmdArgs.widget._vid)) {
          return false
        }
        return addWidgetAtIndex(fromWidgetList, cmdArgs.widget, cmdArgs.fromIndex)
      }
      return false
    }
  }
}
/** 组件属性更新绑定指令 */
interface WritePropBindCmdArgs {
  widget?: WidgetInstance
  key: string
  value?: WidgetPropDefineBind
}
export const writePropBindCmd = (
  editor: DesignerEditor,
  args: WritePropBindCmdArgs
): DesignerEditorCmd => {
  const cmdArgs = {
    ...args,
    oldValue: readPropBind(args.widget, args.key)
  }
  return {
    cmd: 'writePropBindCmd',
    execute: () => {
      writePropBindById(editor, cmdArgs.widget?._vid, cmdArgs.key, cmdArgs.value)
      return true
    },
    rollback: () => {
      writePropBindById(editor, cmdArgs.widget?._vid, cmdArgs.key, cmdArgs.oldValue)
      return true
    }
  }
}
/** 组件事件绑定指令 */
interface WriteWidgetEventBindCmdArgs {
  widget?: WidgetInstance
  key: string
  value?: DesignerEditorEventBind
}
export const writeWidgetEventBindCmd = (
  editor: DesignerEditor,
  args: WriteWidgetEventBindCmdArgs
): DesignerEditorCmd => {
  const cmdArgs = {
    ...args,
    oldValue: readWidgetEventBind(args.widget, args.key)
  }
  return {
    cmd: 'writePropBindCmd',
    execute: () => {
      writeWidgetEventBindById(editor, cmdArgs.widget?._vid, cmdArgs.key, cmdArgs.value)
      return true
    },
    rollback: () => {
      writeWidgetEventBindById(editor, cmdArgs.widget?._vid, cmdArgs.key, cmdArgs.oldValue)
      return true
    }
  }
}
/** EditorData更新指令 */
interface UpdateEditorDataCmdArgs {
  value: DesignerEditorData
}
export function updateEditorDataCmd(
  editor: DesignerEditor,
  args: UpdateEditorDataCmdArgs
): DesignerEditorCmd {
  const cmdArgs: any = { ...args, oldValue: editor.getStore().state.value.editorData }
  return {
    cmd: 'updateEditorDataCmd',
    execute: () => {
      editor.getStore().setState('editorData', cmdArgs.value)
      editor.getStore().refreshEditor()
      return true
    },
    rollback: () => {
      editor.getStore().setState('editorData', cmdArgs.oldValue)
      editor.getStore().refreshEditor()
      return true
    }
  }
}
