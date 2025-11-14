<template>
  <!-- 头部 -->
  <div class="flex items-center gap-2 mb-2">
    <h4>当前所处: </h4>
    <el-tag>{{ currentFolder?.name || '一级目录' }}</el-tag>
    <div class="flex flex-1 justify-end" v-if="integratorSelectable">
      <el-text type="success">
        已选择
        <el-text
          class="cursor-pointer"
          :type="!isEmpty(integratorSelectedIds) ? 'primary' : 'danger'"
          @click.stop="showSelectedFiles"
        >
          {{ integratorSelectedIds.length }}
        </el-text>
        条数据
      </el-text>
    </div>
  </div>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      ref="queryFormRef"
      :model="queryParams"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-240px"
          v-model="queryParams.createTime"
        />
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input
          placeholder="请输入名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
          v-model="queryParams.name"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select placeholder="请选择状态" clearable class="!w-240px" v-model="queryParams.status">
          <el-option
            v-for="dict in getIntDictOptions(LOWCODE_DICT_TYPE.LOWCODE_MATERIAL_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery">
          <Icon icon="ep:search" class="mr-5px" />
          搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon icon="ep:refresh" class="mr-5px" />
          重置
        </el-button>
        <el-button
          type="primary"
          plain
          @click="openCreateForm"
          v-if="!integratorSelectable && hasEditorPermi"
        >
          <Icon icon="ep:plus" class="mr-5px" />
          新增
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>
  <!-- 列表 -->
  <div v-loading="loading">
    <EmptyText v-if="isEmpty(list)" />
    <div class="flex flex-wrap gap-2">
      <el-card
        v-for="file in list"
        :key="file.id"
        shadow="hover"
        body-class="h-full flex flex-col justify-center relative"
        @contextmenu.stop.prevent="(e: MouseEvent) => handleFileContextMenu(e, file)"
        @click.stop.prevent="handleFilelClick(file)"
      >
        <div class="w-30 flex flex-col items-center gap-2">
          <el-badge :type="file.status == 1 ? 'success' : 'info'">
            <Icon :size="64" :icon="fileIcon[file.source]" v-if="file.isFile" />
            <Icon :size="64" class="c-[--el-color-primary]" icon="ep:folder-opened" v-else />
            <template #content>
              {{ getDictObj(LOWCODE_DICT_TYPE.LOWCODE_MATERIAL_STATUS, file.status)?.label }}
            </template>
          </el-badge>
          <el-text class="text-center">{{ file.name }}</el-text>
          <div v-if="!integratorSelectable">
            <el-button
              v-for="btn in getNormalFileActions(file)"
              :key="btn.key"
              size="small"
              type="primary"
              link
              :disabled="btn.isDisabled && btn.isDisabled(file)"
              @click="() => handleCommand(file, btn.key)"
            >
              {{ btn.label }}
            </el-button>
            <el-button size="small" type="primary" link>
              <el-dropdown @command="(key: string) => handleCommand(file, key)">
                <Icon class="c-[--el-color-primary]" icon="ep:more-filled" />
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item
                      v-for="btn in getMoreFileActions(file)"
                      :key="btn.key"
                      :command="btn.key"
                      :disabled="btn.isDisabled && btn.isDisabled(file)"
                    >
                      <Icon v-if="btn.icon" :icon="btn.icon" />{{ btn.label }}
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </el-button>
          </div>
        </div>
        <div
          v-if="isFileSelected(file)"
          class="absolute top-0 left-0 right-0 bottom-0 bg-[--el-overlay-color-lighter] z-1 flex justify-center items-center cursor-pointer"
          @click.stop.prevent="toggleFileSelected(file)"
        >
          <Icon color="#fff" :size="48" icon="ep:check" />
        </div>
      </el-card>
      <el-card
        shadow="hover"
        body-class="h-full flex flex-col justify-center"
        v-if="currentFolder && !loading"
      >
        <div class="w-30 flex flex-col items-center gap-2" @click="openParent">
          <Icon :size="64" icon="svg-icon:lowcode-icon-back" />
          <div>返回上级</div>
        </div>
      </el-card>
    </div>
  </div>
  <!-- 分页 -->
  <Pagination
    :total="total"
    v-model:page="queryParams.pageNo"
    v-model:limit="queryParams.pageSize"
    @pagination="getList"
  />
  <MaterialFileForm ref="editFormRef" @success="getList" />
  <MaterialMoveForm ref="moveFormRef" @success="getList" />
  <MaterialTransferForm ref="transferFormRef" @success="getList" />
  <MaterialFileLogDialog ref="fileLogRef" />
