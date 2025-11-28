import { isArray, isNullOrUnDef, isEmpty } from '@/utils/is'
import {
  DesignerEditorEventBind,
  SeekWidgetFunction,
  WIDGET_VIF_PERMIS_KEY,
  WIDGET_VIF_FUNCTION_KEY,
  WidgetInstance,
  WidgetPropDefine,
  WidgetPropRenderContext,
  WidgetRenderProps as WidgetRenderPropsType,
  ActionButtonConfig,
  SLOT_DEFAULT_KEY,
  DesignerEditorEvalFunction
} from '../../designer-editor.type'
import {
  buildEvalFnContext,
  executeEvalFunction,
  isCSSPropKey,
  seekWidgetExposeContext,
  useSeekDataFunction,
  wrapEvalFunction
} from '../../designer-editor.utils'
import { isString } from 'min-dash'
import { inputNumberDefine } from '../../designer-editor.props'
import { checkPermi } from '@/utils/permission'
import { computedAsync } from '@vueuse/core'
import { getForItemDataId } from '../codeWidgetDefines/vforDefine/utils'
import { ActionButtonProps } from '../../../common/ActionButton.vue'
import { isPromise } from '../../../common/utils'

export type WidgetRenderProps = WidgetRenderPropsType

export type EventBindType = DesignerEditorEventBind & { key: string }

export function isDirectParent(
  { widgetRenderContext }: WidgetPropRenderContext,
  _moduleName: string
): boolean {
  return !isNullOrUnDef(
    widgetRenderContext.seekParent?.({ _moduleName, directParent: true }).seekWidget
  )
}
function _inputNumberDefine(key: string, label: string) {
  return inputNumberDefine({ key, label }, { min: 0, step: 1, precision: 0 })
}

export const ElColPropDefines: WidgetPropDefine[] = [
  _inputNumberDefine('span', '栅格占据的列数'),
  _inputNumberDefine('offset', '左侧间隔格数'),
  _inputNumberDefine('push', '向右移动格数'),
  _inputNumberDefine('pull', '向左移动格数'),
  _inputNumberDefine('xs', '<768px 响应式栅格数'),
  _inputNumberDefine('sm', '≥768px 响应式栅格数'),
  _inputNumberDefine('md', '≥992px 响应式栅格数'),
  _inputNumberDefine('lg', '≥1200px 响应式栅格数'),
  _inputNumberDefine('xl', '≥1920px 响应式栅格数')
]

export function useElColPropAttrs(widget: WidgetInstance) {
  return Object.fromEntries(
    ElColPropDefines.map((e) => [e.key, widget.props[e.key]]).filter(
      (_, val) => !isNullOrUnDef(val)
    )
  )
}

