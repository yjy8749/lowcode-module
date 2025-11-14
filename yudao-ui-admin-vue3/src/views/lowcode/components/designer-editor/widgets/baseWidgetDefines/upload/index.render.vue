<!-- index.render.vue -->
<template>
  <div :class="{ 'hidden-el-upload-list': isHiddenFileList }">
    <UploadFile
      :file-type="uploadFileAttrs.fileType"
      :file-size="uploadFileAttrs.fileSize"
      :limit="uploadFileAttrs.limit"
      :auto-upload="uploadFileAttrs.autoUpload"
      :drag="uploadFileAttrs.drag"
      :is-show-tip="uploadFileAttrs.isShowTip"
      :directory="uploadFileAttrs.directory"
      :model-value="valueVModel"
      @update:model-value="onUpdateValueVModel"
    />
  </div>
</template>
<script lang="ts" setup>
import { useWidget, type WidgetRenderProps } from '../../hooks'

const props = defineProps<WidgetRenderProps>()

const { usePropAndEvent, usePropValue, toEvalFunction, useEventBind } = useWidget(props)

const uploadFileAttrs = computed(() => usePropAndEvent({ omit: ['hiddenFileList'] }))

const isHiddenFileList = computed(() => usePropValue('hiddenFileList'))

const onUploadSuccessHandler = computed(() => toEvalFunction(useEventBind('upload-success')))

const valueVModel = ref([])

const onUpdateValueVModel = async (vals: string | string[]) => {
  try {
    await onUploadSuccessHandler.value?.(vals)
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
