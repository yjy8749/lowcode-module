<template>
  <IntegratorEditor v-if="fileId" class="editor-main" :file-id="fileId" :isPreview="isPreview" />
</template>
<script setup lang="ts">
import IntegratorEditor from '../../components/integrator-editor/index.vue'

defineOptions({ name: 'LowcodeQuerierEditor' })

const route = useRoute()

const fileId = ref(Number(route.params.id))
const isPreview = ref(Boolean(route.query.isPreview))
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
