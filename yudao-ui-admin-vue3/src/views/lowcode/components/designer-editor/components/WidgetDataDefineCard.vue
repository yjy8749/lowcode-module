<template>
  <LowcodeCard
    :name="`${dataDefine.name} ${dataDefine._var ?? ''}`"
    :tips="tips"
    :actions="actions"
    v-loading="isDataDefineExecuting"
  >
    <el-text type="primary" v-if="isType('remote', 'submit')">
      {{ dataDefine.requestMethod?.toUpperCase() }} {{ dataDefine.requestUrl }}
    </el-text>
    <DataPropDefineInput
      v-if="!isType('submit')"
      :data-id="dataDefine._vid"
      :read-only="true"
      :model-value="dataDefine.propDefines"
    />
  </LowcodeCard>
</template>
<script lang="ts" setup>
import { isNullOrUnDef, isEmpty } from '@/utils/is'
import LowcodeCard from '../../common/LowcodeCard.vue'
import {
  DesignerEditor,
  WidgetDataDefine,
  WidgetDataDefineType,
  WidgetInstance
} from '../designer-editor.type'
import { useDataDefineExecutor } from './dataDefine/hooks'
import DataPropDefineInput from '../components/dataDefine/DataPropDefineInput.vue'
import {
  buildDataDefineRefreshCmd,
  checkDataDefineAreBound,
  checkDataDefineAreRefed,
  useWidgetDataDefines
} from '../designer-editor.utils'
import { writeWidgetValueCmd } from '../designer-editor.cmd'

export interface WidgetDataDefineCardProps {
  editor: DesignerEditor
  widget: WidgetInstance
  dataDefine: WidgetDataDefine
}

export type WidgetDataDefineCardEmits = {
  edit: []
  copy: []
}

const props = defineProps<WidgetDataDefineCardProps>()

const emits = defineEmits<WidgetDataDefineCardEmits>()

const message = useMessage()

const isType = (...types: WidgetDataDefineType[]): boolean => {
  return types.includes(props.dataDefine._type)
}

const dataDefineExecutor = useDataDefineExecutor(props.editor)

const tips = computed(() => {
  const def = props.dataDefine
  return [`${def._type}`, `${def.scope}`, `${def.isAutoLoad ? '自动' : '手动'}`].join(', ')
})

const isDataDefineExecuting = computed(() => {
  const { dataDefine, isExecuting } = dataDefineExecutor
  return (
    !isNullOrUnDef(props.dataDefine) &&
    props.dataDefine?._vid == dataDefine.value?._vid &&
    isExecuting.value
  )
})

const actions = computed(() => {
  return [
    {
      type: 'primary',
      label: '查看',
      isShow: isType('runtime'),
      onClick: () => {
        emits('edit')
      }
    },
    {
      type: 'primary',
      label: '修改',
      isShow: isType('def', 'remote', 'ref', 'const', 'submit'),
      onClick: () => {
        emits('edit')
      }
    },
    {
      type: 'danger',
      label: '清除',
      isShow: isType('def', 'remote', 'ref', 'submit'),
      onClick: () => {
        doRemoveDefine()
      }
    },
    {
      type: 'warning',
      label: '刷新',
      isShow: isType('ref'),
      onClick: () => {
        doRefreshDefines()
      }
    },
    {
      type: 'success',
      label: '结果',
      isShow: isType('def', 'remote', 'ref', 'const', 'submit'),
      onClick: () => {
        doOpenDataDefineExecuteDialog()
      }
    },
    {
      type: 'primary',
      label: '复制',
      isShow: isType('def', 'remote', 'ref', 'submit'),
      onClick: () => {
        emits('copy')
      }
    }
  ]
})

const openDataDefineExecuteDialog = inject('openDataDefineExecuteDialog') as Function

// 查看结果
const doOpenDataDefineExecuteDialog = () => {
  openDataDefineExecuteDialog({ dataDefine: props.dataDefine })
}

// 刷新引用数据解析
const doRefreshDefines = () => {
  const cmd = buildDataDefineRefreshCmd(props.editor, props.widget, props.dataDefine)
  if (!isNullOrUnDef(cmd)) {
    props.editor.executeCmd(cmd)
  }
}

//清除定义
const doRemoveDefine = async () => {
  // 清除引用检查
  const refedList = checkDataDefineAreRefed(props.editor, props.widget, props.dataDefine, true)
  if (!isEmpty(refedList)) {
    message.error(`被 ${refedList[0].label} 引用中不能清除`)
    return
  }
  const boundList = checkDataDefineAreBound(props.editor, props.widget, props.dataDefine, true)
  if (!isEmpty(boundList)) {
    message.error(`被 ${boundList[0].label} 绑定中不能清除`)
    return
  }
  await message.confirm('是否确认清除数据定义?')
  const dataDefineList = useWidgetDataDefines(props.widget).filter(
    (e) => e._vid != props.dataDefine?._vid
  )
  const { result, isExecuted, getData } = dataDefineExecutor.updateExecutor({
    dataDefine: props.dataDefine
  })
  const isDataExecuted = isExecuted.value
  props.editor.executeCmd({
    ...writeWidgetValueCmd(props.editor, {
      widget: props.widget,
      key: 'dataDefines',
      value: dataDefineList
    }),
    async executeSuccess() {
      result.value = undefined
    },
    async rollbackSuccess() {
      if (isDataExecuted) {
        await getData()
      }
    }
  })
}
</script>
