import { isNullOrUnDef, isEmpty } from '@/utils/is'
import { readValueByJsonPath } from '../../../../common/utils'
import {
  DesignerEditor,
  GetDataArgs,
  GetDataResult,
  WidgetDataDefine,
  WidgetPropDefineBindBase
} from '../../../designer-editor.type'
import {
  requestDataDefine,
  executeBindRefFunction,
  executeValueFunction,
  useDataDefine,
  alwaysWaitFor
} from '../../../designer-editor.utils'
import { useDataDefineExecutor } from './dataExecutor'

export interface GetDataExecutor {
  getResult(): GetDataResult | undefined
  getData(args?: GetDataArgs): Promise<any | undefined>
}

export class UndefinedGetDataExecutor implements GetDataExecutor {
  getResult(): GetDataResult | undefined {
    return { status: 'fail', failError: '未定义的数据执行器' }
  }

  getData(): Promise<any | undefined> {
    return Promise.resolve(undefined)
  }
}

export class DefGetDataExecutor implements GetDataExecutor {
  private readonly editor: DesignerEditor

  private readonly dataDefine: WidgetDataDefine

  constructor(editor: DesignerEditor, dataDefine: WidgetDataDefine) {
    this.editor = editor
    this.dataDefine = dataDefine
  }

  getData(): Promise<any | undefined> {
    if (!isNullOrUnDef(this.dataDefine.jsonData) && !isEmpty(this.dataDefine.jsonData)) {
      return Promise.resolve(JSON.parse(this.dataDefine.jsonData))
    } else {
      return Promise.resolve(undefined)
    }
  }

  getResult(): GetDataResult | undefined {
    return this.editor.getStore().state.value.executorResult[this.dataDefine._vid]
  }
}

export class RemoteGetDataExecutor implements GetDataExecutor {
  private readonly editor: DesignerEditor

  private readonly dataDefine: WidgetDataDefine

  constructor(editor: DesignerEditor, dataDefine: WidgetDataDefine) {
    this.editor = editor
    this.dataDefine = dataDefine
  }

  async getData(args?: GetDataArgs): Promise<any | undefined> {
    const resp = await requestDataDefine(this.editor, this.dataDefine, args)
    return readValueByJsonPath(resp, this.dataDefine.jsonDataPath)
  }

  getResult(): GetDataResult | undefined {
    return this.editor.getStore().state.value.executorResult[this.dataDefine._vid]
  }
}

export class RefGetDataExecutor implements GetDataExecutor {
  private readonly editor: DesignerEditor

  private readonly dataDefine: WidgetDataDefine

  getRefBindExecuteResult(refBind: WidgetPropDefineBindBase): GetDataResult | undefined {
    return this.editor.getStore().state.value.executorResult[refBind.bind?.refDataId ?? '']
  }

  constructor(editor: DesignerEditor, dataDefine: WidgetDataDefine) {
    this.editor = editor
    this.dataDefine = dataDefine
    const bindList = this.dataDefine.refBind.bindList
    if (bindList?.find((e) => isNullOrUnDef(this.getRefBindExecuteResult(e)))) {
      this.editor.getStore().addTask({
        id: this.dataDefine,
        execute: async () => {
          await this.getData()
        }
      })
    }
  }

  executeDataDefineFunction(refArgs?: any[]): any {
    const refFunction = this.dataDefine.refBind.refFunction
    let refFunctionResult: any = executeBindRefFunction(refFunction, refArgs)
    if (!isEmpty(this.dataDefine.runtimeFunction)) {
      refFunctionResult = executeValueFunction(this.dataDefine.runtimeFunction, refFunctionResult)
    }
    return refFunctionResult
  }

