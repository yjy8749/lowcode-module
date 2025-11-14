<template>
  <el-tabs type="border-card" stretch v-model="activeTab">
    <el-tab-pane name="props" label="属性">
      <DrawerPanelTab :editor="editor" :panels="widgetPropsTabPane" />
    </el-tab-pane>
    <el-tab-pane name="datas" label="数据&绑定">
      <DrawerPanelTab :editor="editor" :panels="widgetDataTabPane" />
    </el-tab-pane>
    <el-tab-pane name="events" label="事件&绑定">
      <DrawerPanelTab :editor="editor" :panels="widgetEventTabPane" />
    </el-tab-pane>
    <el-tab-pane name="others" label="其他">
      <DrawerPanelTab :editor="editor" :panels="widgetOtherTabPane" />
    </el-tab-pane>
  </el-tabs>
</template>
<script setup lang="ts">
import { useTablePanes } from './tabPanes'
import DrawerPanelTab from './DrawerPanelTab.vue'
import { DesignerEditor } from '../designer-editor.type'

const props = defineProps<{ editor: DesignerEditor }>()

const activeTab = ref('props')

const widgetPropsTabPane = computed(() => {
  return useTablePanes()['widgetPropsTabPane'] ?? {}
})

const widgetDataTabPane = computed(() => {
  return useTablePanes()['widgetDataTabPane'] ?? {}
})

const widgetEventTabPane = computed(() => {
  return useTablePanes()['widgetEventTabPane'] ?? {}
})

const widgetOtherTabPane = computed(() => {
  return useTablePanes()['widgetOtherTabPane'] ?? {}
})

const store = props.editor.getStore()

watch(
  () => store.state.value.locationDataId,
  () => {
    activeTab.value = 'datas'
  }
)
</script>
