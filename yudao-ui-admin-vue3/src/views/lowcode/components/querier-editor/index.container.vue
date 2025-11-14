<template>
  <el-row :gutter="16">
    <el-col :md="12" :xs="24">
      <el-card header="XML配置" shadow="hover">
        <el-form
          ref="dataFormRef"
          labelWidth="100px"
          :model="state.editorData"
          :rules="dataFormRules"
        >
          <el-form-item label="数据源" prop="dataSourceId">
            <el-select
              placeholder="请选择数据源"
              :disabled="isPreviewMode"
              v-model="state.editorData.dataSourceId"
            >
              <el-option
                v-for="config in dataSourceConfigList"
                :key="config.id"
                :label="config.name"
                :value="config.id ?? 0"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="数据表名" v-if="!isPreviewMode" prop="dataSourceTableRef">
            <el-input
              clearable
              placeholder="请输入数据表名"
              v-model="state.editorData.dataSourceTableRef"
            >
              <template #append>
                <el-button :loading="tableAnalyzerLoading" @click="doTableAnalyzer">
                  解析表
                </el-button>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="XML配置" prop="queryXml">
            <LowcodeCard name="查询 XML" :actions="queryXmlActions" v-loading="queryTestLoading">
              <AceEditor
                lang="xml"
                :height="400"
                :readonly="isPreviewMode"
                v-model="state.editorData.queryXml"
              />
            </LowcodeCard>
          </el-form-item>
        </el-form>
      </el-card>
    </el-col>
    <el-col :md="12" :xs="24">
      <el-card header="参数配置" shadow="hover">
        <el-form
          ref="deployFormRef"
          labelWidth="100px"
          :model="state.editorData"
          :rules="deployFormRules"
        >
          <el-form-item label="查询开关" prop="queryTypes">
            <el-checkbox-group :disabled="isPreviewMode" v-model="state.editorData.queryTypes">
              <el-checkbox
                v-for="dict in getStrDictOptions(LOWCODE_DICT_TYPE.LOWCODE_QUERIER_QUERY_TYPES)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="部署渠道" prop="channels">
            <el-checkbox-group :disabled="isPreviewMode" v-model="state.editorData.channels">
              <el-checkbox
                v-for="dict in getIntDictOptions(
                  LOWCODE_DICT_TYPE.LOWCODE_QUERIER_DEPLOY_API_CHANNELS
                )"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="接口名称" prop="apiName">
            <el-input
              clearable
              placeholder="请输入接口名称"
              :disabled="isPreviewMode"
              v-model="state.editorData.apiName"
            >
              <template #append>
                <el-button @click="doCopyApi">
                  <Icon icon="ep:copy-document" />
                </el-button>
              </template>
            </el-input>
          </el-form-item>
          <div class="flex justify-end items-center" v-if="!isPreviewMode">
            <el-button type="primary" :disabled="dataFormLoading" :loading="isSaving" @click="save">
              保 存
            </el-button>
            <el-divider direction="vertical" />
            <el-button
              type="danger"
              :disabled="deployFormLoading"
              :loading="isDeploying"
              @click="doDeployApi()"
            >
              发 布
            </el-button>
            <el-divider direction="vertical" />
            <el-button
              type="danger"
              :disabled="deployFormLoading"
              :loading="isDeploying"
              @click="doDeployApi(true)"
            >
              发布&下线其他
            </el-button>
          </div>
        </el-form>
      </el-card>
      <el-card class="mt-4" shadow="hover">
        <DeployApiTable ref="deployApiTableRef" :fileId="fileId" @load="doLoadApiData" />
      </el-card>
    </el-col>
  </el-row>
  <QueryTestResultDialog ref="resultDialogRef" />
  <QueryXmlDialog ref="xmlDialogRef" @success="onXmlComfirm" />
</template>
<script lang="ts" setup>
import { ElForm, FormRules } from 'element-plus'
import LowcodeCard from '../common/LowcodeCard.vue'
import AceEditor from '../ace-editor/index.vue'
import QueryTestResultDialog from './components/QueryTestResultDialog.vue'
import QueryXmlDialog from './components/QueryXmlDialog.vue'
import { FILE_SOURCE_QUERIER, QUERIER_DATA_TYPE_MAIN, QuerierEditor } from './querier-editor.type'
import { copyApis } from './querier-editor.utils'
import { isEmpty } from '@/utils/is'
import { getIntDictOptions, getStrDictOptions } from '@/utils/dict'
import DeployApiTable from './components/DeployApiTable.vue'
import { DataSourceConfigVO } from '@/api/infra/dataSourceConfig'
import { DeployApiVO, QuerierEditorApi } from '@/api/lowcode/editor/querier'
import { MaterialFileDataApi } from '@/api/lowcode/materialfiledata'
import download from '@/utils/download'
import dayjs from 'dayjs'
import { LOWCODE_DICT_TYPE } from '../common/dict'

const message = useMessage()

const props = defineProps<{ editor: QuerierEditor }>()

const store = props.editor.getStore()

const { state, isPreviewMode, isSaving, isDeploying } = store

const fileId = computed(() => state.value.materialFileData?.fileId)

const dataSourceConfigList = ref<DataSourceConfigVO[]>([]) // 数据源列表

const dataFormRef = ref<InstanceType<typeof ElForm>>()

const dataFormLoading = ref(false)

const dataFormRules = reactive<FormRules>({
  dataSourceId: [{ required: true, message: '请选择数据源', trigger: 'change' }],
  queryXml: [{ required: true, message: '请输入查询XML配置', trigger: 'change' }]
})