</template>
<script setup lang="ts">
import { isEmpty } from '@/utils/is'
import { MaterialFileApi, MaterialFilePageReqVO, MaterialFileVO } from '@/api/lowcode/materialfile'
import MaterialFileForm from './MaterialFileForm.vue'
import MaterialMoveForm from './MaterialMoveForm.vue'
import MaterialTransferForm from './MaterialTransferForm.vue'
import MaterialFileLogDialog from './MaterialFileLogDialog.vue'
import { getIntDictOptions, getDictObj } from '@/utils/dict'
import { checkPermi } from '@/utils/permission'
import { useUserStore } from '@/store/modules/user'
import { showContextMenu } from './common/contextMenu'
import { getSourceValue, sourceEditorPermiValue } from './common/utils'
import { ElForm } from 'element-plus'
import EmptyText from './common/EmptyText.vue'
import { LOWCODE_DICT_TYPE } from './common/dict'

defineOptions({ name: 'MaterialFileList' })

interface MaterialFileListProps {
  source: string
  integratorSelectable?: boolean
  integratorSelectedIds?: number[]
}

type MaterialFileListEmits = {
  'open-folder': [file?: MaterialFileVO]
  'integrator-select-change': [ids: number[]]
}

const props = withDefaults(defineProps<MaterialFileListProps>(), {
  integratorSelectable: false,
  integratorSelectedIds: () => []
})

const emits = defineEmits<MaterialFileListEmits>()

const sourceValue = computed(() => getSourceValue(props.source))

const hasEditorPermi = computed(() => checkPermi([sourceEditorPermiValue(props.source)]))

const fileIcon = {
  1: 'svg-icon:lowcode-icon-querier',
  2: 'svg-icon:lowcode-icon-designer',
  3: 'svg-icon:lowcode-icon-integrator'
}

const currentFolder = ref<MaterialFileVO>()

const parentId = computed(() => {
  return currentFolder.value?.id ?? 0
})

const message = useMessage()

const loading = ref(false)

const list = ref<MaterialFileVO[]>([])

const total = ref(0)

const queryParams = reactive<Partial<MaterialFilePageReqVO>>({
  pageNo: 1,
  pageSize: 10,
  ids: undefined
})

const queryFormRef = ref<InstanceType<typeof ElForm>>()

const getList = async () => {
  try {
    loading.value = true
    const resp = await MaterialFileApi.getMaterialFilePage({
      ...queryParams,
      integratorSelectable: props.integratorSelectable,
      source: sourceValue.value,
      parentId: queryParams.ids ? undefined : parentId.value
    })
    list.value = resp.list
    total.value = resp.total
  } finally {
    loading.value = false
  }
}

const handleQuery = async () => {
  queryParams.pageNo = 1
  queryParams.ids = undefined
  await getList()
}

const resetQuery = async () => {
  queryParams.ids = undefined
  queryFormRef.value?.resetFields()
  await handleQuery()
}

const editFormRef = ref<InstanceType<typeof MaterialFileForm>>()

const transferFormRef = ref<InstanceType<typeof MaterialTransferForm>>()

const moveFormRef = ref<InstanceType<typeof MaterialMoveForm>>()

const fileLogRef = ref<InstanceType<typeof MaterialFileLogDialog>>()

const openCreateForm = () => {
  editFormRef.value?.open({
    source: sourceValue.value,
    parentId: parentId.value,
    isFile: true,
    isPrivate: true,
    sort: 0,
    status: 1
  })
}

const userStore = useUserStore()

interface FileActionType {
  key: string
  label: string
  icon?: string
  isHidden?: (file: MaterialFileVO) => boolean
  isShow?: (file: MaterialFileVO) => boolean
  isDisabled?: (file: MaterialFileVO) => boolean
  onClick?: (file: MaterialFileVO) => void
}

const { push } = useRouter()

const isPrivate = (file: MaterialFileVO): boolean => file.isPrivate
const isCreator = (file: MaterialFileVO): boolean => file.creator == `${userStore.getUser.id}`
const isLocked = (file: MaterialFileVO): boolean => file.status == 2
const isNormal = (file: MaterialFileVO): boolean => file.status == 1

