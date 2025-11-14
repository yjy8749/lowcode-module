<template>
  <div class="WidgetPropItem" v-if="propItemIsShow">
    <el-form-item class="!mb-2" size="small" v-bind="formItemProps">
      <template #label v-if="!propDefine.hideLabel">
        <div class="w-full flex justify-between items-center">
          <component v-if="labelRender" :is="labelRender" />
          <TextLabel v-else placement="top" :label="propDefine.label" :helps="propDefine.helps" />
          <template v-if="isPropLabelTop && labelRightRender">
            <component :is="labelRightRender" />
          </template>
        </div>
      </template>
      <PropBindInput
        v-if="propDefine.type === 'propBind'"
        :editor="editor"
        :widget="widget"
        :context="context"
        :widget-define="widgetDefine"
        :prop-define="propDefine"
        v-model="bindVModel"
      />
      <PropArrayValueInput
        v-else-if="propDefine.isArray"
        :editor="editor"
        :widget="widget"
        :context="context"
        :widget-define="widgetDefine"
        :prop-define="propDefine"
        v-model="valueVModel"
      />
      <PropValueInput
        v-else
        :editor="editor"
        :widget="widget"
        :context="context"
        :widget-define="widgetDefine"
        :prop-define="propDefine"
        v-model="valueVModel"
      />
    </el-form-item>
  </div>
</template>
<script lang="ts" setup>
import { isNullOrUnDef } from '@/utils/is'
import {
  WidgetRenderContext,
  WidgetDefine,
  WidgetInstance,
  WidgetPropDefineBind,
  WidgetPropDefine,
  DesignerEditor
} from '../designer-editor.type'
import { writePropBindCmd, writePropValueCmd } from '../designer-editor.cmd'
import PropValueInput from './propInput/PropValueInput.vue'
import PropArrayValueInput from './propInput/PropArrayValueInput.vue'
import PropBindInput from './propInput/PropBindInput.vue'
import { computedVModel } from '../../common/hooks'
import TextLabel from '../../common/TextLabel.vue'

export interface WidgetPropItemProps {
  editor: DesignerEditor
  widget: WidgetInstance
  context: WidgetRenderContext
  widgetDefine: WidgetDefine
  propDefine: WidgetPropDefine
  propValue?: any
  propBind?: WidgetPropDefineBind
}

export type WidgetPropItemEmits = {
  'update:propValue': [any]
}

const props = defineProps<WidgetPropItemProps>()

const emits = defineEmits<WidgetPropItemEmits>()

const { valueVModel } = computedVModel({
  get() {
    return props.propValue
  },
  set(val?: any) {
    doHandlePropChange(val)
    emits('update:propValue', val)
  }
})

const { valueVModel: bindVModel } = computedVModel({
  get() {
    return props.propBind
  },
  set(val?: WidgetPropDefineBind) {
    doHandlePropsBindChange(val)
  }
})

const formItemProps = computed(() => {
  return { ...props.propDefine.formItemProps, labelPosition: labelPosition.value }
})

const propItemIsShow = computed(() => {
  return props.propDefine.isShow ? props.propDefine.isShow(renderContext) : true
})

const labelPosition = computed(() => {
  const val = props.propDefine.formItemProps?.labelPosition
  const _valFun = props.propDefine.formItemProps?._labelPosition
  if (!isNullOrUnDef(_valFun)) {
    return _valFun(valueVModel.value)
  }
  return val
})

const isPropLabelTop = computed(() => {
  return labelPosition.value == 'top'
})

const renderContext = {
  editor: props.editor,
  widget: props.widget,
  context: props.context,
  widgetDefine: props.widgetDefine,
  propDefine: props.propDefine,
  propBind: props.propBind
}

const labelRender = props.propDefine.slots?.label?.(valueVModel, renderContext)

const labelRightRender = props.propDefine.slots?.labelRight?.(valueVModel, renderContext)

const doHandlePropChange = (val?: any) => {
  if (props.propDefine.onSave) {
    props.propDefine.onSave(props.editor, props.widget, props.propDefine.key, val)
  } else if (props.widgetDefine.saveProps) {
    props.widgetDefine.saveProps(props.editor, props.widget, props.propDefine.key, val)
  } else {
    props.editor.executeCmd(
      writePropValueCmd(props.editor, {
        widget: props.widget,
        key: props.propDefine.key,
        value: val
      })
    )
  }
}

const doHandlePropsBindChange = (val?: WidgetPropDefineBind) => {
  if (props.propDefine.onSaveBind) {
    props.propDefine.onSaveBind(props.editor, props.widget, props.propDefine.key, val)
  } else if (props.widgetDefine.savePropsBind) {
    props.widgetDefine.savePropsBind(props.editor, props.widget, props.propDefine.key, val)
  } else {
    props.editor.executeCmd(
      writePropBindCmd(props.editor, {
        widget: props.widget,
        key: props.propDefine.key,
        value: val
      })
    )
  }
}
</script>
<style lang="scss" scoped>
.WidgetPropItem {
  :deep(.el-form-item--label-top) {
    .el-form-item__label {
      width: 100%;
      padding-right: 0;
    }
  }
}
</style>
