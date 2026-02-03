<template>
  <div class="head-container flex gap-1">
    <el-input class="mb-20px" clearable placeholder="名称搜索" v-model="searchValue">
      <template #prefix>
        <Icon icon="ep:search" />
      </template>
    </el-input>
    <el-button @click="doCreateRootFolder" v-if="hasEditorPermi">
      <Icon icon="ep:plus" />
    </el-button>
  </div>
  <div class="head-container">
    <el-tree
      ref="folderTreeRef"
      :data="folderTree"
      :expand-on-click-node="false"
      :filter-node-method="filterFolder"
      :props="defaultProps"
      default-expand-all
      highlight-current
      node-key="id"
      @node-click="handleNodeClick"
      @node-contextmenu="handleNodeContextMenu"
    />
  </div>
  <MaterialFileForm ref="editFormRef" @success="getFolderList" />
  <MaterialMoveForm ref="moveFormRef" @success="getFolderList" />
  <MaterialTransferForm ref="transferFormRef" @success="getFolderList" />
  <MaterialFileLogDialog ref="fileLogRef" />
</template>

<script lang="ts" setup>
import { ElTree } from 'element-plus'
import { defaultProps, handleTree } from '@/utils/tree'
import { MaterialFileApi, MaterialFileVO } from '@/api/lowcode/materialfile'
import MaterialFileForm from './MaterialFileForm.vue'
import MaterialMoveForm from './MaterialMoveForm.vue'
import MaterialTransferForm from './MaterialTransferForm.vue'
import MaterialFileLogDialog from './MaterialFileLogDialog.vue'
import { checkPermi } from '@/utils/permission'
import { useUserStore } from '@/store/modules/user'
import { showContextMenu } from './common/contextMenu'
import { getSourceValue, sourceEditorPermiValue } from './common/utils'
import { TreeKey } from 'element-plus/es/components/tree/src/tree.type'
import { useLoadingService } from './common/hooks'

interface MaterialFolderTreeProps {
  source: string
  integratorSelectable?: boolean
}

const props = withDefaults(defineProps<MaterialFolderTreeProps>(), { integratorSelectable: false })

const sourceValue = computed(() => getSourceValue(props.source))

const hasEditorPermi = computed(() => checkPermi([sourceEditorPermiValue(props.source)]))

const message = useMessage()

const loadingService = useLoadingService()

const searchValue = ref('')

const folderList = ref<MaterialFileVO[]>([])

const folderTree = computed(() => handleTree(folderList.value))

const folderTreeRef = ref<InstanceType<typeof ElTree>>()

const editFormRef = ref<InstanceType<typeof MaterialFileForm>>()

const moveFormRef = ref<InstanceType<typeof MaterialMoveForm>>()

const transferFormRef = ref<InstanceType<typeof MaterialTransferForm>>()

const fileLogRef = ref<InstanceType<typeof MaterialFileLogDialog>>()

const emits = defineEmits(['node-select', 'node-unselect'])
const getFolderList = async () => {
  folderList.value = await MaterialFileApi.getMaterialFileFolderList({
    source: sourceValue.value,
    integratorSelectable: props.integratorSelectable
  })
}

const filterFolder = (name: string, data: Tree) => {
  if (!name) return true
  return data.name.includes(name)
}

const lastSelectNodeKey = ref<any>()
const handleNodeClick = async (row: { [key: string]: any }) => {
  const key = folderTreeRef.value?.getCurrentKey()
  if (lastSelectNodeKey.value == key) {
    folderTreeRef.value?.setCurrentKey()
    lastSelectNodeKey.value = undefined
    emits('node-unselect', row)
  } else {
    folderTreeRef.value?.setCurrentKey(row.id)
    lastSelectNodeKey.value = key
    emits('node-select', row)
  }
}

const userStore = useUserStore()

const isCreator = (file: MaterialFileVO): boolean => file.creator == `${userStore.getUser.id}`
const handleNodeContextMenu = (e: MouseEvent, row: MaterialFileVO) => {
  showContextMenu(e, [
    {
      label: '新增',
      icon: 'ep:plus',
      hidden: !hasEditorPermi.value,
      onClick: () => {
        editFormRef.value?.open({
          source: sourceValue.value,
          status: 1,
          parentId: row.id,
          isFile: false,
          isPrivate: row.isPrivate,
          sort: 0
        })
      }
    },
    {
      label: '修改',
      icon: 'ep:edit',
      hidden: !hasEditorPermi.value,
      disabled: !isCreator(row),
      onClick: () => {
        editFormRef.value?.open(row)
      }
    },
    {
      label: '复制',
      icon: 'ep:copy-document',
      hidden: !hasEditorPermi.value,
      disabled: !isCreator(row),
      onClick: async () => {
        await loadingService.callWithLoading(async () => {
          await message.confirm('是否执行复制？')
          const copyFile = await MaterialFileApi.copyMaterialFile(row)
          message.success('复制成功')
          await getFolderList()
          folderTreeRef.value?.setCurrentKey(copyFile.id)
          emits('node-select', copyFile)
        }, '复制中...')
      }
    },
    {
      label: '删除',
      icon: 'ep:delete',
      hidden: !hasEditorPermi.value,
      disabled: !isCreator(row),
      onClick: async () => {
        const isCurrentDelete = folderTreeRef.value?.getCurrentKey() == row.id
        await message.delConfirm()
        await MaterialFileApi.deleteMaterialFile(row)
        message.success('删除成功')
        await getFolderList()
        if (isCurrentDelete) {
          emits('node-unselect', row)
        }
      }
    },
    {
      label: '移动',
      icon: 'ep:rank',
      hidden: !hasEditorPermi.value,
      disabled: !isCreator(row),
      onClick: async () => {
        moveFormRef.value?.open(row)
      }
    },
    {
      label: '移交',
      icon: 'ep:switch',
      hidden: !hasEditorPermi.value,
      disabled: !isCreator(row),
      onClick: () => {
        transferFormRef.value?.open(row)
      }
    },
    {
      label: '日志',
      icon: 'ep:warning',
      onClick: () => {
        fileLogRef.value?.open(row)
      }
    }
  ])
}

const doCreateRootFolder = () => {
  editFormRef.value?.open({
    source: sourceValue.value,
    status: 1,
    parentId: 0,
    isFile: false,
    isPrivate: true,
    sort: 0
  })
}

watch(
  () => searchValue.value,
  () => {
    folderTreeRef.value?.filter(searchValue.value)
  }
)

defineExpose({
  setCurrentKey(key?: TreeKey) {
    folderTreeRef.value?.setCurrentKey(key)
  },
  getFolderList() {
    getFolderList()
  }
})

onMounted(() => {
  getFolderList()
})
</script>