const isQuerier = computed(() => props.source == 'querier')
const isDesigner = computed(() => props.source == 'designer')
const isIntegrator = computed(() => props.source == 'integrator')

const updateMaterialFileStatus = async (
  file: MaterialFileVO,
  status: number,
  actionText: string
) => {
  await message.confirm(`是否${actionText}该文件`)
  await MaterialFileApi.updateMaterialFileStatus({ id: file.id, status: status })
  message.success(`${actionText}成功`)
  await getList()
}

const fileActionList = ref<FileActionType[]>([
  {
    key: 'openFolder',
    label: '打开',
    icon: 'ep:view',
    isShow: (file) => !file.isFile,
    onClick: (file) => {
      openFolder(file)
    }
  },
  {
    key: 'querierView',
    label: '查看',
    icon: 'ep:view',
    isShow: (file) => isQuerier.value && file.isFile,
    isDisabled: () => !hasEditorPermi.value,
    onClick: (file) => {
      push({ name: 'LowcodeQuerierEditor', params: { id: file.id }, query: { isPreview: 'true' } })
    }
  },
  {
    key: 'querierDefine',
    label: '定义',
    icon: 'ep:set-up',
    isShow: (file) => isQuerier.value && file.isFile,
    isDisabled: (file) => {
      return !hasEditorPermi.value || (isPrivate(file) && !isCreator(file)) || isLocked(file)
    },
    onClick: (file) => {
      push({ name: 'LowcodeQuerierEditor', params: { id: file.id } })
    }
  },
  {
    key: 'designerPreview',
    label: '预览',
    icon: 'ep:view',
    isShow: (file) => isDesigner.value && file.isFile,
    isDisabled: () => !hasEditorPermi.value,
    onClick: (file) => {
      push({ name: 'LowcodeDesignerEditor', params: { id: file.id }, query: { isPreview: 'true' } })
    }
  },
  {
    key: 'designerEdit',
    label: '设计',
    icon: 'ep:set-up',
    isShow: (file) => isDesigner.value && file.isFile,
    isDisabled: (file) => {
      return !hasEditorPermi.value || (isPrivate(file) && !isCreator(file)) || isLocked(file)
    },
    onClick: (file) => {
      push({ name: 'LowcodeDesignerEditor', params: { id: file.id } })
    }
  },
  {
    key: 'integratorPreview',
    label: '查看',
    icon: 'ep:view',
    isShow: (file) => isIntegrator.value && file.isFile,
    isDisabled: () => !hasEditorPermi.value,
    onClick: (file) => {
      push({
        name: 'LowcodeIntegratorEditor',
        params: { id: file.id },
        query: { isPreview: 'true' }
      })
    }
  },
  {
    key: 'integratorEdit',
    label: '集成',
    icon: 'ep:set-up',
    isShow: (file) => isIntegrator.value && file.isFile,
    isDisabled: (file) => {
      return !hasEditorPermi.value || (isPrivate(file) && !isCreator(file)) || isLocked(file)
    },
    onClick: (file) => {
      push({ name: 'LowcodeIntegratorEditor', params: { id: file.id } })
    }
  },
  {
    key: 'update',
    label: '修改',
    icon: 'ep:edit',
    isHidden: () => !hasEditorPermi.value,
    isDisabled: (file) => !isCreator(file) || isLocked(file),
    onClick: (file) => {
      editFormRef.value?.open(file)
    }
  },
  {
    key: 'enable',
    label: '启用',
    icon: 'ep:open',
    isShow: (file) => hasEditorPermi.value && file.isFile && isNormal(file),
    isDisabled: (file) => !isCreator(file),
    onClick: (file) => updateMaterialFileStatus(file, 1, '启用')
  },
  {
    key: 'disabled',
    label: '禁用',
    icon: 'ep:circle-close',
    isShow: (file) => hasEditorPermi.value && file.isFile && isNormal(file),
    isDisabled: (file) => !isCreator(file),
    onClick: (file) => updateMaterialFileStatus(file, 0, '禁用')
  },
  {
    key: 'lock',
    label: '锁定',
    icon: 'ep:lock',
    isShow: (file) => hasEditorPermi.value && file.isFile && isNormal(file),
    isDisabled: (file) => !isCreator(file),
    onClick: (file) => updateMaterialFileStatus(file, 2, '锁定')
  },
  {
    key: 'deprecated',
    label: '弃用',
    icon: 'ep:remove',
    isShow: (file) => hasEditorPermi.value && file.isFile && isNormal(file),
    isDisabled: (file) => !isCreator(file),
    onClick: (file) => updateMaterialFileStatus(file, 3, '弃用')
  },
  {
    key: 'delete',
    label: '删除',
    icon: 'ep:delete',
    isShow: () => hasEditorPermi.value,
    isDisabled: (file) => !isCreator(file) || isLocked(file),
    onClick: async (file) => {
      await message.delConfirm()
      await MaterialFileApi.deleteMaterialFile(file)
      message.success('删除成功')
      await getList()
    }
  },
  {
    key: 'move',
    label: '移动',
    icon: 'ep:rank',
    isShow: () => hasEditorPermi.value,
    isDisabled: (file) => !isCreator(file) || isLocked(file),
    onClick: (file) => {
      moveFormRef.value?.open(file)
    }
  },
  {
    key: 'transfer',
    label: '移交',
    icon: 'ep:switch',
    isShow: () => hasEditorPermi.value,
    isDisabled: (file) => !isCreator(file) || isLocked(file),
    onClick: (file) => {
      transferFormRef.value?.open(file)
    }
  },
  {
    key: 'log',
    label: '日志',
    icon: 'ep:warning',
    onClick: (file) => {
      fileLogRef.value?.open(file)
    }
  }
])

