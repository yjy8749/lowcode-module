<template>
  <div class="WidgetEventItem">
    <el-form-item class="!mb-2" size="small" :label-position="labelPosition">
      <template #label>
        <TextLabel placement="top" :label="label" :helps="event.helps" />
      </template>
      <EvalFunctionInput
        :type="event.type ?? 'function'"
        :editor="editor"
        :widget="widget"
        :helps="event.fnHelps"
        :default-function="defaultFunction"
        v-model="valueVModel"
      />
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import { isNullOrUnDef } from '@/utils/is'
import {
  WidgetRenderContext,
  WidgetDefine,
  WidgetInstance,
  DesignerEditorEventDefine,
  DesignerEditorEventBind,
  DesignerEditorEventType,
  DesignerEditor
} from '../designer-editor.type'
import EvalFunctionInput from './propInput/EvalFunctionInput.vue'
import { writeWidgetEventBindCmd } from '../designer-editor.cmd'
import { getCustomEventKey } from '../designer-editor.utils'
import { computedVModel } from '../../common/hooks'
import TextLabel from '../../common/TextLabel.vue'

export interface WidgetPropItemProps {
  editor: DesignerEditor
  eventType: DesignerEditorEventType
  widget: WidgetInstance
  widgetDefine: WidgetDefine
  context: WidgetRenderContext
  event: DesignerEditorEventDefine
  eventBind?: DesignerEditorEventBind
  defaultFunction?: string
}

const props = defineProps<WidgetPropItemProps>()

const { valueVModel } = computedVModel({
  get() {
    return props.eventBind
  },
  set(val?: DesignerEditorEventBind) {
    doHandleEventChange(val)
  }
})

const label = computed(() => {
  return `${props.event.label ?? ''}${props.event.label == props.event.key ? '' : ` ${props.event.key}`}`
})

const labelPosition = computed(() =>
  !isNullOrUnDef(valueVModel.value?.evalFunction) ? 'top' : undefined
)

const doHandleEventChange = (val?: DesignerEditorEventBind) => {
  let eventKey = props.event.key
  if (props.eventType == 'custom') {
    eventKey = getCustomEventKey(eventKey)
  }
  if (!isNullOrUnDef(val)) {
    val.eventType = props.eventType
  }
  if (props.widgetDefine.saveEventBind) {
    props.widgetDefine.saveEventBind(props.editor, props.widget, eventKey, val)
  } else {
    props.editor.executeCmd({
      ...writeWidgetEventBindCmd(props.editor, {
        widget: props.widget,
        key: eventKey,
        value: val
      }),
      executeSuccess: () => {
        props.editor.getStore().setRefresh(props.widget)
      },
      rollbackSuccess: () => {
        props.editor.getStore().setRefresh(props.widget)
      }
    })
  }
}
</script>

<style lang="scss" scoped>
.WidgetEventItem {
  :deep(.el-form-item--label-top) {
    .el-form-item__label {
      width: 100%;
      padding-right: 0;
    }
  }
}
</style>
