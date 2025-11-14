<template>
  <Dialog
    :title="dialogArgs.title"
    :scroll="dialogArgs.scroll"
    :width="dialogArgs.width"
    :max-height="dialogArgs.maxHeight"
    v-model="dialogVisible"
    @close="onDialogClose"
  >
    <div v-loading="dialogLoading">
      <DesignerPreview
        ref="designerRef"
        :file-id="dialogArgs.fileId"
        :version="dialogArgs.version"
        :params="dialogArgs.params"
        @close="onDesignerClose"
      />
    </div>
    <template #footer>
      <el-button type="primary" :loading="dialogLoading" @click="doConfirm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import DesignerPreview from './index.preview.vue'
import { PromiseCallback } from './designer-editor.type'

defineOptions({ name: 'DesignerEditorDialog' })

export interface DesignerEditorDialogArgs {
  title?: string
  scroll?: boolean
  width?: string
  maxHeight?: string
  fileId: number
  version?: number
  params?: any
}

const designerRef = ref<InstanceType<typeof DesignerPreview>>()

const dialogVisible = ref(false)

const dialogLoading = ref(false)

const dialogArgs = ref<DesignerEditorDialogArgs>({ fileId: 0 })
const dialogCallback = ref<PromiseCallback>({})

const onDialogClose = () => {
  dialogCallback.value.reject?.('close dialog')
}

const onDesignerClose = () => {
  dialogVisible.value = false
}

const doConfirm = async () => {
  const { resolve, reject } = dialogCallback.value
  try {
    dialogCallback.value = {}
    dialogLoading.value = true
    const result = await designerRef.value?.getEditor().close()
    resolve?.(result)
  } catch (e) {
    dialogCallback.value = { resolve, reject }
    console.error(e)
  } finally {
    dialogLoading.value = false
  }
}

const open = async (newArgs: DesignerEditorDialogArgs, callback?: PromiseCallback) => {
  dialogArgs.value = newArgs
  dialogCallback.value = { ...callback }
  dialogVisible.value = true
}

defineExpose({ open })
</script>

<style scoped lang="scss"></style>
