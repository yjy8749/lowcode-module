<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      ref="queryFormRef"
      class="-mb-15px"
      :model="queryParams"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="接口状态" prop="apiStatus">
        <el-select
          placeholder="请选择接口状态"
          clearable
          class="!w-240px"
          v-model="queryParams.apiStatus"
        >
          <el-option
            v-for="dict in getIntDictOptions(LOWCODE_DICT_TYPE.LOWCODE_QUERIER_DEPLOY_API_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="接口编码" align="center">
        <template #default="{ row }">
          <div class="flex justify-center items-center gap-1">
            <span class="overflow-hidden text-ellipsis">{{ row.apiCode }}</span>
            <Icon icon="ep:copy-document" @click="() => copyApis(row.apiName, row.apiCode)" />
          </div>
        </template>
      </el-table-column>
      <el-table-column label="接口名称" align="center">
        <template #default="{ row }">
          <div class="flex justify-center items-center gap-1">
            <span class="overflow-hidden text-ellipsis">{{ row.apiName }}</span>
            <Icon icon="ep:copy-document" @click="() => copyApis(row.apiName)" />
          </div>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="apiStatus" width="90px">
        <template #default="{ row }">
          <dict-tag
            :type="LOWCODE_DICT_TYPE.LOWCODE_QUERIER_DEPLOY_API_STATUS"
            :value="row.apiStatus"
          />
        </template>
      </el-table-column>
      <el-table-column label="版本号" align="center" width="80px">
        <template #default="{ row }">
          <el-button link type="primary" @click="doLoad(row)">
            {{ row.sourceFileVersion }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="120px" v-if="hasEditorPermi">
        <template #default="{ row }">
          <el-button v-if="row.apiStatus == 1" link type="danger" @click="doOffline(row)">
            下线
          </el-button>
          <el-button v-if="row.apiStatus != 1" link type="primary" @click="doOnline(row)">
            上线
          </el-button>
          <el-button v-if="row.apiStatus != 1" link type="danger" @click="doDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>
</template>

<script setup lang="ts">
import { QuerierEditorApi, DeployApiVO, DeployApiPageReqVO } from '@/api/lowcode/editor/querier'
import { getIntDictOptions } from '@/utils/dict'
import { checkPermi } from '@/utils/permission'
import { sourceEditorPermiValue } from '../../common/utils'
import { copyApis } from '../querier-editor.utils'
import { ElForm } from 'element-plus'
import { LOWCODE_DICT_TYPE } from '../../common/dict'

export interface DeployApiTableProps {
  fileId?: number
}

export type DeployApiTableEmits = {
  load: [DeployApiVO]
}

const props = defineProps<DeployApiTableProps>()

const emits = defineEmits<DeployApiTableEmits>()

const hasEditorPermi = computed(() => checkPermi([sourceEditorPermiValue('querier')]))

const message = useMessage()

const loading = ref(false)

const list = ref<DeployApiVO[]>([])

const total = ref(0)

const queryParams = reactive<DeployApiPageReqVO>({
  pageNo: 1,
  pageSize: 10,
  sourceFileId: props.fileId,
  apiStatus: undefined
})

const queryFormRef = ref<InstanceType<typeof ElForm>>() // 搜索的表单

const getList = async () => {
  loading.value = true
  try {
    const data = await QuerierEditorApi.deployApiPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

const resetQuery = () => {
  queryFormRef.value?.resetFields()
  handleQuery()
}

const doOnline = async (fileData: DeployApiVO) => {
  await message.confirm('是否确认上线该接口?')
  await QuerierEditorApi.deployApiUpdateStatus({
    sourceFileId: fileData.sourceFileId,
    sourceFileVersion: fileData.sourceFileVersion,
    apiStatus: 1
  })
  await getList()
}

const doOffline = async (fileData: DeployApiVO) => {
  await message.confirm('是否确认下线该接口?')
  await QuerierEditorApi.deployApiUpdateStatus({
    sourceFileId: fileData.sourceFileId,
    sourceFileVersion: fileData.sourceFileVersion,
    apiStatus: 2
  })
  await getList()
}

const doDelete = async (fileData: DeployApiVO) => {
  await message.confirm('是否确认删除该接口?')
  await QuerierEditorApi.deployApiDelete({
    sourceFileId: fileData.sourceFileId,
    sourceFileVersion: fileData.sourceFileVersion
  })
  await getList()
}

const doLoad = async (fileData: DeployApiVO) => {
  emits('load', fileData)
}

onMounted(() => {
  getList()
})

defineExpose({
  refresh() {
    handleQuery()
  }
})
</script>
