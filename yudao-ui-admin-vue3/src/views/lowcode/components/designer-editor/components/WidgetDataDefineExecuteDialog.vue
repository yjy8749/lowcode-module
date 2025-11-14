<template>
  <Dialog title="数据执行&结果" v-model="dialogVisible">
    <LowcodeCard name="最终结果" :actions="dataDefinesActions" v-loading="isExecuting">
      <AceEditor lang="json" :height="400" :readonly="true" v-model="valueJson" />
    </LowcodeCard>
    <template #footer>
      <el-button @click="dialogVisible = false">关 闭</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { jsonStringify } from '../../common/utils'
import { isNullOrUnDef } from '@/utils/is'
import { DesignerEditor, WidgetDataDefine, WidgetDataDefineType } from '../designer-editor.type'
import { ref } from 'vue'
import AceEditor from '../../ace-editor/index.vue'
import LowcodeCard from '../../common/LowcodeCard.vue'
import { useDataDefineExecutor } from '../components/dataDefine/hooks'

defineOptions({ name: 'WidgetDataDefineExecuteDialog' })

const props = defineProps<{ editor: DesignerEditor }>()

export interface WidgetDataDefineExecuteDialogArgs {
  dataDefine: WidgetDataDefine
}

const { value, result, dataDefine, isExecuting, getData, updateExecutor } = useDataDefineExecutor(
  props.editor
)

const valueJson = computed(() => jsonStringify(value.value))

const dialogVisible = ref(false) // 弹窗的是否展示

const message = useMessage()

const isType = (...types: WidgetDataDefineType[]): boolean => {
  return !isNullOrUnDef(dataDefine.value) && types.includes(dataDefine.value!._type)
}

const dataDefinesActions = computed(() => {
  return [
    {
      type: 'warning',
      label: '刷新',
      isShow: isType('def', 'remote'),
      onClick: async () => {
        await getData()
      }
    },
    {
      type: 'danger',
      label: '清除',
      isShow: isType('def', 'remote', 'submit'),
      onClick: async () => {
        await message.confirm('是否确认清除数据结果')
        result.value = undefined
      }
    }
  ]
})

/** 打开弹窗 */
const open = async (args: WidgetDataDefineExecuteDialogArgs) => {
  updateExecutor({ dataDefine: args.dataDefine })
  dialogVisible.value = true
}

defineExpose({ open }) // 提供 open 方法，用于打开弹窗
</script>

<style scoped lang="scss"></style>
