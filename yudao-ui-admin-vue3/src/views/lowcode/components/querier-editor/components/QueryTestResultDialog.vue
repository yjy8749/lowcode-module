<template>
  <Dialog title="查询执行&结果" v-model="dialogVisible">
    <AceInputCard title="结果" lang="json" :height="400" :readonly="true" v-model="result" />
    <template #footer>
      <el-button @click="dialogVisible = false">关 闭</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { jsonStringify } from '../../common/utils'
import AceInputCard from '../../common/AceInputCard.vue'

defineOptions({ name: 'QuerierTestResultDialog' })

export interface QueryTestResultDialogArgs {
  data: any
}

const testResult = ref<QueryTestResultDialogArgs>()

const result = computed(() => jsonStringify(testResult.value?.data))

const dialogVisible = ref(false)

const open = async (args: QueryTestResultDialogArgs) => {
  testResult.value = args
  dialogVisible.value = true
}

defineExpose({ open })
</script>

<style scoped lang="scss"></style>
