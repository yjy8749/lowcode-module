<template>
  <el-row :gutter="15">
    <el-col :span="5" :xs="8">
      <ContentWrap class="h-1/1">
        <MaterialFolderTree
          ref="treeRef"
          source="querier"
          :integrator-selectable="integratorSelectable"
          @node-select="handleNodeSelect"
          @node-unselect="handleNodeUnselect"
        />
      </ContentWrap>
    </el-col>
    <el-col :span="19" :xs="16">
      <ContentWrap class="h-1/1">
        <MaterialFileList
          ref="listRef"
          source="querier"
          :integrator-selectable="integratorSelectable"
          :integrator-selected-ids="integratorSelectedIds"
          @open-folder="handleOpenFolder"
          @integrator-select-change="onIntegratorSelectChange"
        />
      </ContentWrap>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import MaterialFileList from '@/views/lowcode/components/MaterialFileList.vue'
import MaterialFolderTree from '@/views/lowcode/components/MaterialFolderTree.vue'
import { MaterialFileVO } from '@/api/lowcode/materialfile'

export interface QuerierIndexProps {
  integratorSelectable?: boolean
  integratorSelectedIds?: number[]
}

export type QuerierIndexEmits = {
  'integrator-select-change': [ids: number[]]
}

defineProps<QuerierIndexProps>()

const emits = defineEmits<QuerierIndexEmits>()

defineOptions({ name: 'LowcodeQuerierIndex' })

const treeRef = ref<InstanceType<typeof MaterialFolderTree>>()

const listRef = ref<InstanceType<typeof MaterialFileList>>()
const handleNodeSelect = (item: MaterialFileVO) => {
  listRef.value?.load(item)
}
const handleNodeUnselect = () => {
  listRef.value?.load()
}
const handleOpenFolder = (file?: MaterialFileVO) => {
  treeRef.value?.setCurrentKey(file?.id)
}
const onIntegratorSelectChange = (ids) => {
  emits('integrator-select-change', ids)
}
</script>
