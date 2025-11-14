<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="类型">
        <el-radio-group :disabled="isEditMode" v-model="formData.isFile">
          <el-radio-button :value="false">文件夹 </el-radio-button>
          <el-radio-button :value="true">文件 </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="上级文件夹" prop="parentId">
        <el-tree-select
          :disabled="isEditMode"
          :data="folderTree"
          :props="defaultProps"
          check-strictly
          default-expand-all
          placeholder="请选择上级文件夹"
          value-key="id"
          v-model="formData.parentId"
        />
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input placeholder="请输入名称" v-model="formData.name" />
      </el-form-item>
      <el-form-item label="是否私有" prop="isPrivate">
        <template #label>
          <TextLabel label="是否私有" helps="私有数据仅自己可见" />
        </template>
        <el-radio-group v-model="formData.isPrivate">
          <el-radio
            v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
            :key="`${dict.value}`"
            :value="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input placeholder="请输入排序" v-model="formData.sort" />
      </el-form-item>
      <el-form-item label="物料状态" prop="status" v-if="formData.isFile">
        <el-radio-group :disabled="isEditMode" v-model="formData.status">
          <el-radio-button
            v-for="dict in getIntDictOptions(LOWCODE_DICT_TYPE.LOWCODE_MATERIAL_STATUS)"
            :key="dict.value"
            :value="dict.value"
          >
            {{ dict.label }}
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input placeholder="请输入描述" type="textarea" v-model="formData.description" />
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
  MaterialFileSaveReqVO,
  MaterialFileUpdateReqVO,
  MaterialFileVO
} from '@/api/lowcode/materialfile'
import TextLabel from './common/TextLabel.vue'
import { defaultProps, handleTree } from '@/utils/tree'
import { DICT_TYPE, getBoolDictOptions, getIntDictOptions } from '@/utils/dict'
import { isNullOrUnDef } from '@/utils/is'
import { ElForm, ElTreeSelect } from 'element-plus'
import { LOWCODE_DICT_TYPE } from './common/dict'

type FormDataType = Partial<MaterialFileSaveReqVO>

const message = useMessage()

const dialogVisible = ref(false)

const dialogTitle = ref('')

const formLoading = ref(false)

const formData = ref<FormDataType>({})

const formRules = reactive({
  name: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
  description: [{ max: 500, message: '不能超过500个字符', trigger: 'blur' }],
  parentId: [{ required: true, message: '上级文件夹不能为空', trigger: 'blur' }],
  isPrivate: [{ required: true, message: '未选择是否私有', trigger: 'blur' }],
  status: [{ required: true, message: '物料状态不能为空', trigger: 'blur' }],
  sort: [{ required: true, message: '排序不能为空', trigger: 'blur' }]
})

const isEditMode = computed(() => !isNullOrUnDef(formData.value.id))

const formRef = ref<InstanceType<typeof ElForm>>()

const folderList = ref<MaterialFileVO[]>([])

const folderTree = computed(() => {
  return [{ id: 0, name: '一级目录', children: handleTree(folderList.value) }]
})
const getFolderList = async () => {
  folderList.value = []
  folderList.value = await MaterialFileApi.getMaterialFileFolderList({
    source: formData.value.source ?? 0
  })
}

const open = async (fileVO: Partial<MaterialFileVO>) => {
  try {
    formLoading.value = true
    dialogVisible.value = true
    dialogTitle.value = fileVO.id ? '编辑' : '新增'
    resetForm()
    formData.value = { ...fileVO }
    await getFolderList()
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
    if (!isNullOrUnDef(formData.value.id)) {
      await MaterialFileApi.updateMaterialFile(formData.value as MaterialFileUpdateReqVO)
      message.success('修改成功')
    } else {
      await MaterialFileApi.createMaterialFile(formData.value as MaterialFileSaveReqVO)
      message.success('新增成功')
    }
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
