<template>
  <Dialog title="表格设置" width="900px" v-model="dialogVisible">
    <el-card header="列显示配置" shadow="hover">
      <el-checkbox
        v-for="col in dialogArgs?.columns"
        :key="getTableBodyColumnKey(col)"
        v-model="columnShowCfgModel[getTableBodyColumnKey(col)]"
      >
        {{ col.label }}
      </el-checkbox>
    </el-card>
    <template #footer>
      <el-button @click="doConfirm" type="primary">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { QuerierTableBodyColumnProps, QuerierTableSettingProps } from '../querier-table.type'
import { getTableBodyColumnKey } from '../querier-table.utils'

export interface QuerierTableSettingDialogArgs {
  columns: QuerierTableBodyColumnProps[]
  setting: QuerierTableSettingProps
}

export type QuerierTableSettingDialogEmits = {
  confirm: [val: QuerierTableSettingProps]
}

const emits = defineEmits<QuerierTableSettingDialogEmits>()

const dialogVisible = ref(false)

const dialogArgs = ref<QuerierTableSettingDialogArgs>()

const columnShowCfgModel = ref<Record<string, boolean>>({})

const getShowCfgModel = (): Record<string, boolean> => {
  const hiddenCfgMoedl = dialogArgs.value?.setting.columnHiddenCfg ?? {}
  return Object.fromEntries(
    (dialogArgs.value?.columns ?? []).map((c) => {
      const key = getTableBodyColumnKey(c)
      return [key, !(hiddenCfgMoedl[key] ?? c.hidden ?? false)]
    })
  )
}

const open = async (args: QuerierTableSettingDialogArgs) => {
  dialogArgs.value = args
  columnShowCfgModel.value = getShowCfgModel()
  dialogVisible.value = true
}

defineExpose({ open })

const doConfirm = () => {
  emits('confirm', {
    ...dialogArgs.value?.setting,
    columnHiddenCfg: Object.fromEntries(
      Object.entries(columnShowCfgModel.value).map(([key, val]) => [key, !val])
    )
  })
  dialogVisible.value = false
}
</script>
