import { useFormItem } from 'element-plus'
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
  const loading = ref(false)

  const callWithLoading = async (fn: () => Promise<any>) => {
    try {
      loading.value = true
      await fn()
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    callWithLoading
  }
}
