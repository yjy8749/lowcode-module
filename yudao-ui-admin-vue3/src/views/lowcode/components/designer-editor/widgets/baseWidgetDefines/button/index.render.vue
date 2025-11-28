<!-- index.render.vue -->
<template>
  <el-button v-bind="buttonAttrs" @click="onClick">
    {{ label }}
  </el-button>
</template>
<script lang="ts" setup>
import { isEmpty } from '@/utils/is'
import { useWidget, type WidgetRenderProps } from '../../hooks'

const message = useMessage()

const props = defineProps<WidgetRenderProps>()

const { usePropValue, usePropAndEvent, useEventBind, toEvalFunction } = useWidget(props)

const label = computed(() => usePropValue('label'))

const buttonAttrs = computed(() => {
  return {
    ...usePropAndEvent({ omit: ['label', 'click', 'showConfirm', 'confirmMsg'] }),
    style: usePropValue('fullSize') ? { width: '100%', height: '100%' } : undefined
  }
})

const onClickHandler = computed(() => toEvalFunction(useEventBind('click')))

const onClick = async (e) => {
  if (usePropValue('showConfirm')) {
    const confirmMsg = usePropValue('confirmMsg')
    await message.confirm(isEmpty(confirmMsg) ? '是否确认执行' : confirmMsg)
  }
  await onClickHandler.value?.(e)
}
</script>
