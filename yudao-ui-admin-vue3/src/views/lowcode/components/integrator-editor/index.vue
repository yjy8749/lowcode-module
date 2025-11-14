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
        <IntegratorContainer :editor="editor" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useIntegratorStore } from './integrator-editor.store'
import IntegratorContainer from './index.container.vue'
import { IntegratorEditor } from './integrator-editor.type'

const props = defineProps<{ fileId: number; isPreview?: boolean }>()

const store = useIntegratorStore(props.fileId, props.isPreview)

const { state, isLoading, isLoaded, isLoadError } = store

const editor = computed((): IntegratorEditor => {
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
