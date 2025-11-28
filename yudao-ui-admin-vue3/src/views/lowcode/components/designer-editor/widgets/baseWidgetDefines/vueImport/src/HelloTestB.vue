<template>
  <el-text>VueImport导入:{{ scope.username }}</el-text>
</template>
<script lang="ts" setup>
defineProps<{ scope?: any }>()
</script>
