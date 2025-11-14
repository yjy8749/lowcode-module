<template>
  <div class="flex text-14px c-[--el-text-color-regular]">
    <span>{{ label ?? '' }}</span>
    <el-tooltip :placement="placement" v-if="!isEmpty(helps)">
      <div class="ml-2px mt-2px">
        <Icon icon="ep:question-filled" :size="14" />
      </div>
      <template #content>
        <div class="max-w-65" v-html="helps"> </div>
      </template>
    </el-tooltip>
  </div>
</template>
<script lang="ts" setup>
import { isEmpty } from '@/utils/is'

export interface TextLabelProps {
  label?: string
  helps?: string
  placement?: 'top' | 'right' | 'bottom' | 'left'
}

withDefaults(defineProps<TextLabelProps>(), { placement: 'right' })
</script>
