<template>
  <div v-if="!isPreviewMode" class="flex justify-center gap-2 p-2 bg-[--el-color-warning]">
    <el-text class="!c-#fff" v-for="item in dataResults" :key="item.id">
      {{ item.name }} : {{ item.value }}
    </el-text>
  </div>
</template>

<script setup lang="ts">
import { isNullOrUnDef } from '@/utils/is'
import { useWidget, type WidgetRenderProps } from '../../hooks'
import { useDataDefineExecutor } from '../../../components/dataDefine/hooks'
import { getPageParamsDataId, getParamsDataId, getQueryDataId } from './utils'

const props = defineProps<WidgetRenderProps>()

const { isPreviewMode, editor } = useWidget(props)

const { query, params } = useRoute()

const dataDefines = computed(() => props.widget.dataDefines)

const dataResults = ref<any[]>([
  { id: getPageParamsDataId(props.widget), data: { ...editor.getPageParams() } },
  { id: getParamsDataId(props.widget), data: { ...params } },
  { id: getQueryDataId(props.widget), data: { ...query } }
])

const setupDataResults = () => {
  dataResults.value.forEach((e) => {
    const dataDefine = dataDefines.value?.find((d) => d._vid == e.id)
    if (!isNullOrUnDef(dataDefine)) {
      const { value } = useDataDefineExecutor(editor, { dataDefine })
      if (isPreviewMode.value) {
        value.value = e.data
      } else {
        value.value = JSON.parse(dataDefine.jsonData ?? '{}')
      }
      e.name = dataDefine.name
      e.value = value
    }
  })
}

watch(
  () => editor.getPageParams(),
  () => {
    const dataDefine = dataDefines.value?.find((d) => d._vid == getPageParamsDataId(props.widget))
    if (!isNullOrUnDef(dataDefine)) {
      const { value } = useDataDefineExecutor(editor, { dataDefine })
      value.value = editor.getPageParams() ?? {}
    }
  }
)

watch(
  () => dataDefines.value,
  () => setupDataResults(),
  { immediate: true }
)
</script>
