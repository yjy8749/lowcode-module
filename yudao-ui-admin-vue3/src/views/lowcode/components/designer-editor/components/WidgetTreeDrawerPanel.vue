<template>
  <div>
    <el-tree
      :data="nodeTreeData"
      :props="nodeTreeProps"
      :default-expand-all="true"
      :highlight-current="true"
      :expand-on-click-node="false"
      node-key="_vid"
      :current-node-key="selectedWidgetId"
      @node-click="handleNodeClick"
      @node-contextmenu="handleNodeContextmenu"
    >
      <template #default="{ data }">
        <div class="flex-1 p-1 flex justify-between">
          {{ data.label }}
          <div class="flex gap-1 justify-end">
            <el-tag size="small" effect="dark" round type="primary" v-if="data.hasPrd">
              PRD
            </el-tag>
            <el-tag size="small" effect="dark" round type="warning" v-if="data.hasDataDefine">
              DATA
            </el-tag>
          </div>
        </div>
      </template>
    </el-tree>
  </div>
</template>
<script lang="ts" setup>
import { isEmpty } from '@/utils/is'
import { showContextMenu } from '../../common/contextMenu'
import { DesignerEditor, WidgetInstance } from '../designer-editor.type'
import { useWidgetById, useWidgetContext, useWidgetTree } from '../designer-editor.utils'
import { useWidgetMenus } from '../designer-editor.menu'

const props = defineProps<{ editor: DesignerEditor }>()

const store = props.editor.getStore()

const selectedWidgetId = computed(() => store.state.value.selectedWidgetId)

const convertToTreeNode = (array: WidgetInstance[], parentId?: string) => {
  const result: any[] = []
  array.forEach((i, index) => {
    result.push({
      _vid: i._vid,
      label: i.label,
      parentId,
      hasPrd: !isEmpty(i.prd?.content),
      hasDataDefine: !isEmpty(i.dataDefines),
      index,
      children: convertToTreeNode([...i.slotChildren, ...i.slots], i._vid)
    })
  })
  return result
}

const nodeTreeData = computed(() => convertToTreeNode(useWidgetTree(props.editor)))

const nodeTreeProps = {
  children: 'children',
  label: 'label'
}

const openWidgetPrdForm = inject('openWidgetPrdForm') as Function
const openWidgetTreeDrawer = inject('openWidgetTreeDrawer') as Function
const openWidgetPrdDrawer = inject('openWidgetPrdDrawer') as Function

const handleNodeClick = (data: any) => {
  store.setLocation({ widgetId: data._vid })
}
const handleNodeContextmenu = (e, data: any) => {
  const parentWidget = useWidgetById(props.editor, data.parentId)
  const parentContext = useWidgetContext(props.editor, data.parentId)
  const widget = useWidgetById(props.editor, data._vid)
  const widgetContext = useWidgetContext(props.editor, data._vid)
  store.setSelected(widget)
  nextTick(() => {
    showContextMenu(
      e,
      useWidgetMenus(props.editor, {
        parentWidget,
        parentContext,
        widget,
        widgetContext,
        widgetIndex: data.index,
        widgetMenus: [
          {
            icon: 'ep:refresh',
            label: '刷新',
            onClick: () => {
              props.editor.getStore().setRefresh(widget)
            }
          }
        ],
        inject: {
          openWidgetPrdForm,
          openWidgetTreeDrawer,
          openWidgetPrdDrawer
        }
      })
    )
  })
}
</script>
