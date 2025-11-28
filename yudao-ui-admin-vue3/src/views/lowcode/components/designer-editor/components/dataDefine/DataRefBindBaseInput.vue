<template>
  <div class="w-full flex gap-2">
    <el-select
      class="w-full"
      value-key="refDataId"
      placeholder="请选择数据定义"
      :disabled="disabled"
      v-model="valueVModel.bind"
      @change="onBindChange"
    >
      <el-option
        v-for="item in bindOptions"
        :key="item.refDataId"
        :label="item.label"
        :value="item"
      />
    </el-select>
    <el-tree-select
      class="w-full"
      default-expand-all
      check-strictly
      placeholder="请选择属性"
      :disabled="disabled"
      :data="refDataPropTreeData"
      v-model="valueVModel.refPropKey"
      @change="triggerUpdate"
    />
  </div>
</template>

<script lang="ts" setup>
import { isNullOrUnDef } from '@/utils/is'
import {
  DATA_ROOT_ITEM_FLAG,
  DATA_EMPTY_NAME_FLAG,
  WidgetDataDefinePropDefine,
  WidgetDataDefinePropType,
  WidgetPropDefineBindBind,
  WidgetPropDefineBindBase,
  DesignerEditor
} from '../../designer-editor.type'
import { useDataDefine } from '../../designer-editor.utils'
import { computedVModel } from '../../../common/hooks'

export interface DataRefBindBaseInputProps {
  editor: DesignerEditor
  modelValue?: WidgetPropDefineBindBase
  bindOptions?: WidgetPropDefineBindBind[]
  refPropTypes?: WidgetDataDefinePropType[]
  disabled?: boolean
}

export type DataRefBindBaseInputEmits = {
  'update:modelValue': [val?: WidgetPropDefineBindBase]
  change: [val?: WidgetPropDefineBindBase]
}

const props = withDefaults(defineProps<DataRefBindBaseInputProps>(), {
  modelValue: () => ({}),
  bindOptions: () => []
})

const emits = defineEmits<DataRefBindBaseInputEmits>()

// 引用数据属性树形结构
const refDataPropTreeData = computed(() => {
  const refBindBind = valueVModel.value.bind
  if (!isNullOrUnDef(refBindBind)) {
    const { refWidgetId, refDataId } = refBindBind
    const refDefine = useDataDefine(props.editor, { _vid: refWidgetId }, { _vid: refDataId })
    const convertToTreeNode = (defines?: WidgetDataDefinePropDefine[]): any[] | undefined => {
      return defines
        ?.filter((def) => def.name != DATA_EMPTY_NAME_FLAG)
        .map((def) => {
          return {
            value: def._key,
            label: def._key,
            disabled: !isNullOrUnDef(props.refPropTypes) && !props.refPropTypes.includes(def.type!),
            children: def.type == 'object' ? convertToTreeNode(def.itemDefines) : undefined
          }
        })
    }
    return [
      {
        value: DATA_ROOT_ITEM_FLAG,
        label: DATA_ROOT_ITEM_FLAG,
        children: convertToTreeNode(refDefine?.propDefines)
      }
    ]
  } else {
    return []
  }
})

const { valueVModel, triggerUpdate } = computedVModel({
  get() {
    return props.modelValue
  },
  set(val?: WidgetPropDefineBindBase) {
    emits('update:modelValue', val)
    emits('change', val)
  }
})

const onBindChange = () => {
  valueVModel.value.refPropKey = '#'
  triggerUpdate()
}
</script>
