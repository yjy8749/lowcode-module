<template>
  <Dialog title="列属性配置" :width="900" v-model="dialogVisible">
    <el-form ref="formRef" label-width="100px" :model="formModel" :rules="formRules">
      <div class="flex">
        <el-form-item class="flex-1" label="列名称" prop="label">
          <el-input clearable :placeholder="`请输入列名称`" v-model="formModel.label" />
        </el-form-item>
        <el-form-item class="flex-1" prop="prop">
          <template #label>
            <TextLabel
              label="列字段"
              :helps="`${COLUMN_INDEX_PROP} 为序号列, ${COLUMN_ACTION_PROP} 为操作列`"
            />
          </template>
          <el-input clearable :placeholder="`请输入列字段`" v-model="formModel.prop" />
        </el-form-item>
        <el-form-item class="flex-1" label="列宽" prop="width">
          <FormatInputNumber placeholder="列宽" symbol="px" v-model="formModel.width" />
        </el-form-item>
      </div>
      <div class="flex gap-8">
        <el-form-item label="是否显示" prop="hidden">
          <el-switch :active-value="false" :inactive-value="true" v-model="formModel.hidden" />
        </el-form-item>
        <el-form-item label="是否固定" prop="fixed">
          <el-switch v-model="formModel.fixed" />
        </el-form-item>
        <el-form-item prop="rowKey">
          <template #label>
            <TextLabel label="是否主键" helps="用于唯一确定一条数据，可组合配置" />
          </template>
          <el-switch v-model="formModel.rowKey" />
        </el-form-item>
      </div>
      <div class="flex">
        <el-form-item class="flex-1" prop="splitChar">
          <template #label>
            <TextLabel label="数据分割" helps="配置后,自动分割字符串为数组" />
          </template>
          <el-input placeholder="请输入分割字符串" clearable v-model="formModel.splitChar" />
        </el-form-item>
        <el-form-item class="flex-1" label="列类型" prop="columnType">
          <el-select placeholder="请选择列类型" clearable v-model="formModel.columnType">
            <el-option
              v-for="opt in ColumnTypeOptions"
              :key="opt.label"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
      </div>
      <el-form-item prop="columnFormat">
        <template #label>
          <TextLabel
            label="列格式"
            helps="根据列类型不同, 配置参数, 模版变量: 列数据 ${data}, 行数据 ${row.id}"
          />
        </template>
        <ColumnFormatInput v-model="formModel" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" @click="doConfirm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { cloneDeep } from 'lodash-es'
import { DesignerEditor, WidgetInstance } from '../../../../designer-editor.type'
import { EasyTableBodyColumnProps } from './types'
import { ElForm } from 'element-plus'
import FormatInputNumber from '../../../../components/propInput/FormatInputNumber.vue'
import {
  COLUMN_ACTION_PROP,
  COLUMN_INDEX_PROP
} from '../../../../../querier-table/querier-table.type'
import TextLabel from '../../../../../common/TextLabel.vue'
import { ColumnTypeOptions } from './types'
import ColumnFormatInput from './ColumnFormatInput.vue'

export interface ColumnConfigDialogProps {
  editor: DesignerEditor
  widget: WidgetInstance
}

defineProps<ColumnConfigDialogProps>()

export interface ColumnConfigDialogArgs {
  value: EasyTableBodyColumnProps
  onConfirm: (value: EasyTableBodyColumnProps) => void
}

const dialogVisible = ref(false)

const dialogArgs = ref<ColumnConfigDialogArgs>({
  value: {},
  onConfirm: () => {}
})

const formRef = ref<InstanceType<typeof ElForm>>()

const formModel = ref<EasyTableBodyColumnProps>({})

const formRules = reactive({
  label: [{ required: true, message: '请输入列名称' }],
  prop: [{ required: true, message: '请输入列字段' }]
})

const open = async (args: ColumnConfigDialogArgs) => {
  doReset()
  dialogArgs.value = args
  formModel.value = reactive(cloneDeep(args.value))
  dialogVisible.value = true
}

defineExpose({ open })

const doConfirm = async () => {
  await formRef.value?.validate()
  dialogArgs.value.onConfirm(formModel.value)
  dialogVisible.value = false
}

const doReset = () => {
  formModel.value = {}
}
</script>

<style scoped lang="scss"></style>