  getRefBindBindListArgs(): GetDataResult {
    const bindListArgs: any[] = []
    for (const refBindItem of this.dataDefine.refBind.bindList ?? []) {
      let refBindItemResult = this.getRefBindExecuteResult(refBindItem)
      if (isNullOrUnDef(refBindItemResult)) {
        const dataDefine = useDataDefine(
          this.editor,
          { _vid: refBindItem.bind?.refWidgetId },
          { _vid: refBindItem.bind?.refDataId }
        )
        if (!isNullOrUnDef(dataDefine)) {
          const { result } = useDataDefineExecutor(this.editor, { dataDefine })
          refBindItemResult = result.value
        }
      }
      if (refBindItemResult?.status == 'fail') {
        return { status: 'fail', failError: refBindItemResult.failError }
      }
      if (refBindItemResult?.status == 'executing') {
        return { status: 'executing' }
      }
      bindListArgs.push(readValueByJsonPath(refBindItemResult?.data, refBindItem.refPropKey))
    }
    return { status: 'success', data: bindListArgs }
  }

  getResult(): GetDataResult | undefined {
    try {
      const refBindArgsResult = this.getRefBindBindListArgs()
      if (refBindArgsResult.status != 'success') {
        return refBindArgsResult
      }
      const bindListArgs = refBindArgsResult.data
      return { status: 'success', data: this.executeDataDefineFunction(bindListArgs) }
    } catch (e) {
      console.error('dataDefine getResult error', e)
      return { status: 'fail', failError: e }
    }
  }

  async getRefBindBindListArgsAsync(): Promise<any[]> {
    const bindListArgs: any[] = []
    for (const refBindItem of this.dataDefine.refBind.bindList ?? []) {
      let refBindItemResult = await alwaysWaitFor(
        (r) => !isNullOrUnDef(r) && r.status != 'executing',
        async () => this.getRefBindExecuteResult(refBindItem)
      )
      if (refBindItemResult?.status == 'executing' || isNullOrUnDef(refBindItemResult)) {
        const refBindItemDataDefine = useDataDefine(
          this.editor,
          { _vid: refBindItem.bind?.refWidgetId },
          { _vid: refBindItem.bind?.refDataId }
        )
        if (!isNullOrUnDef(refBindItemDataDefine)) {
          const { value, isNotExecuted, getData } = useDataDefineExecutor(this.editor, {
            dataDefine: refBindItemDataDefine
          })
          const data: any = isNotExecuted.value ? await getData() : value.value
          refBindItemResult = { status: 'success', data }
        }
      }
      bindListArgs.push(readValueByJsonPath(refBindItemResult?.data, refBindItem.refPropKey))
    }
    return bindListArgs
  }

  async getData(): Promise<any | undefined> {
    try {
      const bindListArgs = await this.getRefBindBindListArgsAsync()
      return this.executeDataDefineFunction(bindListArgs)
    } catch (e) {
      console.error('dataDefine getResult error', e)
      throw e
    }
  }
}

export class ConstGetDataExecutor implements GetDataExecutor {
  private readonly editor: DesignerEditor

  private readonly dataDefine: WidgetDataDefine

  constructor(editor: DesignerEditor, dataDefine: WidgetDataDefine) {
    this.editor = editor
    this.dataDefine = dataDefine
  }

  async getData(): Promise<any | undefined> {
    const result = await alwaysWaitFor(
      (val) => !isNullOrUnDef(val),
      async () => this.getResult()
    )
    if (!!isNullOrUnDef(result)) {
      console.error('CONST 数据加载失败，请在 onBeforeMount 或 setup 中设置数据', this.dataDefine)
      return Promise.reject('CONST 数据加载失败，未读取到const数据结果')
    }
    return Promise.resolve(result?.data)
  }

  getResult(): GetDataResult | undefined {
    return this.editor.getStore().state.value.executorResult[this.dataDefine._vid]
  }
}

export class SubmitGetDataExecutor implements GetDataExecutor {
  private readonly editor: DesignerEditor

  private readonly dataDefine: WidgetDataDefine

  constructor(editor: DesignerEditor, dataDefine: WidgetDataDefine) {
    this.editor = editor
    this.dataDefine = dataDefine
  }

  async getData(args?: GetDataArgs): Promise<any | undefined> {
    const resp = await requestDataDefine(this.editor, this.dataDefine, args)
    return readValueByJsonPath(resp, this.dataDefine.jsonDataPath)
  }

  getResult(): GetDataResult | undefined {
    return this.editor.getStore().state.value.executorResult[this.dataDefine._vid]
  }
}
