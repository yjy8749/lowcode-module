<template>
  <DesignerEditor
    v-if="fileId"
    class="editor-main"
    :file-id="fileId"
    :is-preview="isPreview"
    :is-design="true"
    @close="doClose"
  />
</template>
<script setup lang="ts">
import { useTagsViewStore } from '@/store/modules/tagsView'
import DesignerEditor from '../../components/designer-editor/index.vue'

defineOptions({ name: 'LowcodeDesignerEditor' })

const route = useRoute()

const { push, currentRoute } = useRouter() // 路由
const { delView } = useTagsViewStore() // 视图操作

const fileId = ref(Number(route.params.id))
const isPreview = ref(Boolean(route.query.isPreview))

const doClose = () => {
  delView(unref(currentRoute))
  push('/lowcode/designer')
}
</script>
<style lang="scss" scoped>
.editor-main {
  min-height: calc(
    100vh - var(--top-tool-height) - var(--tags-view-height) - var(--app-footer-height) - var(
        --app-content-padding
      )
  );
}
</style>
