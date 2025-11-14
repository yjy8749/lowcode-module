<template>
  <div class="w-full flex gap-2">
    <div class="w-11px" v-if="sort && !readonly && list.length > 1"></div>
    <div
      v-for="item in headers"
      :key="item.label"
      class="flex justify-center items-center gap-1"
      :style="item.style"
    >
      <TextLabel :label="item.label" :helps="item.helps" />
    </div>
    <div class="w-11px" v-if="!readonly"></div>
  </div>
</template>
<script lang="ts" setup>
import TextLabel from './TextLabel.vue'

export interface ArrayValueInputHeaderData {
  label?: string
  style?: string
  helps?: string
}

export interface ArrayValueInputHeaderProps {
  headers?: ArrayValueInputHeaderData[]
  sort?: boolean
  readonly?: boolean
  list?: any[]
}

withDefaults(defineProps<ArrayValueInputHeaderProps>(), {
  list: () => [],
  sort: true,
  readonly: false
})
</script>
