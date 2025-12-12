<!-- index.render.vue -->
<template>
  <ElFormItemWrapper v-bind="formItemAttrs">
    <el-radio-group v-model="valueModel">
      <template v-if="loading">
        <Icon icon="ep:loading" class="animate-spin animate-duration-3000" />
      </template>
      <template v-else-if="isEmpty(radioOptions)">
        <div class="text-12px c-[--el-color-danger]">未配置选项</div>
      </template>
      <template v-else-if="formInputAttrs.type == 'button'">
        <el-radio-button
          v-for="opt in radioOptions"
          :key="opt.label"
          :value="opt.value"
          :disabled="opt.disabled"
          @click.stop.prevent="() => onOptionClick(opt)"
        >
          <div class="flex items-center gap-1">
            <Icon v-if="opt.icon" :icon="opt.icon" />
            <span v-if="!formInputAttrs.onlyIcon">{{ opt.label }}</span>
          </div>
        </el-radio-button>
      </template>
      <template v-else>
        <el-radio
          v-for="opt in radioOptions"
          :key="opt.label"
          :value="opt.value"
          :disabled="opt.disabled"
          @click.stop.prevent="() => onOptionClick(opt)"
        >
          <div class="flex items-center gap-1">
            <Icon v-if="opt.icon" :icon="opt.icon" />
            <span v-if="!formInputAttrs.onlyIcon">{{ opt.label }}</span>
          </div>
        </el-radio>
      </template>
    </el-radio-group>
  </ElFormItemWrapper>
</template>
<script lang="ts" setup>
import ElFormItemWrapper from '../../../../common/ElFormItemWrapper.vue'
import { useWidget, type WidgetRenderProps } from '../../hooks'
import { useFormItemWidget } from '../../hooks/useFormItemWidget'
import { useScopeLoading } from '../../../../common/hooks'
import { isNullOrUnDef, isEmpty } from '@/utils/is'
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

const radioOptions = ref<any[]>([])

const radioDictLoad = async () => {
  const dictType = formInputAttrs.value.dictType
  if (!isNullOrUnDef(dictType)) {
    radioOptions.value = getStrDictOptions(dictType)
  }
}

const radioRemoteLoad = async () => {
  await callWithLoading(async () => {
    if (formInputAttrs.value.remoteMethod) {
      radioOptions.value = await formInputAttrs.value.remoteMethod()
    }
  })
}

const onOptionClick = (item: any) => {
  if (!item.disabled) {
    if (valueModel.value == item.value) {
      if (formInputAttrs.value.cancelable) {
        valueModel.value = undefined
      }
    } else {
      valueModel.value = item.value
    }
  }
}

onMounted(async () => {
  if (formInputAttrs.value.remote) {
    await radioRemoteLoad()
  } else {
    await radioDictLoad()
  }
})
</script>
