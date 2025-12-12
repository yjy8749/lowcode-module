<!-- index.render.vue -->
<template>
  <ElFormItemWrapper v-bind="formItemAttrs">
    <el-checkbox-group :max="formInputAttrs.max" v-model="valueModel">
      <template v-if="loading">
        <Icon icon="ep:loading" class="animate-spin animate-duration-3000" />
      </template>
      <template v-else-if="isEmpty(checkboxOptions)">
        <div class="text-12px c-[--el-color-danger]">未配置选项</div>
      </template>
      <template v-else-if="formInputAttrs.type == 'button'">
        <el-checkbox-button
          v-for="opt in checkboxOptions"
          :key="opt.label"
          :value="opt.value"
          :disabled="opt.disabled"
          @click.stop.prevent="() => onOptionClick(opt)"
        >
          <div class="flex items-center gap-1">
            <Icon v-if="opt.icon" :icon="opt.icon" />
            <span v-if="!formInputAttrs.onlyIcon">{{ opt.label }}</span>
          </div>
        </el-checkbox-button>
      </template>
      <template v-else>
        <el-checkbox
          v-for="opt in checkboxOptions"
          :key="opt.label"
          :value="opt.value"
          :disabled="opt.disabled"
          @click.stop.prevent="() => onOptionClick(opt)"
        >
          <div class="flex items-center gap-1">
            <Icon v-if="opt.icon" :icon="opt.icon" />
            <span v-if="!formInputAttrs.onlyIcon">{{ opt.label }}</span>
          </div>
        </el-checkbox>
      </template>
    </el-checkbox-group>
  </ElFormItemWrapper>
</template>
<script lang="ts" setup>
import ElFormItemWrapper from '../../../../common/ElFormItemWrapper.vue'
import { useWidget, type WidgetRenderProps } from '../../hooks'
import { useFormItemWidget } from '../../hooks/useFormItemWidget'
import { useScopeLoading } from '../../../../common/hooks'
import { isNullOrUnDef, isEmpty, isDef } from '@/utils/is'
import { getStrDictOptions } from '@/utils/dict'

const props = defineProps<WidgetRenderProps>()

const { loading, callWithLoading } = useScopeLoading()

const { formItemAttrs, valueModel, useFormInputAttrs, toEvalFunction } = useFormItemWidget(
  useWidget(props)
)

const formInputAttrs = computed(() => {
  const attrs = useFormInputAttrs()
  return {
    ...attrs,
    remoteMethod: toEvalFunction(attrs.remoteMethod)
  }
})

const checkboxOptions = ref<any[]>([])

const checkboxDictLoad = async () => {
  const dictType = formInputAttrs.value.dictType
  if (!isNullOrUnDef(dictType)) {
    checkboxOptions.value = getStrDictOptions(dictType)
  }
}

const checkboxRemoteLoad = async () => {
  await callWithLoading(async () => {
    if (formInputAttrs.value.remoteMethod) {
      checkboxOptions.value = await formInputAttrs.value.remoteMethod()
    }
  })
}

const onOptionClick = (item: any) => {
  if (!item.disabled) {
    if (valueModel.value?.some((e) => e == item.value)) {
      if (isDef(formInputAttrs.value.min) && valueModel.value?.length <= formInputAttrs.value.min) {
        return
      }
      valueModel.value = valueModel.value.filter((e) => e != item.value)
    } else {
      if (isDef(formInputAttrs.value.max) && valueModel.value?.length >= formInputAttrs.value.max) {
        return
      }
      valueModel.value = [...(valueModel.value ?? []), item.value]
    }
  }
}

onMounted(async () => {
  if (formInputAttrs.value.remote) {
    await checkboxRemoteLoad()
  } else {
    await checkboxDictLoad()
  }
})
</script>
