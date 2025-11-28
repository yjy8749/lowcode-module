<!-- index.render.vue -->
<template>
  <div :class="{ 'hidden-el-upload-list': isHiddenFileList }">
    <UploadFile
      auto-upload
      :file-type="uploadFileAttrs.fileType"
      :file-size="uploadFileAttrs.fileSize"
      :limit="uploadFileAttrs.limit"
      :drag="uploadFileAttrs.drag"
      :is-show-tip="uploadFileAttrs.isShowTip"
      :directory="uploadFileAttrs.directory"
      :model-value="valueVModel"
      @update:model-value="onUpdateValueVModel"
    />
  </div>
</template>
<script lang="ts" setup>
import { isArray } from '@/utils/is'
import { useWidget, type WidgetRenderProps } from '../../hooks'

const props = defineProps<WidgetRenderProps>()

const { usePropAndEvent, usePropValue, toEvalFunction, useEventBind } = useWidget(props)

const uploadFileAttrs = computed(() =>
  usePropAndEvent({ omit: ['hiddenFileList', 'autoJoin', 'upload-success'] })
)

const isHiddenFileList = computed(() => usePropValue('hiddenFileList'))

const onUploadSuccessHandler = computed(() => toEvalFunction(useEventBind('upload-success')))

const valueVModel = ref<any>([])

const onUpdateValueVModel = async (vals: string | string[]) => {
  try {
    let val = uploadFileAttrs.value.limit > 1 ? vals : vals?.[0]
    if (vals && usePropValue('autoJoin') && isArray(vals)) {
      val = vals?.join(',')
    }
    await onUploadSuccessHandler.value?.(val)
  } finally {
    valueVModel.value = []
  }
}
</script>
<style lang="scss" scoped>
.hidden-el-upload-list {
  :deep(.el-upload-list) {
    display: none !important;
    margin: 0 !important;
  }
}
</style>
