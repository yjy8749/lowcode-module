<template>
  <Dialog title="移交文件" v-model="dialogVisible">
    <el-form
      ref="formRef"
      label-width="100px"
      :model="formData"
      :rules="formRules"
      v-loading="formLoading"
    >
      <el-form-item label="移交文件">
        <el-tag> {{ formData.name }} </el-tag>
      </el-form-item>
      <el-form-item label="接收人" prop="receiverId">
        <el-select placeholder="请选择接收人" v-model="formData.receiverId">
          <el-option
            v-for="user in userList"
            :key="user.id"
            :label="user.nickname"
            :value="user.id"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import {
  MaterialFileApi,
  MaterialFileTransferReqVO,
  MaterialFileVO
} from '@/api/lowcode/materialfile'
import { getSimpleUserList, UserVO } from '@/api/system/user'
import { ElForm } from 'element-plus'

type FormDataType = Partial<MaterialFileTransferReqVO> & { name?: string }

const emits = defineEmits(['success'])

const message = useMessage()

const dialogVisible = ref(false)
const formLoading = ref(false)

const formData = ref<FormDataType>({})

const formRules = reactive({
  receiverId: [{ required: true, message: '接收人不能为空', trigger: 'change' }]
})

const formRef = ref<InstanceType<typeof ElForm>>()

const userList = ref<UserVO[]>([])

const getUserList = async () => {
  userList.value = []
  userList.value = await getSimpleUserList()
}

const submitForm = async () => {
  await formRef.value?.validate()
  formLoading.value = true
  try {
    const data = formData.value as MaterialFileTransferReqVO
    data.receiverName = userList.value.find((i) => i.id == data.receiverId)?.nickname ?? ''
    await MaterialFileApi.transferMaterialFile(data)
    message.success('移交成功')
    dialogVisible.value = false
    emits('success')
  } finally {
    formLoading.value = false
  }
}

const resetForm = () => {
  formData.value = {}
  formRef.value?.resetFields()
}

const open = async (fileVo: MaterialFileVO) => {
  try {
    formLoading.value = true
    dialogVisible.value = true
    resetForm()
    formData.value = { id: fileVo.id, name: fileVo.name }
    await getUserList()
  } finally {
    formLoading.value = false
  }
}

defineExpose({ open })
</script>
