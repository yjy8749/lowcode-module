<template>
  <Dialog title="移动文件" v-model="dialogVisible">
    <el-form
      ref="formRef"
      label-width="100px"
      :model="formData"
      :rules="formRules"
      v-loading="formLoading"
    >
      <el-form-item label="移动文件">
        <el-tag>{{ formData.name }} </el-tag>
      </el-form-item>
      <el-form-item label="目标文件夹" prop="parentId">
        <el-tree-select
          :data="folderTree"
          :props="defaultProps"
          check-strictly
          default-expand-all
          placeholder="请选择目标文件夹"
          value-key="id"
          v-model="formData.parentId"
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
import { MaterialFileApi, MaterialFileMoveReqVO, MaterialFileVO } from '@/api/lowcode/materialfile'
import { defaultProps, handleTree } from '@/utils/tree'
import { ElForm } from 'element-plus'

type FormDataType = Partial<MaterialFileMoveReqVO> & { name?: string }

const message = useMessage()

const dialogVisible = ref(false)

const formLoading = ref(false)

const formData = ref<FormDataType>({})

const validateParentId = (_, __, callback: (error?: string | Error) => void) => {
  if (formData.value.parentId == formData.value.id) {
    return callback('目标文件夹不能是自己')
  } else {
    return callback()
  }
}

const formRules = reactive({
  parentId: [
    { required: true, message: '目标文件夹不能为空', trigger: 'change' },
    { validator: validateParentId, trigger: 'change' }
  ]
})

const formRef = ref<InstanceType<typeof ElForm>>()

const folderList = ref<MaterialFileVO[]>([])

const folderTree = computed(() => {
  return [
    {
      id: 0,
      name: '一级目录',
      children: handleTree(folderList.value)
    }
  ]
})

const getFolderList = async (source: number) => {
  folderList.value = []
  folderList.value = await MaterialFileApi.getMaterialFileFolderList({ source })
}

const open = async (fileVo: MaterialFileVO) => {
  try {
    formLoading.value = true
    dialogVisible.value = true
    resetForm()
    formData.value = { id: fileVo.id, name: fileVo.name }
    await getFolderList(fileVo.source)
  } finally {
    formLoading.value = false
  }
}

defineExpose({ open })

const emits = defineEmits(['success'])
const submitForm = async () => {
  await formRef.value?.validate()
  formLoading.value = true
  try {
    const data = formData.value as MaterialFileMoveReqVO
    data.parentName = folderList.value.find((i) => i.id == data.parentId)?.name ?? '一级目录'
    await MaterialFileApi.moveMaterialFile(data)
    message.success('移动成功')
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
</script>
