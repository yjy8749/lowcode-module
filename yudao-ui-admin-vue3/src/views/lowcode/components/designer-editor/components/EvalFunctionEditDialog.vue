<template>
  <Dialog title="输入函数" width="900px" v-model="dialogVisible">
    <EvalFunctionValueInput
      v-if="!isNullOrUnDef(dialogArgs)"
      name="输入函数代码"
      :editor="editor"
      :widget="dialogArgs.widget"
      :type="dialogArgs.type"
      :helps="dialogArgs.helps"
      :default-function="dialogArgs.defaultFunction"
      :set-default-function="true"
      v-model="evalFunctionValue"
    />
    <template #footer>
      <el-button @click="doConfirm" type="primary">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { isEmpty, isNullOrUnDef } from '@/utils/is'
import {
  DesignerEditor,
  DesignerEditorEvalFunction,
  DesignerEditorEvalFunctionType,
  WidgetInstance
} from '../designer-editor.type'
import EvalFunctionValueInput from './EvalFunctionValueInput.vue'

defineProps<{ editor: DesignerEditor }>()

export interface EvalFunctionEditDialogArgs {
  widget: WidgetInstance
  type?: DesignerEditorEvalFunctionType
  helps?: string
  defaultFunction?: string
  value?: DesignerEditorEvalFunction
  onSubmit?: (args: DesignerEditorEvalFunction) => Promise<void> | void
}

const message = useMessage()

const dialogArgs = ref<EvalFunctionEditDialogArgs>()

const dialogVisible = ref(false)

const evalFunctionValue = ref<DesignerEditorEvalFunction>()

const doConfirm = async () => {
  if (isEmpty(evalFunctionValue.value?.evalFunction)) {
    message.error('请输入函数内容')
    return
  }
  await dialogArgs.value?.onSubmit?.call({}, evalFunctionValue.value)
  dialogVisible.value = false
}

const open = async (args: EvalFunctionEditDialogArgs) => {
  dialogArgs.value = args
  evalFunctionValue.value = { ...args.value }
  dialogVisible.value = true
}

defineExpose({ open })
</script>
