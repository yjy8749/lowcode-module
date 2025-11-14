<template>
  <div class="w-full flex flex-col gap-2">
    <div class="w-full flex justify-between items-center gap-2" v-if="!isMenuButton">
      <TextLabel label="按钮样式" />
      <div class="flex-1">
        <el-select placeholder="按钮样式" v-model="valueVModel.type">
          <el-option
            v-for="opt in ElCommonTypeOptions"
            :key="opt.label"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </div>
      <TextLabel label="按钮尺寸" />
      <div class="flex-1">
        <el-select placeholder="按钮尺寸" v-model="valueVModel.size">
          <el-option
            v-for="opt in ElCommonSizeOptions"
            :key="opt.label"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </div>
      <div class="w-350px flex justify-between items-center gap-2">
        <TextLabel label="是否为朴素按钮" />
        <div class="flex-1"> <el-switch v-model="valueVModel.plain" /></div>
        <TextLabel label="是否为链接按钮" />
        <div class="flex-1"> <el-switch v-model="valueVModel.link" /></div>
      </div>
    </div>
    <div class="w-full flex justify-between items-center gap-2">
      <TextLabel label="按钮名称" />
      <div class="flex-1">
        <el-input placeholder="按钮名称" v-model="valueVModel.label" />
      </div>
      <TextLabel label="按钮图标" />
      <div class="flex-1">
        <el-input placeholder="按钮图标" v-model="valueVModel.icon">
          <template #suffix>
            <Icon :icon="valueVModel.icon" />
          </template>
        </el-input>
      </div>
      <div class="w-350px flex justify-between items-center gap-2">
        <TextLabel label="权限控制" helps="组件权限控制,拥有任一权限即可" />
        <div class="flex-1">
          <ArrayValueInput
            :group="{ pull: false, put: false }"
            v-model="permisValueVModel"
            @add="handlePermisAdd"
            @remove="handlePermisRemove"
          >
            <template #item="{ index }">
              <el-input clearable placeholder="请输入权限值" v-model="permisValueVModel[index]" />
            </template>
          </ArrayValueInput>
        </div>
      </div>
    </div>
    <EvalFunctionValueInput
      name="显示控制函数"
      type="simple-function"
      :height="100"
      :editor="editor"
      :widget="widget"
      :helps="helps"
      :defaultFunction="`return true`"
      v-model="vIfFunValueVModel"
    />
    <EvalFunctionValueInput
      name="点击事件函数"
      type="mouse-function"
      :editor="editor"
      :widget="widget"
      :helps="helps"
      :defaultFunction="defaultFunction"
      v-model="onClickValueVModel"
    />
  </div>
</template>
<script lang="ts" setup>
import TextLabel from '../../common/TextLabel.vue'
import ArrayValueInput from '../../common/ArrayValueInput.vue'
import { computedVModel } from '../../common/hooks'
import {
  DesignerEditor,
  ActionButtonConfig,
  ElCommonTypeOptions,
  ElCommonSizeOptions,
  WidgetInstance
} from '../designer-editor.type'
import EvalFunctionValueInput from './EvalFunctionValueInput.vue'

export interface ActionButtonValueInputProps {
  editor: DesignerEditor
  widget: WidgetInstance
  helps?: string
  defaultFunction?: string
  isMenuButton?: boolean
  modelValue?: ActionButtonConfig
}

export type ActionButtonValueInputEmits = {
  'update:modelValue': [val?: ActionButtonConfig]
  change: [val?: ActionButtonConfig]
}

const props = defineProps<ActionButtonValueInputProps>()

const emits = defineEmits<ActionButtonValueInputEmits>()

const { valueVModel } = computedVModel({
  get() {
    return props.modelValue ?? {}
  },
  set(val?: any) {
    emits('update:modelValue', val)
    emits('change', val)
  }
})

const { valueVModel: permisValueVModel } = computedVModel({
  get() {
    return valueVModel.value._vIfPermis ?? []
  },
  set(val?: string[]) {
    valueVModel.value = {
      ...valueVModel.value,
      _vIfPermis: val
    }
  }
})

const handlePermisAdd = (index: number) => {
  permisValueVModel.value = permisValueVModel.value.toSpliced(index + 1, 0, '')
}

const handlePermisRemove = (index: number) => {
  permisValueVModel.value = permisValueVModel.value.toSpliced(index, 1)
}

const { valueVModel: vIfFunValueVModel } = computedVModel({
  get() {
    return valueVModel.value._vIfFun
  },
  set(val?: any) {
    valueVModel.value = { ...valueVModel.value, _vIfFun: val }
  }
})

const { valueVModel: onClickValueVModel } = computedVModel({
  get() {
    return valueVModel.value.onClick
  },
  set(val?: any) {
    valueVModel.value = { ...valueVModel.value, onClick: val }
  }
})
</script>

<style lang="scss" scoped></style>
