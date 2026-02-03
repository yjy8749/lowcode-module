import { useFormItem, ElLoading } from 'element-plus'
import { isFunction } from 'min-dash'
import { WritableComputedOptions, computed } from 'vue'

export function computedVModel<T, S = T>(options: WritableComputedOptions<T, S>) {
  const valueVModel = computed(options)
  const { formItem } = useFormItem()

  const triggerValidate = () => {
    formItem?.validate('change').catch((err) => {
      console.warn('表单验证错误:', err)
    })
  }

  const triggerUpdate = () => {
    valueVModel.value = valueVModel.value as any
  }

  const triggerChange = () => {
    triggerUpdate()
    triggerValidate
  }

  return {
    valueVModel,
    triggerUpdate,
    triggerValidate,
    triggerChange
  }
}

export function useScopeLoading() {
  const loadings = ref<Record<string, number>>({})
  const callWithLoading = async (
    key: string | (() => Promise<any>),
    fn?: (() => Promise<any>) | boolean | (() => boolean),
    ignore?: boolean | (() => boolean)
  ) => {
    if (isFunction(key)) {
      ignore = fn as boolean | (() => boolean)
      fn = key
      key = 'default'
    }
    if (ignore && isFunction(ignore)) {
      ignore = ignore()
    }
    if (ignore) {
      await (fn as () => Promise<any>)?.()
      return
    }
    if (loadings.value[key] === undefined) {
      loadings.value[key] = 0
    }
    loadings.value[key]++
    try {
      await (fn as () => Promise<any>)?.()
    } finally {
      loadings.value[key]--
      if (loadings.value[key] <= 0) {
        loadings.value[key] = 0
      }
    }
  }

  const isLoading = (key?: string) => loadings.value[key ?? 'default'] > 0

  const loading = computed(() => isLoading())

  return {
    loading,
    isLoading,
    callWithLoading
  }
}

export function useLoadingService() {
  const loadingCount = ref(0)
  const loadingInstance = ref<any | undefined>()
  const callWithLoading = async (
    fn?: (() => Promise<any>) | boolean | (() => boolean),
    text?: string
  ) => {
    try {
      if (loadingCount.value <= 0) {
        loadingInstance.value = ElLoading.service({ text: text ?? '处理中...' })
      }
      loadingCount.value++
      await (fn as () => Promise<any>)?.()
    } finally {
      loadingCount.value--
      if (loadingCount.value <= 0) {
        loadingCount.value = 0
        loadingInstance.value.close()
        loadingInstance.value = undefined
      }
    }
  }
  return {
    callWithLoading
  }
}
