<template>
  <Dialog :title="`${isImport ? '导入' : '导出'}编辑器数据`" width="900px" v-model="dialogVisible">
    <LowcodeCard name="JSON数据" :actions="actions">
      <AceEditor lang="json" :height="400" :readonly="!isImport" v-model="editorData" />
    </LowcodeCard>
    <template #footer>
      <el-button v-if="isImport" type="primary" @click="doImport">确 定</el-button>
      <el-button @click="dialogVisible = false">关 闭</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { isEmpty } from '@/utils/is'
import { copyValue, jsonStringify } from '../../common/utils'
import { DesignerEditor } from '../designer-editor.type'
import LowcodeCard from '../../common/LowcodeCard.vue'
import AceEditor from '../../ace-editor/index.vue'
import { updateEditorDataCmd } from '../designer-editor.cmd'

const props = defineProps<{ editor: DesignerEditor }>()

const message = useMessage()

const isImport = ref(false)

const dialogVisible = ref(false)

const { state } = props.editor.getStore()

const editorData = ref('')

const actions = [
  {
    type: 'success',
    label: '复制',
    onClick: () => {
      copyValue(editorData.value, 'JSON数据')
    }
  }
]

const open = (impt: boolean) => {
  isImport.value = impt
  editorData.value = jsonStringify(state.value.editorData)
  dialogVisible.value = true
}

defineExpose({ open })

const doImport = () => {
  if (isEmpty(editorData.value)) {
    message.error('导入数据不能为空')
    return
  }
  try {
    props.editor.executeCmd(
      updateEditorDataCmd(props.editor, {
        value: JSON.parse(editorData.value)
      })
    )
    dialogVisible.value = false
  } catch (e) {
    message.error('数据格式不正确')
  }
}
</script>

<style scoped lang="scss"></style>
