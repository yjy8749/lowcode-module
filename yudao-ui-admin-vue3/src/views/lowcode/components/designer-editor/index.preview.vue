<template>
  <div class="w-full flex justify-center" v-loading="hasLoadingContext || isLoading">
    <div class="flex relative" :style="designPageWidthStyle">
      <!--  保存中  -->
      <div
        v-if="isSaving"
        class="absolute bottom-0 right-0 bg-#000 c-#fff flex items-center p-x-1 z-999"
      >
        <Icon :size="16" icon="ep:loading" class="animate-spin animate-duration-3000" />
        <span class="font-size-3">保存中...</span>
      </div>
      <!--  加载失败  -->
      <div v-if="isLoadError" class="m-auto flex flex-col items-center gap-2">
        <el-alert :closable="false" :title="`加载失败: ${state.loadErrorMsg}`" type="error" />
        <el-button type="primary" @click="loadData">重新加载</el-button>
      </div>
      <!--  无数据  -->
      <div v-else-if="isWidgetTreeEmpty && isDesignMode" class="m-auto">
        <span class="c-#909399 font-size-8 select-none">右键显示编辑器菜单</span>
      </div>
      <!--  组件容器  -->
      <div v-else class="w-full flex-1" :style="pageStyle">
        <DesignerContainer :editor="editor" />
      </div>
    </div>

    <!-- 弹框 -->
    <DesignerEditorDialog ref="designerEditorDialogRef" />
  </div>
</template>

<script lang="ts" setup>
import { useDesignerStore } from './designer-editor.store'
import { executeEvalFunction, readEditorDataValue, useWidgetTree } from './designer-editor.utils'
import { isEmpty } from '@/utils/is'
import { DesignerEditor } from './designer-editor.type'
import DesignerContainer from './index.container.vue'
import { execute, rollback } from './designer-editor.cmd'
import DesignerEditorDialog, { DesignerEditorDialogArgs } from './designer-editor.dialog.vue'

interface DesignerEditorProps {
  fileId?: number | string
  version?: number | string
  editorData?: any
  params?: any
}

const props = defineProps<DesignerEditorProps>()

const emits = defineEmits(['close'])

const slots = useSlots()

const store = useDesignerStore({
  fileId: props.fileId ? Number(props.fileId) : undefined,
  version: props.version ? Number(props.version) : undefined,
  isPreview: true,
  isDesign: false,
  editorData: props.editorData
})

const { state, isPreviewMode, isDesignMode, isLoading, isLoadError, isSaving, hasLoadingContext } =
  store

const message = useMessage()

const editor = computed((): DesignerEditor => {
  return {
    getStore: () => store,
    getEmitter: () => store.emitter,
    executeCmd: (cmd) => execute(editor.value, cmd),
    rollbackCmd: (cmd) => rollback(editor.value, cmd),
    getPageParams: () => props.params,
    getPageSlots: () => slots,
    getMessage: () => message,
    dialog: (options) => openDesignerPageDialog(options),
    close: (...args) => doEditorClose(...args),
    inject: {
      openDataDefineForm: () => {},
      openEasyFormConfigDialog: () => {},
      openEasyTableConfigDialog: () => {}
    }
  }
})

const isWidgetTreeEmpty = computed(() => isEmpty(useWidgetTree(editor.value)))
const designPageWidthStyle = computed(() => {
  const width = readEditorDataValue(editor.value, 'designPageWidth')
  if ((isPreviewMode.value && !isDesignMode.value) || isEmpty(width)) {
    return { width: '100%', flex: 1 }
  }
  return { width }
})
const pageStyle = computed(() => {
  const bgColor = readEditorDataValue(editor.value, 'pageBgColor')
  if (isPreviewMode.value || !isEmpty(bgColor)) {
    return { backgroundColor: bgColor }
  } else {
    return { backgroundColor: '#eee' }
  }
})

const loadData = async () => {
  await store.loadMaterialFileData()
}

const doEditorClose = async (...args: any) => {
  const reuslt = await executeEvalFunction(
    editor.value,
    readEditorDataValue(editor.value, 'onPageClose'),
    undefined,
    ...args
  )
  emits('close', reuslt)
  return reuslt
}

onBeforeMount(() => {
  loadData()
})

// provide 方法
const designerEditorDialogRef = ref<InstanceType<typeof DesignerEditorDialog>>()

const openDesignerPageDialog = (options: DesignerEditorDialogArgs) => {
  return new Promise((resolve, reject) => {
    designerEditorDialogRef.value?.open(options, { resolve, reject })
  })
}

provide('openWidgetPrdForm', () => {})
provide('openDataDefineForm', () => {})
provide('openDataDefineExecuteDialog', () => {})
provide('openWidgetTreeDrawer', () => {})
provide('openWidgetPrdDrawer', () => {})
provide('openEvalFunctionEditDialog', () => {})
provide('openActionButtonEditDialog', () => {})
provide('openDesignerPageDialog', openDesignerPageDialog)
provide('openEditorDataDialog', () => {})
provide('openEasyFormConfigDialog', () => {})
provide('openEasyTableConfigDialog', () => {})
provide('openDeployMenuDialog', () => {})

defineExpose({
  getEditor: () => editor.value
})
</script>

<style lang="scss" scoped></style>
