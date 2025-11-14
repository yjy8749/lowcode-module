<template>
  <div class="w-full flex items-center flex-wrap">
    <div class="flex-1 flex" v-if="isBound">
      <div class="flex-1 flex flex-col justify-center">
        <div class="flex justify-end" v-for="item in bindList" :key="`${item.bind?.refDataId}`">
          <el-button type="primary" link @click="doOpenBindForm">
            {{ propsBindLabels(item) }}
          </el-button>
          <el-button v-if="isShowLocation(item)" type="primary" link @click="locationWidget(item)">
            <Icon icon="ep:aim" :size="12" />
          </el-button>
        </div>
      </div>
      <el-button v-if="isBound" type="primary" link @click="doClearBind">
        <Icon icon="ep:delete" :size="12" />
      </el-button>
    </div>
    <div class="flex-1 flex justify-end" v-else>
      <el-button type="primary" link @click="doOpenBindForm"> 去绑定 </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isNullOrUnDef, isEmpty } from '@/utils/is'
import { computedVModel } from '../../../common/hooks'
import {
  WidgetRenderContext,
  WidgetDataDefine,
  WidgetDefine,
  WidgetInstance,
  WidgetPropDefine,
  WidgetPropDefineBind,
  WidgetPropDefineBindBase,
  DesignerEditor
} from '../../designer-editor.type'
import { createDataDefine, useWidgetTree } from '../../designer-editor.utils'

export interface PropBindInputProps {
  editor: DesignerEditor
  widget: WidgetInstance
  context: WidgetRenderContext
  widgetDefine: WidgetDefine
  propDefine: WidgetPropDefine
  modelValue?: WidgetPropDefineBind
}

export type PropBindInputEmits = {
  'update:modelValue': [val?: WidgetPropDefineBind]
  change: [val?: WidgetPropDefineBind]
}

const props = defineProps<PropBindInputProps>()

const emits = defineEmits<PropBindInputEmits>()

const { valueVModel, triggerValidate } = computedVModel({
  get: () => {
    return props.modelValue
  },
  set: (val) => {
    emits('update:modelValue', val)
    emits('change', val)
  }
})

const bindList = computed(() => valueVModel.value?.bindList ?? [])

const isBound = computed(() => !isEmpty(valueVModel.value?.bindList))

const store = props.editor.getStore()

const openDataDefineForm = inject('openDataDefineForm') as Function

const propsBindLabels = (refBind: WidgetPropDefineBindBase) => {
  return `${refBind.bind?.label}`
}

const isShowLocation = (refBind: WidgetPropDefineBindBase) => {
  return isBound.value && refBind.bind?.refWidgetId != props.widget._vid
}

const locationWidget = (refBind: WidgetPropDefineBindBase) => {
  if (!isNullOrUnDef(refBind.bind?.refWidgetId)) {
    store.setLocation({
      widgetId: refBind.bind?.refWidgetId,
      dataId: refBind.bind?.refDataId
    })
  }
}

// 修改绑定
const doOpenBindForm = async () => {
  const bindDefine: WidgetDataDefine = await openDataDefineForm({
    title: '数据&属性绑定',
    widget: props.widget,
    context: props.context,
    widgetDefine: props.widgetDefine,
    widgetTree: useWidgetTree(props.editor),
    propDefine: props.propDefine,
    dataDefine: createDataDefine({
      _type: 'bind',
      widgetId: props.widget._vid,
      refBind: {
        ...valueVModel.value
      }
    })
  })
  valueVModel.value = bindDefine.refBind
  triggerValidate()
}

// 清除绑定
const doClearBind = () => {
  valueVModel.value = undefined
  triggerValidate()
}
</script>

<style lang="scss" scoped></style>
