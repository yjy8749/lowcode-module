<template>
  <LowcodeCard
    class="EvalFunctionValueInput"
    :name="name"
    :actions="actions"
    :tips="tips"
    :helps="helps"
  >
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
    <AceEditor
      lang="javascript"
      :height="height"
      v-model="valueVModel.evalFunction"
      @change="triggerUpdateDebounce"
    />
  </LowcodeCard>
</template>
<script lang="ts" setup>
import TextLabel from '../../common/TextLabel.vue'
import { computedVModel } from '../../common/hooks'
import LowcodeCard from '../../common/LowcodeCard.vue'
import AceEditor from '../../ace-editor/index.vue'
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

export interface EvalFunctionValueInputProps {
  editor: DesignerEditor
  widget: WidgetInstance
  type?: DesignerEditorEvalFunctionType
  name?: string
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
  name: '输入函数',
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
      const evalFnContext = buildEvalFnContext(props.editor, props.widget._vid)
      const result = await executeEvalFunction(props.editor, valueVModel.value, evalFnContext)
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
