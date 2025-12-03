<!-- index.render.vue -->
<template>
  <ContentWrap class="treeView h-1/1">
    <div class="flex gap-1">
      <el-input class="mb-20px" clearable placeholder="搜索" v-model="searchValue">
        <template #prefix>
          <Icon icon="ep:search" />
        </template>
      </el-input>
      <ActionButton v-if="createButton" v-bind="createButton" />
    </div>
    <el-tree
      ref="treeRef"
      node-key="id"
      class="w-full"
      v-bind="treeAttrs"
      :data="treeData"
      :props="defaultProps"
      :load="loadLazy"
      :filter-node-method="treeFilter"
      @node-click="onNodeClick"
      @node-contextmenu.stop.prevent="showMenu"
    >
      <template #default="{ data }">
        <div class="w-full flex justify-between items-center" v-loading="nodeLoading[data.id]">
          <span class="flex-1 text-wrap">{{ data.name }}</span>
          <div class="px-2">
            <Icon
              v-if="!isEmpty(menuButtons)"
              :size="12"
              icon="ep:more-filled"
              @click.stop.prevent="(e) => showMenu(e, data)"
            />
          </div>
        </div>
      </template>
    </el-tree>
  </ContentWrap>
</template>

<script setup lang="ts">
import ActionButton from '../../../../common/ActionButton.vue'
import { handleTree, defaultProps } from '@/utils/tree'
import { useWidget, type WidgetRenderProps } from '../../hooks'
import { isEmpty } from 'lodash-es'
import { ElTree } from 'element-plus'
import { showContextMenu } from '../../../../common/contextMenu'
import { isPromise } from '../../../../common/utils'

const props = defineProps<WidgetRenderProps>()

const {
  isPreviewMode,
  toEvalFunction,
  usePropAndEvent,
  usePropValue,
  toActionButtonProps,
  refresh,
  exposeContext,
  useEventBind
} = useWidget(props)

const treeAttrs = computed(() => {
  return usePropAndEvent({
    omit: ['loadData', 'createButton', 'menuButtons', 'node-click']
  })
})

const loadDataFunction = computed(() => toEvalFunction(usePropValue('loadData')))

const createButton = computed(() => toActionButtonProps(usePropValue('createButton')))

const menuButtons = computed(() => toActionButtonProps(usePropValue('menuButtons')))

const hasMenuButtons = computed(() => !isEmpty(menuButtons))

const nodeLoading = ref<Record<number, boolean>>({})

const list = ref<any[]>([])

const treeData = computed(() => handleTree(list.value))

const loadLazy = async (node, resolve, reject) => {
  try {
    resolve((await loadDataFunction.value?.(node)) ?? [])
  } catch (e) {
    console.error(e)
    reject()
  }
}

const treeRef = ref<InstanceType<typeof ElTree>>()

const searchValue = ref('')

const treeFilter = (name: string, data: Tree) => {
  if (isEmpty(name)) return true
  return data.name.includes(name)
}

watch(
  () => searchValue.value,
  () => {
    treeRef.value?.filter(searchValue.value)
  }
)

if (!isPreviewMode.value) {
  watch(
    () => loadDataFunction.value,
    () => {
      refresh()
    }
  )
}

onMounted(async () => {
  if (!treeAttrs.value.lazy) {
    list.value = await loadDataFunction.value?.()
  }
})

const showMenu = async (e: MouseEvent, data) => {
  if (hasMenuButtons.value) {
    try {
      nodeLoading.value[data.id] = true
      const filtedMenuButtons = await Promise.all(
        menuButtons.value.map(async (item) => {
          if (!item.isShow) return { ...item, hidden: false }
          try {
            const result = item.isShow(data)
            return {
              ...item,
              hidden: !(await (isPromise(result) ? result : Promise.resolve(result)))
            }
          } catch {
            return { ...item, hidden: true }
          }
        })
      )
      showContextMenu(e, [
        { label: data.name, disabled: true },
        ...filtedMenuButtons.map((i) => {
          return {
            label: i.label,
            icon: i.icon,
            hidden: i.hidden,
            onClick: () => {
              i.onClick?.(data)
            }
          }
        })
      ])
    } finally {
      nodeLoading.value[data.id] = false
    }
  }
}

const onNodeClickHandler = computed(() => toEvalFunction(useEventBind('node-click')))

const lastSelectNodeKey = ref<any>()

const onNodeClick = async (row: any) => {
  const key = treeRef.value?.getCurrentKey()
  if (lastSelectNodeKey.value == key) {
    treeRef.value?.setCurrentKey()
    lastSelectNodeKey.value = undefined
    await onNodeClickHandler.value?.()
  } else {
    lastSelectNodeKey.value = key
    await onNodeClickHandler.value?.(row)
  }
}

exposeContext({
  refresh: () => refresh()
})
</script>
<style lang="scss" scoped>
.treeView {
  :deep(.el-tree-node__content) {
    height: auto;
    min-height: var(--el-tree-node-content-height);
  }
}
</style>