const getNormalFileActions = (file: MaterialFileVO): FileActionType[] => {
  return fileActionList.value
    .filter((i) => (i.isShow?.call({}, file) ?? true) && !(i.isHidden?.call({}, file) ?? false))
    .slice(0, 2)
}

const getMoreFileActions = (file: MaterialFileVO): FileActionType[] => {
  return fileActionList.value
    .filter((i) => (i.isShow?.call({}, file) ?? true) && !(i.isHidden?.call({}, file) ?? false))
    .slice(2)
}

const handleCommand = (file: MaterialFileVO, cmd: string) => {
  fileActionList.value.filter((i) => i.key == cmd)[0].onClick?.(file)
}

const handleFileContextMenu = (e: MouseEvent, file: MaterialFileVO) => {
  if (!props.integratorSelectable) {
    showContextMenu(
      e,
      fileActionList.value
        .filter((i) => (i.isShow?.call({}, file) ?? true) && !(i.isHidden?.call({}, file) ?? false))
        .map((i) => ({
          label: i.label,
          icon: i.icon,
          hidden: i.isHidden && i.isHidden(file),
          disabled: i.isDisabled && i.isDisabled(file),
          onClick: () => handleCommand(file, i.key)
        }))
    )
  }
}

const handleFilelClick = (file: MaterialFileVO) => {
  if (!file.isFile) {
    openFolder(file)
  } else {
    if (props.integratorSelectable) {
      toggleFileSelected(file)
    }
  }
}

const openParent = async () => {
  let file: any = undefined
  const parentId = currentFolder.value?.parentId ?? 0
  if (parentId > 0) {
    file = await MaterialFileApi.getMaterialFile({ id: parentId })
  }
  await openFolder(file)
}

const openFolder = async (file?: MaterialFileVO) => {
  await load(file)
  emits('open-folder', file)
}

const load = async (item?: MaterialFileVO) => {
  currentFolder.value = item
  await handleQuery()
}

const integratorSelectedIds = ref(props.integratorSelectedIds)

const isFileSelected = (file: MaterialFileVO) => {
  return props.integratorSelectable && integratorSelectedIds.value?.includes(file.id)
}

const toggleFileSelected = (file: MaterialFileVO) => {
  if (isFileSelected(file)) {
    integratorSelectedIds.value = integratorSelectedIds.value.filter((i) => i != file.id)
  } else {
    integratorSelectedIds.value = [...integratorSelectedIds.value, file.id]
  }
  emits('integrator-select-change', integratorSelectedIds.value)
}

const showSelectedFiles = async () => {
  if (!isEmpty(integratorSelectedIds.value)) {
    queryParams.ids = queryParams.ids ? undefined : integratorSelectedIds.value
    queryParams.pageNo = 1
    await getList()
  }
}

defineExpose({
  load
})

onMounted(() => {
  handleQuery()
})
</script>
