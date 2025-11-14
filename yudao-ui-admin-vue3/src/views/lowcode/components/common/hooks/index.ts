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
