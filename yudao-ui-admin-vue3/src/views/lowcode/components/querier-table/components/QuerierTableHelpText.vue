<template>
  <el-alert type="success" show-icon>
    <template #title>
      <div @click.stop="goToUrl">
        {{ title ? '【' + (title ?? '') + '】' : '' }}{{ content ?? '' }}
      </div>
    </template>
  </el-alert>
</template>
<script lang="ts" setup>
import { isEmpty } from '@/utils/is'
import { QuerierTableHelpTextProps } from '../querier-table.type'

const props = defineProps<QuerierTableHelpTextProps>()

const goToUrl = () => {
  if (!isEmpty(props.url)) {
    window.open(props.url)
  }
}
</script>

<style lang="scss" scoped>
.el-alert--success.is-light {
  margin-bottom: 10px;
  cursor: pointer;
  border: 1px solid green;
}
</style>
