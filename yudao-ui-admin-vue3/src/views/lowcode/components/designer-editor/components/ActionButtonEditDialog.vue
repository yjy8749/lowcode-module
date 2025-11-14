<template>
  <Dialog title="绑定按钮函数" width="1100px" v-model="dialogVisible">
    <ActionButtonValueInput
      v-if="!isNullOrUnDef(dialogArgs)"
      :editor="editor"
      :widget="dialogArgs.widget"
      :helps="dialogArgs.helps"
      :defaultFunction="dialogArgs.defaultFunction"
      :isMenuButton="dialogArgs.isMenuButton"
      v-model="btnActionValue"
    />
    <template #footer>
      <el-button @click="doConfirm" type="primary">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { isEmpty, isNullOrUnDef } from '@/utils/is'
import { ActionButtonConfig, DesignerEditor, WidgetInstance } from '../designer-editor.type'
import ActionButtonValueInput from './ActionButtonValueInput.vue'

defineProps<{ editor: DesignerEditor }>()

export interface ActionButtonEditDialogArgs {
  widget: WidgetInstance
  helps?: string
  defaultFunction?: string
  isMenuButton?: boolean
  value?: ActionButtonConfig
  onSubmit?: (args: ActionButtonConfig) => Promise<void> | void
}

const dialogArgs = ref<ActionButtonEditDialogArgs>()

const dialogVisible = ref(false)

const btnActionValue = ref<ActionButtonConfig>()

const doConfirm = async () => {
  await dialogArgs.value?.onSubmit?.call({}, btnActionValue.value)
  dialogVisible.value = false
}

const open = async (args: ActionButtonEditDialogArgs) => {
  dialogArgs.value = args
  btnActionValue.value = { ...args.value }
  if (isNullOrUnDef(btnActionValue.value.onClick)) {
    btnActionValue.value.onClick = {}
  }
  if (isEmpty(btnActionValue.value.onClick?.evalFunction)) {
    btnActionValue.value.onClick!.evalFunction = ''
  }
  dialogVisible.value = true
}

defineExpose({ open })
</script>
