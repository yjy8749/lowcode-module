<template>
  <Dialog title="查询执行&结果" v-model="dialogVisible">
    <LowcodeCard name="结果">
      <AceEditor lang="json" :height="400" :readonly="true" v-model="result" />
    </LowcodeCard>
    <template #footer>
      <el-button @click="dialogVisible = false">关 闭</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import AceEditor from '../../ace-editor/index.vue'
import LowcodeCard from '../../common/LowcodeCard.vue'
import { jsonStringify } from '../../common/utils'

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
