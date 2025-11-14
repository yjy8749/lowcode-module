<template>
  <span v-html="html"></span>
</template>
<script lang="ts" setup>
defineProps<{ html?: string }>()
</script>
