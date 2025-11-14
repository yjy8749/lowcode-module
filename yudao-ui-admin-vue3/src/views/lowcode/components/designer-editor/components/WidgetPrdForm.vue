<template>
  <Dialog title="组件说明" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="组件说明:" prop="content">
        <el-input
          :autosize="{ minRows: 5, maxRows: 10 }"
          type="textarea"
          placeholder="输入组件说明"
          clearable
          v-model="formData.content"
          @keyup.enter="submitForm"
        />
      </el-form-item>
      <el-form-item label="颜色标识" prop="color">
        <el-color-picker
          :predefine="[
            '#409eff',
            '#009688',
            '#536dfe',
            '#ff5c93',
            '#ee4f12',
            '#0096c7',
            '#9c27b0',
            '#ff9800'
          ]"
          v-model="formData.color"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { DesignerEditor, WidgetInstance, WidgetPrd } from '../designer-editor.type'
import { writeWidgetValueCmd } from '../designer-editor.cmd'
import { ElForm } from 'element-plus'

const props = defineProps<{ editor: DesignerEditor }>()

defineOptions({ name: 'WidgetPrdForm' })

const widget = ref<WidgetInstance>()

const dialogVisible = ref(false)

const formLoading = ref(false)

const formData = ref<WidgetPrd>({})

const formRules = reactive({
  // content: [{ required: true, message: '组件说明不能为空', trigger: 'blur' }]
})

const formRef = ref<InstanceType<typeof ElForm>>()

const open = async (w: WidgetInstance) => {
  try {
    formLoading.value = true
    dialogVisible.value = true
    resetForm()
    widget.value = w
    formData.value = { ...(w.prd ?? {}) }
  } finally {
    formLoading.value = false
  }
}

defineExpose({ open })

const submitForm = async () => {
  await formRef.value?.validate()
  formLoading.value = true
  try {
    props.editor.executeCmd(
      writeWidgetValueCmd(props.editor, {
        widget: widget.value,
        key: 'prd',
        value: formData.value
      })
    )
    dialogVisible.value = false
  } finally {
    formLoading.value = false
  }
}

const resetForm = () => {
  formData.value = {}
  formRef.value?.resetFields()
}
</script>

<style scoped lang="scss"></style>
