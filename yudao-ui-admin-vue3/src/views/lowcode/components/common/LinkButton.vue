<template>
  <el-button link :type="type" @click.stop="() => click?.()">
    <Icon :icon="icon" v-if="icon" />
    {{ label ?? '' }}
  </el-button>
</template>
<script lang="ts" setup>
import { ButtonType } from 'element-plus'
export interface LinkButtonProps {
  label?: string
  icon?: string
  type?: ButtonType
  click?: () => void
}

withDefaults(defineProps<LinkButtonProps>(), { type: 'primary' })
</script>
