<template>
  <AceInputCard
    class="EvalFunctionValueInput"
    :title="title"
    lang="javascript"
    :tips="tips"
    :helps="helps"
    :height="height"
    :actions="actions"
    v-model="valueVModel.evalFunction"
    @change="triggerUpdateDebounce"
  >
    <template #tools>
      <div class="flex items-center gap-4 mb-1" v-if="!isSimpleFunction">
        <template v-if="isMouseFunction">
          <TextLabel label="阻止事件冒泡" />
          <el-switch v-model="valueVModel.stop" @change="triggerUpdateDebounce" />
          <TextLabel label="阻止默认行为" />
          <el-switch v-model="valueVModel.prevent" @change="triggerUpdateDebounce" />
        </template>
        <TextLabel label="函数防抖" />
        <el-switch
          v-model="valueVModel.debounce"
          @change="
            () => (
              valueVModel.debounce ? (valueVModel.throttle = false) : undefined,
              triggerUpdateDebounce()
            )
          "
        />
        <TextLabel label="函数节流" />
        <el-switch
          v-model="valueVModel.throttle"
          @change="
            () => (
              valueVModel.throttle ? (valueVModel.debounce = false) : undefined,
              triggerUpdateDebounce()
            )
          "
        />
        <template v-if="valueVModel.debounce || valueVModel.throttle">
          <TextLabel label="间隔(毫秒)" />
          <el-input-number
            :placeholder="`${DEFAULT_EVAL_FUNCTION_DEALY}`"
            :min="100"
            :step="100"
            :precision="0"
            v-model="valueVModel.dealy"
            @change="triggerUpdateDebounce"
          />
        </template>
      </div>
    </template>
  </AceInputCard>
</template>
<script lang="ts" setup>
import TextLabel from '../../common/TextLabel.vue'
import { computedVModel } from '../../common/hooks'
import {
  DEFAULT_EVAL_FUNCTION_DEALY,
  DesignerEditor,
  DesignerEditorEvalFunction,
  DesignerEditorEvalFunctionType,
  WidgetInstance
} from '../designer-editor.type'
import {
  buildEvalFnContext,
  evalFunctionBuiltInHelps,
  executeEvalFunction,
  getEvalFunctionTips,
  toggleDeffaultFunction
} from '../designer-editor.utils'
import { useDebounceFn } from '@vueuse/core'
import { isEmpty, isNullOrUnDef } from '@/utils/is'
import AceInputCard from '../../common/AceInputCard.vue'

export interface EvalFunctionValueInputProps {
  editor: DesignerEditor
  widget: WidgetInstance
  type?: DesignerEditorEvalFunctionType
  title: string
  height?: number
  helps?: string
  defaultFunction?: string
  setDefaultFunction?: boolean
  modelValue?: DesignerEditorEvalFunction
}

export type EvalFunctionValueInputEmits = {
  'update:modelValue': [val?: DesignerEditorEvalFunction]
  change: [val?: DesignerEditorEvalFunction]
}

const props = withDefaults(defineProps<EvalFunctionValueInputProps>(), {
  type: 'function',
  title: '输入函数',
  height: 200
})

const emits = defineEmits<EvalFunctionValueInputEmits>()

const { valueVModel, triggerUpdate } = computedVModel({
  get() {
    return props.modelValue ?? {}
  },
  set: (val?: DesignerEditorEvalFunction) => {
    if (!isNullOrUnDef(val)) {
      val.type = props.type
    }
    emits('update:modelValue', val)
    emits('change', val)
  }
})

const triggerUpdateDebounce = useDebounceFn(triggerUpdate, 200)

const message = useMessage()

const tips = computed(() => getEvalFunctionTips(valueVModel.value))

const helps = computed(() => evalFunctionBuiltInHelps(props.helps))

const isMouseFunction = computed(() => 'mouse-function' == props.type)

const isSimpleFunction = computed(() => 'simple-function' == props.type)

const actions = [
  {
    type: 'success',
    label: '运行',
    onClick: async () => {
      const result = await executeEvalFunction(
        props.editor,
        buildEvalFnContext(props.editor, { runtime: false, _vid: props.widget._vid }),
        valueVModel.value
      )
      message.info(`执行结果${JSON.stringify(result)}`)
    }
  },
  {
    type: 'primary',
    label: '重置',
    onClick: () => {
      valueVModel.value.evalFunction = toggleDeffaultFunction(
        valueVModel.value.evalFunction,
        props.defaultFunction
      )
      triggerUpdate()
    }
  }
]

onMounted(() => {
  if (isEmpty(valueVModel.value?.evalFunction) && props.setDefaultFunction) {
    valueVModel.value = {
      ...valueVModel.value,
      evalFunction: props.defaultFunction ?? ''
    }
  }
})
</script>
<style lang="scss" scoped>
.EvalFunctionValueInput {
  :deep(.el-switch) {
    --el-switch-off-color: #999;
  }
}
</style>
