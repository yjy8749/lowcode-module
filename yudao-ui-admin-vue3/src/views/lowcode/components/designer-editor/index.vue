<template>
  <div class="w-full flex justify-center" v-loading="hasLoadingContext || isLoading">
    <div
      class="flex relative"
      :style="designPageWidthStyle"
      @click="onRootEmptyClick"
      @contextmenu="onRootContextMenu"
    >
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

    <!-- 仅设计模式下组件 -->
    <template v-if="isDesignMode">
      <!--  抽屉面板  -->
      <el-drawer
        :title="isWidgetSelected ? '组件属性' : '页面属性'"
        v-model="state.drawerPanelOpened"
        @close="onDrawerClose"
      >
        <WidgetDrawerPanel :editor="editor" v-if="isWidgetSelected" />
        <PageDrawerPanel :editor="editor" v-else />
      </el-drawer>
      <!--  组件结构树  -->
      <el-drawer title="组件结构树" v-model="isWidgetTreeDrawerOpened">
        <WidgetTreeDrawerPanel :editor="editor" />
      </el-drawer>
      <!--  组件需求说明  -->
      <el-drawer title="组件需求说明" v-model="isWidgetPrdDrawerOpened">
        <WidgetPrdDrawerPanel :editor="editor" />
      </el-drawer>
      <!--  组件说明编辑表单  -->
      <WidgetPrdForm ref="widgetPrdFormRef" :editor="editor" />
      <!--  数据定义编辑表单  -->
      <WidgetDataDefineForm ref="dataDefineFormRef" :editor="editor" />
      <!--  数据定义执行弹框  -->
      <WidgetDataDefineExecuteDialog ref="dataDefineExecuteDialogRef" :editor="editor" />
      <!--  函数输入弹框  -->
      <EvalFunctionEditDialog ref="evalFunctionEditDialogRef" :editor="editor" />
      <!--  按钮绑定函数弹框  -->
      <ActionButtonEditDialog ref="actionButtonEditDialogRef" :editor="editor" />
      <!-- 编辑器数据导出 -->
      <EditorDataDialog ref="editorDataDialogRef" :editor="editor" />
      <!-- EasyForm 配置弹框 -->
      <EasyFormConfigDialog ref="easyFormConfigDialogRef" :editor="editor" />
      <!-- EasyTable 配置弹框 -->
      <EasyTableConfigDialog ref="easyTableConfigDialogRef" :editor="editor" />
      <!-- 部署菜单弹框 -->
      <DeployMenuDialog ref="deployMenuDialogRef" />
    </template>
  </div>
</template>

<script lang="ts" setup>
import { useDesignerStore } from './designer-editor.store'
import {
  executeEvalFunction,
  readEditorDataValue,
  useRootRenderContext,
  useSelectedWidget,
  useWidgetTree
} from './designer-editor.utils'
import { isNullOrUnDef, isEmpty } from '@/utils/is'
import { showContextMenu } from '../common/contextMenu'
import { useWidgetMenus } from './designer-editor.menu'
import { DesignerEditor, WidgetInstance } from './designer-editor.type'
import WidgetDrawerPanel from './components/WidgetDrawerPanel.vue'
import PageDrawerPanel from './components/PageDrawerPanel.vue'
import WidgetPrdForm from './components/WidgetPrdForm.vue'
import WidgetDataDefineForm, {
  WidgetDataDefineFormArgs
} from './components/WidgetDataDefineForm.vue'
import WidgetDataDefineExecuteDialog, {
  WidgetDataDefineExecuteDialogArgs
} from './components/WidgetDataDefineExecuteDialog.vue'
import WidgetTreeDrawerPanel from './components/WidgetTreeDrawerPanel.vue'
import WidgetPrdDrawerPanel from './components/WidgetPrdDrawerPanel.vue'
import EditorDataDialog from './components/EditorDataDialog.vue'
import EvalFunctionEditDialog, {
  EvalFunctionEditDialogArgs
} from './components/EvalFunctionEditDialog.vue'
import ActionButtonEditDialog, {
  ActionButtonEditDialogArgs
} from './components/ActionButtonEditDialog.vue'
import DesignerContainer from './index.container.vue'
import { execute, rollback } from './designer-editor.cmd'
import DesignerEditorDialog, { DesignerEditorDialogArgs } from './designer-editor.dialog.vue'
import EasyFormConfigDialog, {
  EasyFormConfigDialogArgs
} from './widgets/advWidgetDefines/easyForm/src/EasyFormConfigDialog.vue'
import EasyTableConfigDialog, {
  EasyTableConfigDialogArgs
} from './widgets/advWidgetDefines/easyTable/src/EasyTableConfigDialog.vue'
import DeployMenuDialog, { DeployMenuDialogArgs } from './components/DeployMenuDialog.vue'

interface DesignerEditorProps {
  fileId?: number | string
  isPreview?: boolean
  isDesign?: boolean
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
  isPreview: props.isPreview,
  isDesign: props.isDesign,
  editorData: props.editorData
})

const {
  state,
  isPreviewMode,
  isDesignMode,
  isLoading,
  isLoaded,
  isLoadError,
  isSaving,
  hasLoadingContext
} = store

const editor = computed((): DesignerEditor => {
  return {
    getStore: () => store,
    getEmitter: () => store.emitter,
    executeCmd: (cmd) => execute(editor.value, cmd),
    rollbackCmd: (cmd) => rollback(editor.value, cmd),
    getPageParams: () => props.params,
    getPageSlots: () => slots,
    dialog: (options) => openDesignerPageDialog(options),
    close: (...args) => doEditorClose(...args),
    inject: {
      openDataDefineForm,
      openEasyFormConfigDialog,
      openEasyTableConfigDialog
    }
  }
})

