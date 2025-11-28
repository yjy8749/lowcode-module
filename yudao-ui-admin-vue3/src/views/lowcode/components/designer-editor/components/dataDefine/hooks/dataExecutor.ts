import { ref } from 'vue'
import { isNullOrUnDef, isEmpty } from '@/utils/is'
import {
  DesignerEditor,
  DesignerEditorEvalFunction,
  GetDataArgs,
  GetDataResult,
  WidgetDataDefine
} from '../../../designer-editor.type'
import {
  ConstGetDataExecutor,
  DefGetDataExecutor,
  GetDataExecutor,
  RefGetDataExecutor,
  RemoteGetDataExecutor,
  SubmitGetDataExecutor,
  UndefinedGetDataExecutor
} from './DataDefineExecutor'
import { buildEvalFnContext, executeEvalFunction } from '../../../designer-editor.utils'

interface UseDataDefineExecutorArgs {
  dataDefine?: WidgetDataDefine
  immediate?: boolean
}

export function useDataDefineExecutor(editor: DesignerEditor, args?: UseDataDefineExecutorArgs) {
  const getExecutor = (dataDefine?: WidgetDataDefine): GetDataExecutor => {
    if (dataDefine?._type == 'def') {
      return new DefGetDataExecutor(editor, dataDefine)
    } else if (dataDefine?._type == 'remote') {
      return new RemoteGetDataExecutor(editor, dataDefine)
    } else if (dataDefine?._type == 'ref') {
      return new RefGetDataExecutor(editor, dataDefine)
    } else if (dataDefine?._type == 'const') {
      return new ConstGetDataExecutor(editor, dataDefine)
    } else if (dataDefine?._type == 'submit') {
      return new SubmitGetDataExecutor(editor, dataDefine)
    } else {
      return new UndefinedGetDataExecutor()
    }
  }

  const store = editor.getStore()
  const dataDefine = ref<WidgetDataDefine | undefined>(args?.dataDefine)
  const dataDefineExecutor = ref<GetDataExecutor>(getExecutor(dataDefine.value))

  const executeCallback = (val?: GetDataResult) => {
    let callbackFn: DesignerEditorEvalFunction | undefined = undefined
    if (val?.status == 'success') {
      callbackFn = dataDefine.value?.onSuccess
    } else if (val?.status == 'fail') {
      callbackFn = dataDefine.value?.onError
    }
    if (!isEmpty(callbackFn?.evalFunction)) {
      nextTick(async () => {
        const evalFnContext = buildEvalFnContext(editor, dataDefine.value!.widgetId)
        const result = await executeEvalFunction(editor, callbackFn, evalFnContext, val?.data)
        console.log(`executeCallback dataDefine`, dataDefine.value, 'result', result, 'val', val)
      })
    }
  }

  const result = computed({
    get: () => {
      return dataDefineExecutor.value?.getResult()
    },
    set: (val) => {
      store.putExecutorResult(dataDefine.value, val)
      executeCallback(val)
    }
  })

  const value = computed({
    get: () => result.value?.data,
    set: (data) => {
      result.value = { status: 'success', data }
    }
  })

  const isExecuting = computed(() => result.value?.status === 'executing')
  const isSuccess = computed(() => result.value?.status === 'success')
  const isFail = computed(() => result.value?.status === 'fail')
  const failError = computed(() => result.value?.failError)
  const isExecuted = computed(() => !isNullOrUnDef(result.value))
  const isNotExecuted = computed(() => isNullOrUnDef(result.value))

  const getData = async (args?: GetDataArgs): Promise<any | undefined> => {
    try {
      result.value = { status: 'executing' }
      const data = await dataDefineExecutor.value.getData({ ignoreLoading: true, ...args })
      result.value = { status: 'success', data }
      return value.value
    } catch (e) {
      console.error(e)
      result.value = { status: 'fail', failError: e }
      throw e
    }
  }

  const updateExecutor = (args: UseDataDefineExecutorArgs) => {
    dataDefine.value = args.dataDefine
    dataDefineExecutor.value = getExecutor(dataDefine.value)
    return {
      dataDefine,
      dataDefineExecutor,
      value,
      result,
      isExecuting,
      isSuccess,
      isFail,
      failError,
      isExecuted,
      isNotExecuted,
      getData,
      updateExecutor
    }
  }

  if (args?.immediate && !isNullOrUnDef(dataDefine.value) && isNotExecuted.value) {
    store.addTask({
      id: dataDefine.value,
      async execute() {
        getData()
      }
    })
  }

  return {
    dataDefine,
    dataDefineExecutor,
    value,
    result,
    isExecuting,
    isSuccess,
    isFail,
    failError,
    isExecuted,
    isNotExecuted,
    getData,
    updateExecutor
  }
}
