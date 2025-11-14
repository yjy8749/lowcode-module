<template>
  <ContentWrap v-loading="localLoading">
    <div class="flex flex-col gap-2">
      <div class="flex-inline gap-2 items-center">
        <TextLabel label="本机信息" />
        <Icon class="cursor-pointer" :size="12" icon="ep:copy-document" @click="doCopyLocalInfo" />
      </div>
      <div class="flex gap-2 items-center">
        <TextLabel label="入口地址: " />
        <el-text>
          {{ localEntry }}
          <Icon
            class="cursor-pointer"
            :size="12"
            icon="ep:copy-document"
            @click="doCopyLocalEntry"
          />
        </el-text>
      </div>
      <div class="flex gap-2 items-center">
        <TextLabel label="校验KEY: " />
        <div class="flex gap-2 items-center">
          <el-text v-if="localConfig">
            {{ localConfig.integrateKey }}
            <Icon
              class="cursor-pointer"
              :size="12"
              icon="ep:copy-document"
              @click="doCopyLocalKey"
            />
          </el-text>
          <EmptyText v-else class="text-12px" text="未生成校验KEY" />
          <el-button size="small" type="primary" plain @click="genLocal">
            <Icon :size="12" icon="ep:refresh-right" class="mr-5px" /> 生成
          </el-button>
        </div>
      </div>
    </div>
  </ContentWrap>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="名称" prop="configName">
        <el-input
          class="!w-160px"
          placeholder="请输入配置名称"
          clearable
          @keyup.enter="handleQuery"
          v-model="queryParams.configName"
        />
      </el-form-item>
      <el-form-item label="入口地址" prop="integrateEntry">
        <el-input
          class="!w-160px"
          placeholder="请输入入口地址"
          clearable
          @keyup.enter="handleQuery"
          v-model="queryParams.integrateEntry"
        />
      </el-form-item>
      <el-form-item label="校验KEY" prop="integrateKey">
        <el-input
          class="!w-160px"
          placeholder="请输入校验KEY"
          clearable
          @keyup.enter="handleQuery"
          v-model="queryParams.integrateKey"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button type="primary" plain @click="openForm('create')">
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap v-loading="loading">
    <el-table
      ref="tableRef"
      row-key="id"
      :data="list"
      :stripe="true"
      :show-overflow-tooltip="true"
      @selection-change="onSelectionChange"
    >
      <el-table-column
        v-if="integratorSelectable"
        type="selection"
        reserve-selection
        align="center"
        width="45px"
      />
      <el-table-column label="主键" align="center" prop="id" width="60px" />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="名称" align="center" prop="configName" />
      <el-table-column label="入口地址" align="center" prop="integrateEntry" />
      <el-table-column label="校验KEY" align="center" prop="integrateKey" />
      <el-table-column label="备注" align="center" prop="comment" />
      <el-table-column label="操作" align="center" width="180px">
        <template #default="scope">
          <el-button link type="primary" @click="openPullSyncDialog(scope.row)"> 拉取 </el-button>
          <el-button link type="primary" @click="openForm('update', scope.row.id)">
            编辑
          </el-button>
          <el-button link type="danger" @click="handleDelete(scope.row.id)"> 删除 </el-button>
        </template>
      </el-table-column>
      <template #append>
        <div class="flex justify-end py-2">
          共 <el-text type="primary">{{ list.length }}</el-text> 条数据
        </div>
      </template>
    </el-table>
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <IntegratorConfigForm ref="formRef" @success="getList" />
  <!-- 拉取数据同步 -->
  <IntegratorPullSyncDialog ref="pullSyncDialogRef" />
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import { IntegratorEditorApi, IntegratorConfigVO } from '@/api/lowcode/editor/integrator'
import IntegratorConfigForm from './IntegratorConfigForm.vue'
import IntegratorPullSyncDialog from './IntegratorPullSyncDialog.vue'
import TextLabel from '../components/common/TextLabel.vue'
import { copyValue } from '../components/common/utils'
import EmptyText from '../components/common/EmptyText.vue'
import { ElTable } from 'element-plus'

export interface IntegratorConfigProps {
  integratorSelectable?: boolean
  integratorSelectedIds?: number[]
}

export type IntegratorConfigEmits = {
  'integrator-select-change': [ids: number[]]
}

/** 低代码-集成器配置 列表 */
defineOptions({ name: 'LowcodeIntegratorConfig' })

const props = withDefaults(defineProps<IntegratorConfigProps>(), {
  integratorSelectable: false,
  integratorSelectedIds: () => []
})

const emits = defineEmits<IntegratorConfigEmits>()

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<IntegratorConfigVO[]>([]) // 列表的数据
const queryParams = reactive({
  configName: undefined,
  integrateEntry: undefined,
  integrateKey: undefined
})
const queryFormRef = ref() // 搜索的表单

const tableRef = ref<InstanceType<typeof ElTable>>()

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    list.value = await IntegratorEditorApi.getIntegratorConfigList(queryParams)
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await IntegratorEditorApi.deleteIntegratorConfig(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** local配置 */
const localLoading = ref(true)
const localConfig = ref<IntegratorConfigVO>()

const localEntry = computed(() => {
  const { host } = window.location
  return `http://${host}/admin-api/lowcode/integrator-editor/entry`
})

const doCopyLocalEntry = () => {
  copyValue(localEntry.value, '入口地址')
}

const doCopyLocalKey = () => {
  if (!localConfig.value) {
    return message.error('请先生成校验KEY')
  }
  copyValue(localConfig.value.integrateKey, '校验KEY')
}

const doCopyLocalInfo = () => {
  copyValue(
    `入口地址: ${localEntry.value}\n校验KEY: ${localConfig.value?.integrateKey ?? ''}`,
    '配置信息'
  )
}

const getLocal = async () => {
  localLoading.value = true
  try {
    localConfig.value = await IntegratorEditorApi.getLocalIntegratorConfig()
  } finally {
    localLoading.value = false
  }
}

const genLocal = async () => {
  if (localConfig.value) {
    await message.confirm('是否要重新生成校验KEY?')
  }
  localLoading.value = true
  try {
    localConfig.value = await IntegratorEditorApi.genLocalIntegratorConfig()
  } finally {
    localLoading.value = false
  }
}

const onSelectionChange = (newSelection: any[]) => {
  emits(
    'integrator-select-change',
    newSelection.map((i) => i.id)
  )
}

/** 初始化 **/
onMounted(() => {
  getList()
  getLocal()
  if (props.integratorSelectable) {
    tableRef.value?.clearSelection()
    nextTick(() => {
      props.integratorSelectedIds?.forEach((id) => {
        tableRef.value?.toggleRowSelection({ id })
      })
    })
  }
})

const pullSyncDialogRef = ref<InstanceType<typeof IntegratorPullSyncDialog>>()

const openPullSyncDialog = (row: IntegratorConfigVO) => {
  pullSyncDialogRef.value?.open(row)
}
</script>
