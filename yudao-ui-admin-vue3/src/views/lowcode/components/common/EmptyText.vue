<template>
  <div class="text-center c-[--el-text-color-placeholder]">{{ text ?? '暂无相关数据' }}</div>
</template>
<script lang="ts" setup>
defineProps<{ text?: string }>()
</script>