export function useWidget(props: WidgetRenderProps) {
  const widgetBinds = computed(() => props.widget._binds ?? {})
  const widgetProps = computed(() => props.widget.props)
  const widgetPropsBind = computed(() => props.widget.propsBind ?? {})
  const widgetEventBinds = computed(() => {
    return Object.entries(props.widget.eventsBind ?? {})
      .filter(([key, val]) => !isEmpty(key) && !isNullOrUnDef(val))
      .map(([key, val]) => ({ ...val, key: key }) as EventBindType)
  })
  const store = props.editor.getStore()
  const getEmitter = () => props.editor.getEmitter()

  const seekData = useSeekDataFunction(props.editor, props.widgetRenderContext)
  const seekPropValue = (key: string): any | undefined => {
    return seekData(widgetPropsBind.value?.[key], widgetProps.value?.[key])
  }
  const usePropValue = (key: string) => seekPropValue(key)
  const usePropObject = (...keys: string[]): any => {
    return Object.fromEntries(keys.map((key) => [key, usePropValue(key)]))
  }
  const seekInstanceValue = (key: string): any | undefined => {
    return seekData(widgetBinds.value?.[key], props.widget[key])
  }
  const useInstanceValue = (key: string) => seekInstanceValue(key)
  const useEventBind = (key: string) => {
    return widgetEventBinds.value.find((e) => e.eventType == 'widget' && e.key == key)
  }
  const toEvalFunction = (val?: DesignerEditorEvalFunction) => {
    if (!isEmpty(val?.evalFunction)) {
      return wrapEvalFunction(props.editor, val, evalFnContext)
    }
  }

  const useVForItemRefData = () => {
    const vforWidget = useParent({ _moduleName: 'codeWidgetDefines', _key: 'vforDefine' })
    if (!isNullOrUnDef(vforWidget)) {
      return seekData({
        bindList: [
          {
            bind: {
              refDataId: getForItemDataId(vforWidget),
              refWidgetId: vforWidget._vid
            },
            refPropKey: '#'
          }
        ]
      })
    }
  }

  const { isPreviewMode } = store

  const evalFnContext = buildEvalFnContext(props.editor, props.widget._vid)

  const usePropAndEvent = (args?: { only?: string[]; omit?: string[] }) => {
    const results: any = {}
    ;[...Object.keys(widgetProps.value), ...Object.keys(widgetPropsBind.value)]
      .filter(
        (key) =>
          !isCSSPropKey(key) &&
          (!args?.only || args?.only?.includes(key)) &&
          (!args?.omit || !args?.omit?.includes(key))
      )
      .forEach((key) => {
        results[key] = seekPropValue(key)
      })
    //组件事件
    widgetEventBinds.value
      .filter(
        (bind) =>
          bind.eventType == 'widget' &&
          (!args?.only || args?.only?.includes(bind.key)) &&
          (!args?.omit || !args?.omit?.includes(bind.key))
      )
      .forEach((bind) => {
        const key = `on${bind.key.charAt(0).toUpperCase()}${bind.key.slice(1)}`
        results[key] = toEvalFunction(bind)
      })
    return results
  }

  const exposeContext = (ctx?: Record<string, any>) => {
    store.putWidgetExposeContext(props.widget._vid, ctx)
  }

  const useExposeContext = (key?: any) => {
    return seekWidgetExposeContext(props.editor, key ?? props.widget._vid)
  }

  const useParent = (args: Parameters<SeekWidgetFunction>[0]) => {
    return props.widgetRenderContext.seekParent(args).seekWidget
  }

  const useDefaultSlot = (): WidgetInstance => {
    return useSlot(SLOT_DEFAULT_KEY)
  }

  const useSlot = (key: number | string): WidgetInstance => {
    const list = props.widget.slots
    let item = list[key]
    if (isString(key)) {
      item = list.find((i) => i.slotKey === key || i._var == key || i._vid == key)
    }
    if (isNullOrUnDef(item)) {
      throw new Error(`slot item ${key} not found`)
    }
    return item
  }

  const useSlotObject = (...keys: string[]): any => {
    return Object.fromEntries(
      props.widget.slots
        .filter((e) => e.slotKey && (isEmpty(keys) || keys.includes(e.slotKey)))
        .map((e) => [e.slotKey, e])
    )
  }

  /** 可执行函数isShow判断 */
  const useIsShowFunction = (obj?: { _vIfPermis?: any; _vIfFun?: any }) => {
    const _vIfPermisVal = obj?.[WIDGET_VIF_PERMIS_KEY]
    const _vIfFunVal = toEvalFunction(obj?.[WIDGET_VIF_FUNCTION_KEY])
    return async (...args) => {
      let _vIfPermisResult = true
      if (!isEmpty(_vIfPermisVal)) {
        _vIfPermisResult = checkPermi(isArray(_vIfPermisVal) ? _vIfPermisVal : [_vIfPermisVal])
      }
      let _vIfFunResult = true
      if (!isNullOrUnDef(_vIfFunVal)) {
        const result = _vIfFunVal?.(...args)
        _vIfFunResult = isPromise(result) ? await result : result
      }
      return _vIfPermisResult && _vIfFunResult
    }
  }

  const isShow = computedAsync(async () => {
    const isShowFn = useIsShowFunction({
      [WIDGET_VIF_PERMIS_KEY]: useInstanceValue(WIDGET_VIF_PERMIS_KEY),
      [WIDGET_VIF_FUNCTION_KEY]: useInstanceValue(WIDGET_VIF_FUNCTION_KEY)
    })
    return await isShowFn()
  }, true)

  // 组件生命周期
  const lifecycleEvent = (key: string) => {
    return widgetEventBinds.value.filter((e) => e.eventType == 'lifecycle' && e.key == key)
  }

  onBeforeMount(() => {
    executeEvalFunction(props.editor, lifecycleEvent('onBeforeMount'), evalFnContext)
  })

  onMounted(() => {
    executeEvalFunction(props.editor, lifecycleEvent('onMounted'), evalFnContext)
  })

  onBeforeUnmount(() => {
    executeEvalFunction(props.editor, lifecycleEvent('onBeforeUnmount'), evalFnContext)
  })

  onUnmounted(() => {
    executeEvalFunction(props.editor, lifecycleEvent('onUnmounted'), evalFnContext)
  })

  // 组件生命周期
  const customEvent = () => {
    return widgetEventBinds.value.filter((e) => e.eventType == 'custom')
  }

  // 自定义事件
  const customEventFunction = customEvent().map((bind) => {
    return { key: bind.key, callback: toEvalFunction(bind) }
  })

  customEventFunction.forEach((e) => {
    if (e.callback) {
      getEmitter().on(e.key, e.callback)
    }
  })

  onUnmounted(() => {
    customEventFunction.forEach((e) => {
      if (e.callback) {
        getEmitter().off(e.key, e.callback)
      }
    })
  })

  //生成ActionButton参数
  const toActionButtonProps = (item?: ActionButtonConfig[] | ActionButtonConfig): any => {
    if (!isNullOrUnDef(item)) {
      const list: ActionButtonConfig[] = []
      if (isArray(item)) {
        list.push(...item)
      } else {
        list.push(item)
      }
      const results = (list ?? []).map((i): ActionButtonProps => {
        return {
          type: i.type,
          label: i.label,
          icon: i.icon,
          size: i.size,
          plain: i.plain,
          link: i.link,
          onClick: toEvalFunction(i.onClick),
          isShow: useIsShowFunction(i)
        }
      })
      return isArray(item) ? results : results[0]
    }
    return undefined
  }

  //触发组件刷新
  const refresh = () => {
    nextTick(() => {
      store.setRefresh(props.widget)
    })
  }

  // 返回
  return {
    ...props,
    widgetProps,
    widgetPropsBind,
    store,
    isPreviewMode,
    evalFnContext,
    isShow,
    getEmitter,
    seekData,
    usePropValue,
    usePropObject,
    usePropAndEvent,
    exposeContext,
    useExposeContext,
    useParent,
    useSlot,
    useDefaultSlot,
    useSlotObject,
    useEventBind,
    toEvalFunction,
    useIsShowFunction,
    useVForItemRefData,
    toActionButtonProps,
    refresh
  }
}
