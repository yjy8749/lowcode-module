<template>
  <!-- 组件 -->
  <DesignerPreview ref="designerRef" :editor-data="dataJson">
    <template #userInfo="{ scope }">
      <el-text>userInfo插槽导入:{{ scope.username }}</el-text>
    </template>
  </DesignerPreview>
</template>
<script lang="ts" setup>
// 导入组件
import DesignerPreview from '../../../../index.preview.vue'
import dataJson from './testData.json'

// ref 引用
const designerRef = ref<InstanceType<typeof DesignerPreview>>()
</script>
