<template>
  <Dialog title="操作日志" v-model="dialogVisible" width="900px">
    <!-- 列表 -->
    <ContentWrap v-loading="loading">
      <el-table :data="list" :stripe="true" :show-overflow-tooltip="true">
        <el-table-column label="主键" align="center" prop="id" />
        <el-table-column
          label="创建时间"
          align="center"
          :formatter="dateFormatter"
          width="180px"
          prop="createTime"
        />
        <el-table-column label="操作描述" align="center" prop="opDesc" />
        <el-table-column label="详细信息" align="center" prop="opDetail" />
      </el-table>
      <Pagination
        :total="total"
        v-model:page="queryParams.pageNo"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
      />
    </ContentWrap>
    <template #footer>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import { MaterialFileVO } from '@/api/lowcode/materialfile'
import {
  MaterialFileLogApi,
  MaterialFileLogPageReqVO,
  MaterialFileLogVO
} from '@/api/lowcode/materialfilelog'

const dialogVisible = ref(false)

const loading = ref(false)

const list = ref<MaterialFileLogVO[]>([])

const total = ref(0)

const queryParams = reactive<Partial<MaterialFileLogPageReqVO>>({
  pageNo: 1,
  pageSize: 10
})

const getList = async () => {
  loading.value = true
  try {
    const data = await MaterialFileLogApi.getMaterialFileLogPage(
      queryParams as MaterialFileLogPageReqVO
    )
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

const open = async (fileVO: MaterialFileVO) => {
  queryParams.fileId = fileVO.id
  queryParams.fileSource = fileVO.source
  queryParams.pageNo = 1
  queryParams.pageSize = 10
  dialogVisible.value = true
  await getList()
}

defineExpose({ open })
</script>
