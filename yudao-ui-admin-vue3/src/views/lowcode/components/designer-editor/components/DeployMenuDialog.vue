<template>
  <Dialog title="发布页面" width="900px" v-model="dialogVisible">
    <div class="my-9px">
      <div class="flex gap-2 items-center">
        <div class="w-120px flex justify-center">
          <TextLabel label="页面权限" helps="点击即可创建按钮" />
        </div>
        <div class="flex-1 flex flex-wrap gap-2" v-loading="materialFileDataLoading">
          <EmptyText text="页面无权限配置" v-if="isEmpty(_vIfPermisValueList)" />
          <el-tag
            class="cursor-pointer"
            type="primary"
            v-for="item in _vIfPermisValueList"
            :key="item"
            @click="openMenuForm('create', { type: 3, permission: item }, ['type', 'permission'])"
          >
            {{ item }}
          </el-tag>
        </div>
      </div>
      <el-divider />
      <div class="flex gap-2 items-center">
        <div class="w-120px flex justify-center">
          <TextLabel label="关联菜单" />
        </div>
        <div class="flex-1 flex flex-wrap gap-2" v-loading="refMenuLoading">
          <div class="flex gap-2">
            <el-button
              v-if="isEmpty(refMenuList)"
              class="!m-0"
              type="primary"
              plain
              @click="openMenuForm('create', { type: 1 }, ['type'])"
            >
              新增目录
            </el-button>
            <el-button
              v-if="isEmpty(refMenuList)"
              class="!m-0"
              type="primary"
              plain
              @click="
                openMenuForm(
                  'create',
                  {
                    type: 2,
                    component: latestComponent
                  },
                  ['type', 'component']
                )
              "
            >
              创建菜单（最新版本：{{ latestFileVersion }}）
            </el-button>
            <el-button v-else class="!m-0" type="primary" plain @click="deployLatestMenu()">
              更新菜单（最新版本：{{ latestFileVersion }}）
            </el-button>
            <el-text type="primary">当前配置: {{ refMenuResp.refMenu?.component }}</el-text>
          </div>
          <div class="flex-1 flex flex-col gap-2" v-if="!isEmpty(refMenuList)">
            <el-table row-key="id" border default-expand-all :data="refMenuList">
              <el-table-column label="菜单名称" align="center">
                <template #default="{ row }">
                  <div class="inline-flex items-center gap-1">
                    <Icon :icon="row.icon" v-if="row.icon" /> {{ row.name }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="类型" align="center" width="80">
                <template #default="{ row }">
                  <DictTag :type="DICT_TYPE.SYSTEM_MENU_TYPE" :value="row.type" />
                </template>
              </el-table-column>
              <el-table-column prop="sort" label="排序" align="center" width="80" />
              <el-table-column prop="permission" label="权限标识" align="center" />
              <el-table-column prop="status" label="状态" align="center" width="80">
                <template #default="{ row }">
                  <DictTag :type="DICT_TYPE.COMMON_STATUS" :value="row.status" />
                </template>
              </el-table-column>
              <el-table-column label="操作" align="center" width="90">
                <template #default="{ row }">
                  <el-button
                    v-if="row.type == 2"
                    class="!m-0"
                    link
                    size="small"
                    type="primary"
                    @click="deployLatestMenu()"
                  >
                    更新
                  </el-button>
                  <el-button
                    class="!m-0"
                    link
                    size="small"
                    type="primary"
                    @click="openMenuForm('update', row, ['type', 'component'])"
                  >
                    修改
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
      <el-divider />
      <div class="flex gap-2 items-center">
        <div class="w-120px flex justify-center">
          <TextLabel label="发布历史" />
        </div>
        <ContentWrap class="flex-1">
          <el-table
            border
            :data="deployMenuPageList"
            :show-overflow-tooltip="true"
            v-loading="deployMenuPageLoading"
          >
            <el-table-column prop="id" label="ID" align="center" width="60" />
            <el-table-column
              prop="createTime"
              label="创建时间"
              align="center"
              :formatter="dateFormatter"
              width="180px"
            />
            <el-table-column prop="menuId" label="菜单ID" align="center" width="100" />
            <el-table-column prop="menuId" label="菜单名称" align="center">
              <template #default="{ row }">
                <div class="inline-flex items-center gap-1">
                  <Icon :icon="row.systemMenu.icon" v-if="row.systemMenu?.icon" />
                  {{ row.systemMenu?.name ?? '--' }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="状态" align="center" width="90">
              <template #default="{ row }">
                <dict-tag
                  :type="LOWCODE_DICT_TYPE.LOWCODE_DESIGNER_DEPLOY_MENU_STATUS"
                  :value="row.menuStatus"
                />
              </template>
            </el-table-column>
            <el-table-column prop="sourceFileVersion" label="版本号" align="center" width="80">
              <template #default="{ row }">
                <el-button
                  link
                  type="primary"
                  :disabled="!row.systemMenu"
                  @click="deployLatestMenu(row.sourceFileVersion)"
                >
                  {{ row.sourceFileVersion }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <!-- 分页 -->
          <Pagination
            :total="deployMenuPageTotal"
            v-model:page="deployMenuPageParams.pageNo"
            v-model:limit="deployMenuPageParams.pageSize"
            @pagination="loadDeployMenuPageResp"
          />
        </ContentWrap>
      </div>
    </div>
    <template #footer>
      <el-button @click="dialogVisible = false">关 闭</el-button>
    </template>
    <MenuForm ref="menuFormRef" :do-create="deployMenuDeploy" :do-update="deployMenuDeploy" />
  </Dialog>
</template>
<script setup lang="tsx">
import { DICT_TYPE } from '@/utils/dict'
import { LOWCODE_DICT_TYPE } from '../../common/dict'
import { MaterialFileDataApi, MaterialFileDataVO } from '@/api/lowcode/materialfiledata'
import {
  DESIGNER_DATA_TYPE_MAIN,
  FILE_SOURCE_DESIGNER,
  WIDGET_VIF_PERMIS_KEY,
  WidgetInstance
} from '../designer-editor.type'
import { isEmpty, isNullOrUnDef, isArray } from '@/utils/is'
import { isWidgetInstanceOf } from '../designer-editor.utils'
import * as MenuApi from '@/api/system/menu'
import MenuForm from '../../common/MenuForm.vue'
import {
  DeployMenuPageReqVO,
  DeployMenuRespVO,
  DesignerEditorApi,
  GetSourceFileRefMenuRespVO
} from '@/api/lowcode/editor/designer'
import TextLabel from '../../common/TextLabel.vue'
import { ElButton } from 'element-plus'
import EmptyText from '../../common/EmptyText.vue'
import { dateFormatter } from '@/utils/formatTime'

export interface DeployMenuDialogArgs {
  fileId: number
  version: number
}

const message = useMessage()

const menuFormRef = ref<InstanceType<typeof MenuForm>>()

const dialogArgs = ref<DeployMenuDialogArgs>()

const dialogVisible = ref(false)

const materialFileDataLoading = ref(false)

const materialFileData = ref<MaterialFileDataVO>()

const latestComponent = computed(() => {
  const fileData = materialFileData.value
  return `lowcode/router?fileId=${fileData?.fileId}&version=${fileData?.version}`
})

const latestFileVersion = computed(() => materialFileData.value?.version)

const editorData = computed(() => JSON.parse(materialFileData.value?.data ?? '{}'))

const _vIfPermisValueList = ref<any[]>([])

const extractForItemValue = (results: any[], e: any) => {
  if (!isNullOrUnDef(e)) {
    if (isArray(e)) {
      e.forEach((i) => extractForItemValue(results, i))
    } else {
      if (!isEmpty(e[WIDGET_VIF_PERMIS_KEY])) {
        results.push({
          label: e.label,
          [WIDGET_VIF_PERMIS_KEY]: e[WIDGET_VIF_PERMIS_KEY]
        })
      }
    }
  }
}

const extractVIfPermisValue = (list?: WidgetInstance[]) => {
  return (list ?? [])
    .map((e) => {
      const results: any[] = []
      extractForItemValue(results, e)
      if (isWidgetInstanceOf(e, { _moduleName: 'advWidgetDefines', _key: 'easyTable' })) {
        //单独处理EasyTable
        extractForItemValue(results, e.props.searchActions)
        extractForItemValue(results, e.props.operationActions)
        extractForItemValue(results, e.props.rowActions)
      }
      if (isWidgetInstanceOf(e, { _moduleName: 'baseWidgetDefines', _key: 'treeView' })) {
        //单独处理EasyTree
        extractForItemValue(results, e.props.createButton)
        extractForItemValue(results, e.props.menuButtons)
      }
      results.push(...extractVIfPermisValue(e.slots))
      results.push(...extractVIfPermisValue(e.slotChildren))
      return results
    })
    .flat()
}

const loadMaterialFileData = async () => {
  try {
    materialFileDataLoading.value = true
    const fileData = await MaterialFileDataApi.getMaterialFileData({
      fileId: dialogArgs.value!.fileId,
      fileSource: FILE_SOURCE_DESIGNER,
      dataType: DESIGNER_DATA_TYPE_MAIN,
      version: dialogArgs.value!.version
    })
    materialFileData.value = fileData
    _vIfPermisValueList.value = [
      ...new Set(
        extractVIfPermisValue(editorData.value.widgetTree)
          .flat()
          .map((e) => e?.[WIDGET_VIF_PERMIS_KEY])
          .flat()
      )
    ]
  } finally {
    materialFileDataLoading.value = false
  }
}

const refMenuLoading = ref(false)

const refMenuResp = ref<GetSourceFileRefMenuRespVO>({})

const refMenuList = computed(() => {
  if (refMenuResp.value.refMenu) {
    const children = refMenuResp.value.refButtonList ?? []
    return [{ ...refMenuResp.value.refMenu, children }]
  }
  return []
})

const loadRefMenuResp = async () => {
  try {
    refMenuLoading.value = true
    refMenuResp.value = await DesignerEditorApi.getSourceFileRefMenu({
      sourceFileId: dialogArgs.value!.fileId
    })
  } finally {
    refMenuLoading.value = false
  }
}

const deployMenuPageLoading = ref(false)

const deployMenuPageList = ref<DeployMenuRespVO[]>([])

const deployMenuPageTotal = ref(0)

const deployMenuPageParams = reactive<DeployMenuPageReqVO>({
  pageNo: 1,
  pageSize: 10
})

const loadDeployMenuPageResp = async () => {
  try {
    deployMenuPageLoading.value = true
    deployMenuPageParams.sourceFileId = dialogArgs.value!.fileId
    const resp = await DesignerEditorApi.deployMenuPage(deployMenuPageParams)
    deployMenuPageList.value = resp.list ?? []
    deployMenuPageTotal.value = resp.total
  } finally {
    deployMenuPageLoading.value = false
  }
}

const open = async (args: DeployMenuDialogArgs) => {
  dialogArgs.value = args
  dialogVisible.value = true
  deployMenuPageParams.pageNo = 1
  loadMaterialFileData()
  loadRefMenuResp()
  loadDeployMenuPageResp()
}

defineExpose({ open })

const openMenuForm = async (
  type: string,
  menu: Partial<MenuApi.MenuVO>,
  disabledFields?: string[]
) => {
  const { refMenu } = refMenuResp.value
  if (menu.type == 3) {
    if (isNullOrUnDef(refMenu)) {
      return message.error('请先创建关联菜单')
    }
    if (
      isNullOrUnDef(menu.id) &&
      !isEmpty(menu.permission) &&
      (refMenu.permission == menu.permission ||
        refMenuResp.value.refButtonList?.some((e) => e.permission == menu.permission))
    ) {
      await message.confirm(`权限为 ${menu.permission} 的按钮已存在, 是否继续创建?`)
    }
    menu.parentId = refMenu!.id
  }
  menuFormRef.value?.open(type, menu.id, menu.parentId, menu, disabledFields)
}

const deployLatestMenu = async (version?: number) => {
  const fileData = materialFileData.value
  version ??= fileData?.version
  await message.confirm(`是否将 ${version} 版本的页面更新到菜单`)
  await deployMenuDeploy(
    {
      ...refMenuResp.value.refMenu!,
      component: `lowcode/router?fileId=${fileData?.fileId}&version=${version}`
    },
    version
  )
}

const deployMenuDeploy = async (data: MenuApi.MenuVO, version?: number) => {
  const fileData = materialFileData.value
  await DesignerEditorApi.deployMenuDeploy({
    sourceFileId: fileData?.fileId,
    sourceFileVersion: version ?? fileData?.version,
    systemMenu: data
  })
  deployMenuPageParams.pageNo = 1
  loadRefMenuResp()
  loadDeployMenuPageResp()
}
</script>

<style scoped lang="scss"></style>