const deployFormRef = ref<InstanceType<typeof ElForm>>()

const deployFormLoading = ref(false)

const deployFormRules = reactive<FormRules>({
  apiName: [{ required: true, message: '请输入接口名称', trigger: 'change' }]
})

const checkQueryXmlValid = (): boolean => {
  if (isEmpty(state.value.editorData.queryXml)) {
    message.error('查询XML未配置,请指定表名解析生成查询xml')
    return false
  }
  return true
}

const tableAnalyzerLoading = ref(false)

const doTableAnalyzer = async () => {
  try {
    tableAnalyzerLoading.value = true
    state.value.editorData.queryXml = await QuerierEditorApi.genTableXml({
      dataSourceId: state.value.editorData.dataSourceId,
      tableName: state.value.editorData.dataSourceTableRef
    })
  } finally {
    tableAnalyzerLoading.value = false
  }
}

const queryTestLoading = ref(false)

const resultDialogRef = ref<InstanceType<typeof QueryTestResultDialog>>()

const xmlDialogRef = ref<InstanceType<typeof QueryXmlDialog>>()

const queryXmlActions = computed(() => {
  return [
    {
      type: 'primary',
      label: '列表查询',
      onClick: async () => {
        if (checkQueryXmlValid()) {
          try {
            queryTestLoading.value = true
            const result = await QuerierEditorApi.testSelectList({
              dataSourceId: state.value.editorData.dataSourceId,
              queryXml: state.value.editorData.queryXml
            })
            resultDialogRef.value?.open({ data: result })
          } finally {
            queryTestLoading.value = false
          }
        }
      }
    },
    {
      type: 'success',
      label: '查询一条',
      onClick: async () => {
        if (checkQueryXmlValid()) {
          try {
            queryTestLoading.value = true
            const result = await QuerierEditorApi.testSelectOne({
              dataSourceId: state.value.editorData.dataSourceId,
              queryXml: state.value.editorData.queryXml
            })
            resultDialogRef.value?.open({ data: result })
          } finally {
            queryTestLoading.value = false
          }
        }
      }
    },
    {
      type: 'warning',
      label: '分页查询',
      onClick: async () => {
        if (checkQueryXmlValid()) {
          try {
            queryTestLoading.value = true
            const result = await QuerierEditorApi.testSelectPage({
              dataSourceId: state.value.editorData.dataSourceId,
              queryXml: state.value.editorData.queryXml,
              params: { pageParams: { pageNo: 1, pageSize: 10 } }
            })
            resultDialogRef.value?.open({ data: result })
          } finally {
            queryTestLoading.value = false
          }
        }
      }
    },
    {
      type: 'danger',
      label: '导出',
      onClick: async () => {
        try {
          await message.exportConfirm()
          queryTestLoading.value = true
          const data = await QuerierEditorApi.testExport({
            dataSourceId: state.value.editorData.dataSourceId,
            queryXml: state.value.editorData.queryXml
          })
          download.excel(data as any, `测试导出${dayjs().format('YYYYMMDDHHmmss')}.xls`)
        } catch (e) {
          console.error(e)
        } finally {
          queryTestLoading.value = false
        }
      }
    },
    {
      type: 'primary',
      label: '配置',
      onClick: () => {
        if (checkQueryXmlValid()) {
          xmlDialogRef.value?.open(state.value.editorData, isPreviewMode.value)
        }
      }
    }
  ]
})

const onXmlComfirm = (queryXml: string) => {
  state.value.editorData.queryXml = queryXml
}

const save = async () => {
  const valid = await dataFormRef.value?.validate()
  if (valid) {
    await store.saveMaterialFileData({ ...state.value.editorData })
    message.success('保存成功')
  }
}

const deployApiTableRef = ref<InstanceType<typeof DeployApiTable>>()

const doDeployApi = async (isOfflineOther?: boolean) => {
  const valid1 = await dataFormRef.value?.validate()
  const valid2 = await deployFormRef.value?.validate()
  if (valid1 && valid2) {
    const msg = `是否确定要${isOfflineOther ? `发布并下线其他` : '部署并发布'} (${state.value.editorData.apiName})接口`
    await message.confirm(msg)
    await store.deployApiDeploy({ ...state.value.editorData }, isOfflineOther)
    deployApiTableRef.value?.refresh()
  }
}

const doLoadApiData = async (data: DeployApiVO) => {
  await message.confirm('是否加载该版本配置数据?')
  const fileData = await MaterialFileDataApi.getMaterialFileData({
    fileId: data.sourceFileId,
    fileSource: FILE_SOURCE_QUERIER,
    dataType: QUERIER_DATA_TYPE_MAIN,
    version: data.sourceFileVersion
  })
  const editorData = JSON.parse(fileData?.data ?? '{}')
  state.value.editorData.dataSourceTableRef = editorData.dataSourceTableRef
  state.value.editorData.dataSourceId = editorData.dataSourceId
  state.value.editorData.queryXml = editorData.queryXml
  state.value.editorData.channels = editorData.channels
  state.value.editorData.queryTypes = editorData.queryTypes
  state.value.editorData.apiName = editorData.apiName
}

const doCopyApi = () => {
  copyApis(state.value.editorData.apiName)
}

onBeforeMount(async () => {
  dataSourceConfigList.value = await QuerierEditorApi.getDataSourceList()
})
</script>
