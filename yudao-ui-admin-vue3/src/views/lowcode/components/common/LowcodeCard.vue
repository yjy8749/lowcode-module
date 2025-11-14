<template>
  <div class="LowcodeCard">
    <div class="min-h-8 px-2 flex justify-between items-center bg-#000">
      <div class="flex items-center gap-1 c-#fff">
        {{ name }}
        <el-tooltip placement="bottom" v-if="!isEmpty(helps)">
          <div class="ml-2px mt-2px">
            <Icon icon="ep:question-filled" :size="14" />
          </div>
          <template #content>
            <div class="max-w-125" v-html="helps"> </div>
          </template>
        </el-tooltip>
      </div>
      <div class="flex-1 flex justify-end gap-1">
        <template v-for="item in actionList" :key="item.__key__">
          <el-button
            v-if="item.isShow"
            class="!m-0"
            size="small"
            :link="true"
            :type="item.type"
            @click="item.onClick"
          >
            {{ item.label }}
          </el-button>
        </template>
      </div>
    </div>
    <div class="p-2 font-size-14px line-height-24px pos-relative">
      <slot></slot>
      <div v-if="tips" class="tips">{{ tips }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { generateVForKey } from './utils'
import { isEmpty } from '@/utils/is'

export interface LowcodeCardProps {
  name?: string
  tips?: string
  helps?: string
  actions?: LowcodeCardAction[]
}

export interface LowcodeCardAction {
  type?: string
  label?: string | ComputedRef<string>
  isShow?: boolean | ComputedRef<boolean>
  onClick?: () => void
}

const props = withDefaults(defineProps<LowcodeCardProps>(), {
  actions: () => []
})

const actionList = computed(() => {
  return generateVForKey(props.actions).map((e) => {
    return { ...e, isShow: e.isShow ?? true }
  })
})
</script>

<style scoped lang="scss">
.LowcodeCard {
  width: 100%;
  overflow: auto;
  background-color: #e3e4e5;
  border: 1px solid #303133;
  border-radius: 8px; /* 8px */

  .tips {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 100;
    padding: 4px;
    font-size: 12px;
    line-height: 12px;
    color: #fff;
    background: #e6a23c;
    border-bottom-left-radius: 4px;
  }
}
</style>
