<template>
  <Dialog title="表单配置" width="900px" v-model="dialogVisible" @close="onDialogClose">
    <div class="flex flex-col gap-2" v-loading="dialogLoading">
      <LowcodeCard name="JSON数据" tips="解析JSON数据, 自动生成表单配置" :actions="jsonDataActions">
        <AceEditor lang="json" :height="100" v-model="dataDefine.jsonData" />
      </LowcodeCard>
      <EasyFormFieldArrayValueInput v-model="formFields" @label-change="onFieldLabelChange" />
    </div>
    <template #footer>
      <el-button type="primary" :loading="dialogLoading" @click="doConfirm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { isNullOrUnDef, isEmpty } from '@/utils/is'
import LowcodeCard from '../../../../../common/LowcodeCard.vue'
import AceEditor from '../../../../../ace-editor/index.vue'
import {
  DesignerEditor,
  PromiseCallback,
  SLOT_DEFAULT_KEY,
  WidgetDataDefinePropDefine,
  WidgetDefine
} from '../../../../designer-editor.type'
import {
  addWidgetToSlot,
  createDataDefine,
  createSlotItem,
  createWidgetInstance,
  createWidgetInstanceDefault
} from '../../../../designer-editor.utils'
import { useDataDefineAnalyzer } from '../../../../components/dataDefine/hooks'
import EasyFormFieldArrayValueInput from './EasyFormFieldArrayValueInput.vue'
import { useWidgetDefine } from '../../..'
import { getFormModelDataId } from '../../../hooks'

export interface EasyFormConfigDialogArgs {
  define: WidgetDefine
}

export interface EasyFormConfigFormField {
  _propDefineKey?: string
  prop?: string
  label?: string
  _moduleName?: string
  _key?: string
  placeholder?: string
  required?: boolean
}

const message = useMessage()

const props = defineProps<{ editor: DesignerEditor }>()

const dialogVisible = ref(false)

const dialogLoading = ref(false)

const dialogArgs = ref<EasyFormConfigDialogArgs>()
const dialogCallback = ref<PromiseCallback>({})

const { analyzer, dataDefine, updateAnalyzer, setPropComment } = useDataDefineAnalyzer(
  props.editor,
  {
    dataDefine: createDataDefine()
  }
)

const formFields = ref<EasyFormConfigFormField[]>([])

const jsonDataActions = computed(() => {
  return [
    {
      type: 'success',
      label: '解析JSON',
      onClick: () => {
        if (!analyzer.value.tryAnalysisDefines()) {
          message.error('解析JSON失败')
        } else {
          formFields.value = (dataDefine.value.propDefines ?? []).map((item) => {
            return { _propDefineKey: item._key, prop: item.name, ...getMappingInputWidget(item) }
          })
        }
      }
    }
  ]
})

const onFieldLabelChange = (item: EasyFormConfigFormField) => {
  if (!isNullOrUnDef(item._propDefineKey)) {
    setPropComment(item._propDefineKey, item.label)
  }
}

const getMappingInputWidget = (item: WidgetDataDefinePropDefine) => {
  if (item.type === 'string') {
    return {
      _moduleName: 'formWidgetDefines',
      _key: 'input'
    }
  } else {
    return {
      _moduleName: 'formWidgetDefines',
      _key: 'input'
    }
  }
}

const createWidgetInstanceWithFields = async () => {
  const formWidgetDefine = useWidgetDefine({ _moduleName: 'containerWidgetDefines', _key: 'form' })
  const formWidget = await createWidgetInstance(props.editor, formWidgetDefine)
  if (!isNullOrUnDef(formWidget.slots[0])) {
    await Promise.all(
      formFields.value.map(async (field) => {
        const fieldWidget = await createWidgetInstance(props.editor, useWidgetDefine(field))
        fieldWidget.props.prop = field.prop
        if (!isEmpty(field.label)) {
          fieldWidget.props.label = field.label
        }
        fieldWidget.props.placeholder = field.placeholder
        fieldWidget.props.required = field.required
        addWidgetToSlot(formWidget, fieldWidget, { slotKey: SLOT_DEFAULT_KEY })
      })
    )
  }
  formWidget.dataDefines = formWidget.dataDefines?.map((define) => {
    if (define._vid == getFormModelDataId(formWidget)) {
      define.jsonData = dataDefine.value.jsonData
      define.propDefines = dataDefine.value.propDefines
    }
    return define
  })
  const easyFormWidget = createWidgetInstanceDefault(props.editor, dialogArgs.value!.define)
  easyFormWidget.slots = [createSlotItem(props.editor)]
  addWidgetToSlot(easyFormWidget, formWidget, { slotKey: SLOT_DEFAULT_KEY })
  return easyFormWidget
}

const open = async (newArgs: EasyFormConfigDialogArgs, callback?: PromiseCallback) => {
  doReset()
  dialogArgs.value = newArgs
  dialogCallback.value = { ...callback }
  dialogVisible.value = true
}

defineExpose({ open })

const onDialogClose = () => {
  dialogCallback.value.reject?.('cancel create')
}
const doConfirm = async () => {
  if (!isNullOrUnDef(dialogArgs.value)) {
    if (isEmpty(formFields.value)) {
      await message.confirm('未配置表单字段, 是否继续创建')
    }
    const { reject, resolve } = dialogCallback.value
    try {
      dialogCallback.value = {}
      dialogLoading.value = true
      resolve?.(await createWidgetInstanceWithFields())
      dialogVisible.value = false
    } catch (e) {
      reject?.(e)
    } finally {
      dialogLoading.value = false
    }
  }
}

const doReset = () => {
  formFields.value = []
  updateAnalyzer({ dataDefine: createDataDefine() })
}
</script>

<style scoped lang="scss"></style>
