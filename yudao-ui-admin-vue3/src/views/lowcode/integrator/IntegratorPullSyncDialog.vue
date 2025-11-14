<template>
  <Dialog title="同步拉取数据" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="同步配置" prop="configName">
        {{ pullConfig?.configName }}
      </el-form-item>
      <el-form-item label="拉取文件ID" prop="fileId">
        <el-input v-model="formData.fileId" placeholder="请输入拉取文件ID" />
      </el-form-item>
      <el-form-item label="指定拉取版本" prop="fileVersion">
        <el-input-number
          class="!w-full"
          :min="1"
          :step="1"
          placeholder="请输入指定拉取的版本"
          v-model="formData.fileVersion"
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
import { IntegratorEditorApi, IntegratorConfigVO } from '@/api/lowcode/editor/integrator'

defineOptions({ name: 'IntegratorPullSyncDialog' })

const message = useMessage()

const dialogVisible = ref(false)
const formLoading = ref(false)

const formData = ref({
  fileId: undefined,
  fileVersion: undefined
})
const formRules = reactive({
  fileId: [{ required: true, message: '请输入拉取文件ID', trigger: 'blur' }]
})
const formRef = ref()
const pullConfig = ref<IntegratorConfigVO>()

const open = async (config: IntegratorConfigVO) => {
  dialogVisible.value = true
  pullConfig.value = config
  formLoading.value = false
  resetForm()
}

defineExpose({ open })

const submitForm = async () => {
  await formRef.value.validate()
  formLoading.value = true
  try {
    const data = formData.value as any
    await IntegratorEditorApi.integratorEntrySync({
      fileId: data.fileId,
      fileVersionList: data.fileVersion ? [data.fileVersion] : undefined,
      configId: pullConfig.value!.id,
      isPull: true
    })
    message.success('拉取成功')
    dialogVisible.value = false
  } finally {
    formLoading.value = false
  }
}

const resetForm = () => {
  formData.value = {
    fileId: undefined,
    fileVersion: undefined
  }
  formRef.value?.resetFields()
}
</script>
