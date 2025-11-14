<template>
  <el-tabs type="border-card" stretch v-model="activeTab">
    <el-tab-pane name="props" label="属性">
      <DrawerPanelTab :editor="editor" :panels="pageConfigTabPane" />
    </el-tab-pane>
    <el-tab-pane name="datas" label="数据&执行">
      <DrawerPanelTab :editor="editor" :panels="pageDataTabPane" />
    </el-tab-pane>
    <el-tab-pane name="events" label="事件&绑定">
      <DrawerPanelTab :editor="editor" :panels="pageEventTabPane" />
    </el-tab-pane>
    <el-tab-pane name="others" label="其他">
      <DrawerPanelTab :editor="editor" :panels="pageOtherTabPane" />
    </el-tab-pane>
  </el-tabs>
</template>
<script setup lang="ts">
import { useTablePanes } from './tabPanes'
import DrawerPanelTab from './DrawerPanelTab.vue'
import { DesignerEditor } from '../designer-editor.type'

defineProps<{ editor: DesignerEditor }>()

const activeTab = ref('props')

const pageConfigTabPane = computed(() => {
  return useTablePanes()['pageConfigTabPane'] ?? {}
})

const pageDataTabPane = computed(() => {
  return useTablePanes()['pageDataTabPane'] ?? {}
})

const pageEventTabPane = computed(() => {
  return useTablePanes()['pageEventTabPane'] ?? {}
})

const pageOtherTabPane = computed(() => {
  return useTablePanes()['pageOtherTabPane'] ?? {}
})
</script>
