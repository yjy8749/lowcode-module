<template>
  <div class="flex justify-center" v-loading="isLoading">
    <div class="flex-1 flex relative">
      <!--  加载失败  -->
      <div v-if="isLoadError" class="m-auto flex flex-col items-center gap-2">
        <el-alert :closable="false" :title="`加载失败: ${state.loadErrorMsg}`" type="error" />
        <el-button type="primary" @click="loadData">重新加载</el-button>
      </div>
      <!--  加载数据  -->
      <div v-else-if="isLoaded" class="flex-1">
        <QuerierContainer :editor="editor" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useQuerierStore } from './querier-editor.store'
import QuerierContainer from './index.container.vue'
import { QuerierEditor } from './querier-editor.type'

const props = defineProps<{ fileId: number; isPreview?: boolean }>()

const store = useQuerierStore(props.fileId, props.isPreview)

const { state, isLoading, isLoaded, isLoadError } = store

const editor = computed((): QuerierEditor => {
  return {
    getStore: () => store
  }
})

const loadData = async () => {
  await store.loadMaterialFileData()
}

onBeforeMount(async () => {
  await loadData()
})
</script>

<style lang="scss" scoped></style>
