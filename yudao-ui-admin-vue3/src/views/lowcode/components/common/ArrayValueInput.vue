<template>
  <div class="w-full">
    <ArrayValueInputHeader
      v-if="inline && headers"
      :headers="headers"
      :readonly="readonly"
      :list="valueVModel"
    />
    <DraggableContainer :sort="sortable" :group="group" :item-key="itemKey" v-model="valueVModel">
      <template #item="{ index }">
        <div
          class="flex items-center gap-2"
          :class="{
            'mb-1': index != valueVModel.length - 1,
            'flex-col': !inline
          }"
        >
          <template v-if="inline">
            <div
              class="flex flex-col justify-evenly"
              v-if="sort && !readonly && (index != 0 || index != valueVModel.length - 1)"
            >
              <Icon
                v-if="index != 0"
                class="cursor-pointer c-[--el-color-primary]"
                icon="ep:arrow-up-bold"
                :size="11"
                @click="() => handleSortUp(index)"
              />
              <Icon
                v-if="index != valueVModel.length - 1"
                class="cursor-pointer c-[--el-color-primary]"
                icon="ep:arrow-down-bold"
                :size="11"
                @click="() => handleSortDown(index)"
              />
            </div>
            <slot name="item" :index="index" :data="valueVModel[index]"></slot>
            <div class="flex flex-col justify-evenly" v-if="!readonly">
              <Icon
                v-if="isAddable(index)"
                class="cursor-pointer c-[--el-color-primary]"
                icon="ep:circle-plus"
                :size="11"
                @click="() => handleAdd(index)"
              />
              <Icon
                v-if="isRrmoveable(index)"
                class="cursor-pointer c-[--el-color-primary]"
                icon="ep:remove"
                :size="11"
                @click="() => handleRemove(index)"
              />
            </div>
          </template>
          <template v-else>
            <el-card class="w-full" shadow="hover">
              <template #header>
                <div class="flex justify-between">
                  <span>{{ `${headerNamePrefix ?? ''} #${index + 1}`.trim() }}</span>
                  <el-button-group class="!flex" v-if="!readonly">
                    <el-button
                      v-if="sort && index != 0"
                      link
                      size="small"
                      type="primary"
                      @click="() => handleSortUp(index)"
                    >
                      <Icon icon="ep:arrow-up-bold" :size="12" />上移
                    </el-button>
                    <el-button
                      v-if="sort && index != valueVModel.length - 1"
                      link
                      size="small"
                      type="primary"
                      @click="() => handleSortDown(index)"
                    >
                      <Icon icon="ep:arrow-down-bold" :size="12" />下移
                    </el-button>
                    <el-button
                      v-if="isRrmoveable(index)"
                      link
                      size="small"
                      type="primary"
                      @click="() => handleRemove(index)"
                    >
                      <Icon icon="ep:remove" :size="12" />删除
                    </el-button>
                    <el-button
                      v-if="isAddable(index)"
                      link
                      size="small"
                      type="primary"
                      @click="() => handleAdd(index)"
                    >
                      <Icon icon="ep:circle-plus" :size="12" />增加
                    </el-button>
                  </el-button-group>
                </div>
              </template>
              <slot name="item" :index="index" :data="valueVModel[index]"></slot>
            </el-card>
          </template>
        </div>
      </template>
    </DraggableContainer>
    <div v-if="isEmpty(valueVModel)" class="flex items-center gap-1">
      <slot v-if="hasEmptySlot" name="empty"></slot>
      <EmptyText v-else-if="readonly" />
      <Icon
        v-if="!readonly"
        class="cursor-pointer c-[--el-color-primary]"
        icon="ep:circle-plus"
        @click="() => handleAdd(0)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import ArrayValueInputHeader, { ArrayValueInputHeaderData } from './ArrayValueInputHeader.vue'
import { generateVForKey } from './utils'
import { isNullOrUnDef, isEmpty, isFunction } from '@/utils/is'
import EmptyText from './EmptyText.vue'
import DraggableContainer, { DraggableContainerGroup } from './DraggableContainer.vue'
import { computedVModel } from './hooks'

export interface ArrayValueInputProps {
  inline?: boolean
  itemKey?: string
  sort?: boolean
  group?: string | DraggableContainerGroup
  readonly?: boolean
  maxLength?: number
  minLength?: number
  addable?: boolean | ((val?: any, index?: number) => boolean)
  removeable?: boolean | ((val?: any, index?: number) => boolean)
  headerNamePrefix?: string
  headers?: ArrayValueInputHeaderData[]
  modelValue?: any[]
}

export type ArrayValueInputEmits = {
  'update:modelValue': [val?: any[]]
  change: [val?: any[]]
  add: [index: number]
  remove: [index: number]
}

const props = withDefaults(defineProps<ArrayValueInputProps>(), {
  modelValue: () => [],
  itemKey: '__key__',
  sort: true,
  readonly: false,
  inline: true,
  addable: true,
  removeable: true
})

const emits = defineEmits<ArrayValueInputEmits>()

const { valueVModel, triggerValidate } = computedVModel({
  get() {
    return generateVForKey(props.modelValue, false, props.itemKey)
  },
  set(val?: any[]) {
    emits('update:modelValue', val)
    emits('change', val)
  }
})

const message = useMessage()

const sortable = computed(() => props.sort && !props.readonly)

const isAddable = (index: number) => {
  if (isFunction(props.addable)) {
    return props.addable(valueVModel.value[index], index)
  }
  return props.addable
}

const isRrmoveable = (index: number) => {
  if (isFunction(props.removeable)) {
    return props.removeable(valueVModel.value[index], index)
  }
  return props.removeable
}

const hasEmptySlot = computed(() => useSlots().empty)

const handleAdd = (index: number) => {
  if (!isNullOrUnDef(props.maxLength) && valueVModel.value.length >= props.maxLength) {
    message.error(`最多添加${props.maxLength}条数据`)
    return
  }
  emits('add', index)
  nextTick(() => {
    triggerValidate()
  })
}
const handleRemove = (index: number) => {
  if (!isNullOrUnDef(props.minLength) && valueVModel.value.length <= props.minLength) {
    message.error(`至少保留${props.minLength}条数据`)
    return
  }
  emits('remove', index)
  nextTick(() => {
    triggerValidate()
  })
}

const handleSortUp = (index: number) => {
  if (index > 0) {
    const vals = [...valueVModel.value]
    ;[vals[index - 1], vals[index]] = [vals[index], vals[index - 1]]
    valueVModel.value = vals
    triggerValidate()
  }
}
const handleSortDown = (index: number) => {
  if (index < valueVModel.value.length - 1) {
    const vals = [...valueVModel.value]
    ;[vals[index], vals[index + 1]] = [vals[index + 1], vals[index]]
    valueVModel.value = vals
    triggerValidate()
  }
}
</script>

<style scoped lang="scss"></style>
