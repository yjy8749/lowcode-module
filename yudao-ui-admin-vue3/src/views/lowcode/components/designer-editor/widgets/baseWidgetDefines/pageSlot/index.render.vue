<!-- index.render.vue -->
<template>
  <div
    v-if="!isPreviewMode"
    class="w-full h-full flex justify-center items-center gap-2 p-1 bg-[--el-color-info]"
  >
    <TextLabel
      class="!c-#fff"
      placement="top"
      :label="`${slotName} 插槽`"
      :helps="`可通过 ${slotName} 插槽传入内容, 动态渲染`"
    />
    <div class="flex-1">
      <el-text class="!c-#fff"> 绑定数据： {{ scope || '未绑定' }}</el-text>
    </div>
  </div>
  <component v-else :is="slotRender" :key="widget._vid" :scope="scope" />
</template>
<script lang="ts" setup>
import { isEmpty } from '@/utils/is'
import { useWidget, type WidgetRenderProps } from '../../hooks'
import TextLabel from '../../../../common/TextLabel.vue'

const props = defineProps<WidgetRenderProps>()

const { isPreviewMode, usePropValue, editor } = useWidget(props)

const scope = computed(() => usePropValue('scope'))

const slotName = computed(() => {
  let name = usePropValue('slotName')
  name = isEmpty(name) ? props.widget._var : name
  name = isEmpty(name) ? props.widget._vid : name
  return name
})

const slots = editor.getPageSlots()

const slotRender = ({ scope }) => {
  return h(slots[slotName.value], { scope })
}
</script>
