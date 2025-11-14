<template>
  <div class="flex flex-col gap-2">
    <EmptyText v-if="isEmpty(widgetPrdDataList)" />
    <el-card
      v-for="item in widgetPrdDataList"
      :key="item._vid"
      class="!bg-#fcef70"
      shadow="hover"
      :style="{ color: item.prd.color }"
      @contextmenu.stop="(e) => openContextMenu(e, item)"
    >
      {{ item.prd.content }}
    </el-card>
  </div>
</template>
<script lang="ts" setup>
import { showContextMenu } from '../../common/contextMenu'
import { DesignerEditor, WidgetInstance } from '../designer-editor.type'
import { useWidgetTree } from '../designer-editor.utils'
import { writeWidgetValueCmd } from '../designer-editor.cmd'
import EmptyText from '../../common/EmptyText.vue'
import { isEmpty } from '@/utils/is'

const props = defineProps<{ editor: DesignerEditor }>()

const message = useMessage()
const store = props.editor.getStore()

const openWidgetPrdForm = inject('openWidgetPrdForm') as Function

const widgetPrdDataList = computed(() => {
  const result: any[] = []
  const readPrdToList = (list?: WidgetInstance[]) => {
    list?.forEach((i) => {
      if (i.prd?.content) {
        result.push({ _vid: i._vid, widget: i, prd: i.prd })
      }
      readPrdToList(i.slots)
      readPrdToList(i.slotChildren)
    })
  }
  readPrdToList(useWidgetTree(props.editor))
  return result
})

const openContextMenu = (e: MouseEvent, args: any) => {
  showContextMenu(e, [
    {
      icon: 'ep:aim',
      label: '定位',
      onClick: () => {
        store.setLocation({ widgetId: args._vid })
      }
    },
    {
      icon: 'ep:edit',
      label: '编辑',
      onClick: () => {
        openWidgetPrdForm?.(args.widget)
      }
    },
    {
      icon: 'ep:delete',
      label: '删除',
      onClick: async () => {
        await message.confirm('是否确认删除?')
        props.editor.executeCmd(
          writeWidgetValueCmd(props.editor, {
            widget: args.widget,
            key: 'prd',
            value: undefined
          })
        )
      }
    }
  ])
}
</script>
