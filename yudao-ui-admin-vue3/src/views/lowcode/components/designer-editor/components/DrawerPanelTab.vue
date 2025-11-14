<template>
  <el-collapse class="DrawerPanelTab" v-model="activePanels">
    <el-collapse-item v-for="item in collapsePanels" :key="item.name" :name="item.name">
      <template #title>
        <div class="tabTitle">
          <Icon :icon="item.icon ?? 'ep:warning'" :size="16" />
          <span>{{ item.label }}</span>
        </div>
      </template>
      <component :is="item.comp" :editor="editor" />
    </el-collapse-item>
  </el-collapse>
</template>

<script setup lang="ts">
import type { DefineComponent } from 'vue'
import { DesignerEditor } from '../designer-editor.type'

export interface DrawerPanelTabProps {
  editor: DesignerEditor
  panels: Record<string, DefineComponent>
}

const props = defineProps<DrawerPanelTabProps>()

const collapsePanels = computed(() => {
  return Object.entries(props.panels)
    .map(([name, component]) => {
      const { label, icon, order, isShow } = component
      return { label, icon, name, order, comp: component, isShow: isShow ? isShow : () => true }
    })
    .filter((e) => e.isShow(props.editor))
    .sort((a, b) => a.order - b.order)
})

const activePanels = ref(Array.from(collapsePanels.value).map((t) => t.name))
</script>

<style scoped lang="scss">
.DrawerPanelTab {
  height: 100%;
  contain: layout;

  .tabTitle {
    display: flex;
    flex-direction: row;
    align-items: center;
    font-weight: 700;
    gap: 4px;
  }
}
</style>