const isWidgetTreeEmpty = computed(() => isEmpty(useWidgetTree(editor.value)))
const isWidgetSelected = computed(() => !isNullOrUnDef(useSelectedWidget(editor.value)))
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

const onDrawerClose = () => {
  store.setLocation()
}

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
const widgetPrdFormRef = ref<InstanceType<typeof WidgetPrdForm>>()
const dataDefineFormRef = ref<InstanceType<typeof WidgetDataDefineForm>>()
const dataDefineExecuteDialogRef = ref<InstanceType<typeof WidgetDataDefineExecuteDialog>>()
const evalFunctionEditDialogRef = ref<InstanceType<typeof EvalFunctionEditDialog>>()
const actionButtonEditDialogRef = ref<InstanceType<typeof ActionButtonEditDialog>>()
const editorDataDialogRef = ref<InstanceType<typeof EditorDataDialog>>()
const designerEditorDialogRef = ref<InstanceType<typeof DesignerEditorDialog>>()
const easyFormConfigDialogRef = ref<InstanceType<typeof EasyFormConfigDialog>>()
const easyTableConfigDialogRef = ref<InstanceType<typeof EasyTableConfigDialog>>()

const isWidgetTreeDrawerOpened = ref(false)
const isWidgetPrdDrawerOpened = ref(false)

const deployMenuDialogRef = ref<InstanceType<typeof DeployMenuDialog>>()

const openWidgetPrdForm = (widget: WidgetInstance) => {
  widgetPrdFormRef.value?.open(widget)
}

const openDataDefineForm = (args: WidgetDataDefineFormArgs) => {
  return new Promise((resolve, reject) => {
    dataDefineFormRef.value?.open(args, { resolve, reject })
  })
}

const openDataDefineExecuteDialog = (args: WidgetDataDefineExecuteDialogArgs) => {
  dataDefineExecuteDialogRef.value?.open(args)
}

const openWidgetTreeDrawer = () => {
  isWidgetTreeDrawerOpened.value = true
}

const openWidgetPrdDrawer = () => {
  isWidgetPrdDrawerOpened.value = true
}

const openEvalFunctionEditDialog = (args: EvalFunctionEditDialogArgs) => {
  evalFunctionEditDialogRef.value?.open(args)
}

const openActionButtonEditDialog = (args: ActionButtonEditDialogArgs) => {
  actionButtonEditDialogRef.value?.open(args)
}

const openDesignerPageDialog = (options: DesignerEditorDialogArgs) => {
  return new Promise((resolve, reject) => {
    designerEditorDialogRef.value?.open(options, { resolve, reject })
  })
}

const openEditorDataDialog = (impt: boolean) => {
  editorDataDialogRef.value?.open(impt)
}

const openEasyFormConfigDialog = (args: EasyFormConfigDialogArgs) => {
  return new Promise((resolve, reject) => {
    easyFormConfigDialogRef.value?.open(args, { resolve, reject })
  })
}
const openEasyTableConfigDialog = (args: EasyTableConfigDialogArgs) => {
  return new Promise((resolve, reject) => {
    easyTableConfigDialogRef.value?.open(args, { resolve, reject })
  })
}

const openDeployMenuDialog = (args: DeployMenuDialogArgs) => {
  deployMenuDialogRef.value?.open(args)
}

provide('openWidgetPrdForm', openWidgetPrdForm)
provide('openDataDefineForm', openDataDefineForm)
provide('openDataDefineExecuteDialog', openDataDefineExecuteDialog)
provide('openWidgetTreeDrawer', openWidgetTreeDrawer)
provide('openWidgetPrdDrawer', openWidgetPrdDrawer)
provide('openEvalFunctionEditDialog', openEvalFunctionEditDialog)
provide('openActionButtonEditDialog', openActionButtonEditDialog)
provide('openDesignerPageDialog', openDesignerPageDialog)
provide('openEditorDataDialog', openEditorDataDialog)
provide('openEasyFormConfigDialog', openEasyFormConfigDialog)
provide('openEasyTableConfigDialog', openEasyTableConfigDialog)
provide('openDeployMenuDialog', openDeployMenuDialog)

// 右键菜单
const isShowContextMenu = ref(false)

const onRootContextMenu = (e: MouseEvent) => {
  if (isLoaded.value && isDesignMode.value) {
    e.stopPropagation()
    e.preventDefault()
    isShowContextMenu.value = true
    store.setSelected()
    showContextMenu(
      e,
      useWidgetMenus(editor.value, {
        widgetRenderContext: useRootRenderContext(editor.value),
        inject: {
          openWidgetTreeDrawer,
          openWidgetPrdDrawer,
          openEditorDataDialog,
          openDeployMenuDialog,
          openDesignerPageDialog
        }
      })
    )
  }
}

const onRootEmptyClick = (e: MouseEvent) => {
  if (isLoaded.value && !isPreviewMode.value) {
    e.stopPropagation()
    e.preventDefault()
    if (!state.value.drawerPanelOpened) {
      if (isWidgetSelected.value) {
        store.setSelected()
      } else {
        isShowContextMenu.value = !isShowContextMenu.value
        if (isShowContextMenu.value) {
          onRootContextMenu(e)
        }
      }
    }
  }
}

defineExpose({
  getEditor: () => editor.value
})
</script>

<style lang="scss" scoped></style>
