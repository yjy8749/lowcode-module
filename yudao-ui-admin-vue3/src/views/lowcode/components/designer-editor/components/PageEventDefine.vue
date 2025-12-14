<template>
  <ArrayValueInput
    :group="{ pull: false, put: false }"
    v-model="valueVModel"
    @add="handleAdd"
    @remove="handleRemove"
  >
    <template #item="{ index }">
      <MultiValueInput
        clearable
        :keys="['key', 'label', 'helps']"
        :placeholder="['事件KEY', '事件名称', '帮助提示']"
        v-model="valueVModel[index]"
        @change="triggerUpdate"
      />
    </template>
  </ArrayValueInput>
</template>

<script setup lang="ts">
import { cloneDeep } from 'lodash-es'
import { isEmpty } from '@/utils/is'
import { generateVForKey } from '../../common/utils'
import ArrayValueInput from '../../common/ArrayValueInput.vue'
import MultiValueInput from '../../common/MultiValueInput.vue'
import { readEditorDataValue } from '../designer-editor.utils'
import { DesignerEditor, DesignerEditorEventDefine } from '../designer-editor.type'
import { writeEditorDataValueCmd } from '../designer-editor.cmd'
import { computedVModel } from '../../common/hooks'

const props = defineProps<{ editor: DesignerEditor }>()

const message = useMessage()

const readEvents = (force?: boolean) => {
  return cloneDeep(generateVForKey(readEditorDataValue(props.editor, 'events') ?? [], force))
}

const cacheValue = ref(readEvents())

const isKeyValid = (vals: DesignerEditorEventDefine[]): string | undefined => {
  const seen = new Set()
  for (const item of vals) {
    if (!isEmpty(item.key)) {
      if (['onBeforeMount', 'onMounted', 'onBeforeUnmount', 'onUnmounted'].includes(item.key)) {
        return `事件Key${item.key}无效`
      }
      if (seen.has(item.key)) {
        return `事件Key${item.key}已存在，请勿重复添加`
      }
      seen.add(item.key)
    }
  }
}

const { valueVModel, triggerUpdate } = computedVModel({
  get() {
    return cacheValue.value
  },
  set(val?: DesignerEditorEventDefine[]) {
    const validMsg = isKeyValid(val ?? [])
    if (!isEmpty(validMsg)) {
      cacheValue.value = readEvents(true)
      return message.error(validMsg ?? '')
    } else {
      props.editor.executeCmd(
        writeEditorDataValueCmd(props.editor, {
          key: 'events',
          value: val
        })
      )
    }
  }
})

watch(
  () => readEditorDataValue(props.editor, 'events'),
  () => {
    cacheValue.value = readEvents(true)
  }
)
const handleAdd = (index: number) => {
  valueVModel.value = valueVModel.value.toSpliced(index + 1, 0, {})
}

const handleRemove = (index: number) => {
  valueVModel.value = valueVModel.value.toSpliced(index, 1)
}
</script>

<style scoped lang="scss"></style>
