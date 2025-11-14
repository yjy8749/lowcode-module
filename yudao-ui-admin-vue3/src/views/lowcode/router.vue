<template>
  <DesignerPreview v-bind="config" @close="doClose" />
</template>
<script setup lang="ts">
import DesignerPreview from './components/designer-editor/index.preview.vue'
import { useTagsViewStore } from '@/store/modules/tagsView'

const tagsViewStore = useTagsViewStore()

const { push, currentRoute } = useRouter() // 路由

const config = computed(() => (unref(currentRoute).meta.query ?? {}) as any)

const doClose = () => {
  tagsViewStore.delView(unref(currentRoute))
  push(tagsViewStore.getVisitedViews.slice(-1)[0])
}
</script>
