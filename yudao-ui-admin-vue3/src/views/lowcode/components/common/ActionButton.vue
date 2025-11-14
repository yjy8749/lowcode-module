<template>
  <el-button
    v-if="isShow"
    :type="type"
    :size="size"
    :plain="plain"
    :link="link"
    :loading="loading"
    @click="doClick"
  >
    <Icon :class="{ 'mr-5px': !isEmpty(label) }" :icon="icon" v-if="!isEmpty(icon)" />
    {{ label }}
  </el-button>
</template>
<script lang="ts" setup>
import { ButtonType, ComponentSize } from 'element-plus'
import { isNullOrUnDef, isEmpty } from '@/utils/is'
import { computedAsync } from '@vueuse/core'
import { isPromise } from './utils'

export interface ActionButtonProps {
  type?: ButtonType
  label?: string
  icon?: string
  onClick?: (...args: any[]) => void | Promise<void>
  isShow?: (...args: any[]) => boolean | Promise<boolean>
  size?: ComponentSize
  plain?: boolean
  link?: boolean
}

export type ActionButtonEmits = {
  click: [e: MouseEvent]
}

const props = withDefaults(defineProps<ActionButtonProps>(), { type: 'primary' })

const emits = defineEmits<ActionButtonEmits>()

const loading = ref(false)

const doClick = async (e) => {
  try {
    loading.value = true
    await props.onClick?.(e)
  } finally {
    loading.value = false
  }
}

const isShow = computedAsync(async () => {
  if (!isNullOrUnDef(props.isShow)) {
    const result = props.isShow()
    return isPromise(result) ? await result : result
  }
  return true
}, false)
</script>
