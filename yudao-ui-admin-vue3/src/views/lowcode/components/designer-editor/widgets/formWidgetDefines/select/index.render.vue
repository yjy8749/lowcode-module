<!-- index.render.vue -->
<template>
  <ElFormItemWrapper v-bind="formItemAttrs">
    <el-select
      v-bind="formInputAttrs"
      :collapse-tags-tooltip="true"
      :remote-method="selectRemoteLoad"
      :loading="loading"
      v-model="valueModel"
    >
      <template v-if="prefixIcon" #prefix>
        <Icon :icon="prefixIcon" />
      </template>
      <template #loading>
        <Icon icon="ep:loading" class="animate-spin animate-duration-3000" />
      </template>
      <el-option
        v-for="opt in selectOptions"
        :key="opt.label"
        :label="opt.label"
        :value="opt.value"
        :disabled="opt.disabled"
      />
    </el-select>
  </ElFormItemWrapper>
</template>
<script lang="ts" setup>
import { isNullOrUnDef } from '@/utils/is'
import ElFormItemWrapper from '../../../../common/ElFormItemWrapper.vue'
import { useWidget, type WidgetRenderProps } from '../../hooks'
import { useFormItemWidget } from '../../hooks/useFormItemWidget'
import { getStrDictOptions } from '@/utils/dict'
import { useScopeLoading } from '../../../../common/hooks'

const props = defineProps<WidgetRenderProps>()

const { formItemAttrs, valueModel, useFormInputAttrs, usePropValue, toEvalFunction } =
  useFormItemWidget(useWidget(props))

const { loading, callWithLoading } = useScopeLoading()

const selectOptions = ref<any[]>([])

const formInputAttrs = computed(() =>
  useFormInputAttrs({ omit: ['prefixIcon', 'dictType', 'remoteMethod'] })
)

const prefixIcon = computed(() => usePropValue('prefixIcon'))

const remoteMethod = computed(() => toEvalFunction(usePropValue('remoteMethod')))
const selectDictLoad = () => {
  const dictType = usePropValue('dictType')
  if (!isNullOrUnDef(dictType)) {
    selectOptions.value = []
    selectOptions.value.push(...getStrDictOptions(dictType))
  }
}

const selectRemoteLoad = async (query?: string) => {
  await callWithLoading(async () => {
    selectOptions.value = []
    if (remoteMethod.value) {
      selectOptions.value.push(...(await remoteMethod.value(query)))
    }
  })
}

onMounted(async () => {
  if (formInputAttrs.value.remote) {
    if (!formInputAttrs.value.filterable) {
      selectRemoteLoad()
    }
  } else {
    selectDictLoad()
  }
})
</script>
<style scoped lang="scss"></style>
