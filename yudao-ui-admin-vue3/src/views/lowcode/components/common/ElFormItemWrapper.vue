<template>
  <el-form-item v-bind="$attrs">
    <template v-if="!isEmpty($attrs.helps) && !$attrs.helpsAlwaysShow" #label>
      <TextLabel :label="$attrs.label" :helps="$attrs.helps" />
    </template>
    <slot v-if="$attrs.readonly && slots.readonly" name="readonly"></slot>
    <slot v-else></slot>
    <span
      v-if="!isEmpty($attrs.helps) && $attrs.helpsAlwaysShow"
      class="text-12px mt-4px line-height-12px c-[--el-text-color-placeholder]"
    >
      {{ $attrs.helps }}
    </span>
  </el-form-item>
</template>

<script setup>
import { isEmpty } from '@/utils/is'
import TextLabel from './TextLabel.vue'

const slots = useSlots()
</script>
