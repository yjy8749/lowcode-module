<template>
  <el-row :gutter="15">
    <el-col :span="5" :xs="8">
      <ContentWrap class="h-1/1">
        <MaterialFolderTree
          ref="treeRef"
          source="integrator"
          @node-select="handleNodeSelect"
          @node-unselect="handleNodeUnselect"
        />
      </ContentWrap>
    </el-col>
    <el-col :span="19" :xs="16">
      <ContentWrap class="h-1/1">
        <MaterialFileList ref="listRef" source="integrator" @open-folder="handleOpenFolder" />
      </ContentWrap>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import MaterialFileList from '@/views/lowcode/components/MaterialFileList.vue'
import MaterialFolderTree from '@/views/lowcode/components/MaterialFolderTree.vue'
import { MaterialFileVO } from '@/api/lowcode/materialfile'

defineOptions({ name: 'LowcodeIntegratorIndex' })

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
</script>
