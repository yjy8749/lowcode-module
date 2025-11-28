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
  /** 弹窗标题，可选 */
  title?: string
  /** 是否启用内容区域滚动，默认为 false */
  scroll?: boolean
  /** 弹窗宽度，支持 CSS 宽度值（如 '500px'、'80%' 等）*/
  width?: string
  /** 弹窗内容区域的最大高度，支持 CSS 高度值（如 '600px'），超出将出现滚动条 */
  maxHeight?: string
  /** 文件 ID，加载的低代码文件Id，必填 */
  fileId: number
  /** 文件版本号，指定加载的低代码文件版本号，为空加载最新版本，可选 */
  version?: number
  /** 透传给低代码页面的自定义参数，类型不限，根据业务需求使用 */
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
