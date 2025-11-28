<template>
  <template v-if="isPreviewMode">
    <WidgetRender
      v-if="refreshFlag"
      :editor="editor"
      :parent-widget="parentWidget"
      :parent-render-context="parentRenderContext"
      :widget="widget"
      :widget-define="widgetDef"
      :widget-render-context="currWidgetRenderContext"
      :widget-index="widgetIndex"
    />
  </template>
  <template v-else>
    <div
      class="WidgetItem"
      :class="{ focus: isWidgetSelected, hidden: widget._hidden }"
      @click="onItemClick"
      @contextmenu="openContextMenu"
    >
      <el-text v-if="!isEmpty(widgetDef.tips)" type="warning" tag="mark">
        {{ widgetDef.tips }}
      </el-text>

      <WidgetRender
        v-if="refreshFlag"
        :editor="editor"
        :parent-widget="parentWidget"
        :parent-render-context="parentRenderContext"
        :widget="widget"
        :widget-define="widgetDef"
        :widget-render-context="currWidgetRenderContext"
        :widget-index="widgetIndex"
      />

      <div class="label" @click.stop="onLabelClick"> {{ widget.label }} {{ vidOrVar }} </div>

      <div class="action">
        <div v-for="item in widgetAction" :key="`${item.label}`" @click.stop="item.onClick">
          <Icon :size="12" :icon="`${item.icon}`" />
        </div>
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
import { isNullOrUnDef } from '@/utils/is'
import { MenuItem } from '@imengyu/vue3-context-menu'
import { showContextMenu } from '../../common/contextMenu'
import { WidgetItemProps } from '../designer-editor.type'
import {
  regenWidgetRenderContext,
  getWidgetShortVidOrVar,
  copyWidgetVidOrVar
} from '../designer-editor.utils'
import WidgetRender from './WidgetRender.vue'
import {
  useSelectParentMenu,
  useEditPrdMenu,
  useSortDownMenu,
  useSortUpMenu,
  useWidgetCopyMenu,
  useWidgetDeleteMenu,
  useWidgetMenus,
  useOpenWidgetDrawerPanelMenu
} from '../designer-editor.menu'
import { useWidgetDefine } from '../widgets'
import { isEmpty } from 'lodash-es'

const props = defineProps<WidgetItemProps>()

const refreshFlag = ref(true)

const store = props.editor.getStore()

const { isPreviewMode, isDesignMode } = store

const vidOrVar = computed(() => getWidgetShortVidOrVar(props.widget))

const currWidgetRenderContext = computed(() => {
  return regenWidgetRenderContext(
    props.editor,
    props.parentWidget,
    props.parentRenderContext,
    props.options
  )
})

const widgetDef = computed(() => useWidgetDefine(props.widget))

store.putWidgetRenderContext(props.widget._vid, currWidgetRenderContext.value)

const onLabelClick = () => {
  copyWidgetVidOrVar(props.widget)
}

const doRefresh = () => {
  refreshFlag.value = false
  nextTick(() => {
    refreshFlag.value = true
  })
}

const useRefreshMenu = (): MenuItem => {
  return {
    icon: 'ep:refresh',
    label: '刷新',
    onClick: doRefresh
  }
}

const openWidgetPrdForm = inject('openWidgetPrdForm') as Function
const openWidgetTreeDrawer = inject('openWidgetTreeDrawer') as Function
const openWidgetPrdDrawer = inject('openWidgetPrdDrawer') as Function
const openDeployMenuDialog = inject('openDeployMenuDialog') as Function
const openDesignerPageDialog = inject('openDesignerPageDialog') as Function
const openEditorDataDialog = inject('openEditorDataDialog') as Function

const widgetAction = computed<MenuItem[]>(() => {
  const args = {
    parentWidget: props.parentWidget,
    parentRenderContext: props.parentRenderContext,
    widget: props.widget,
    widgetRenderContext: currWidgetRenderContext.value,
    widgetIndex: props.widgetIndex ?? 0,
    options: props.options,
    inject: {
      openWidgetPrdForm,
      openWidgetTreeDrawer,
      openWidgetPrdDrawer,
      openDeployMenuDialog,
      openDesignerPageDialog,
      openEditorDataDialog
    }
  }
  return [
    useSelectParentMenu(props.editor, args),
    useOpenWidgetDrawerPanelMenu(props.editor),
    useEditPrdMenu(args),
    useWidgetCopyMenu(props.editor, args),
    useSortDownMenu(props.editor, args),
    useSortUpMenu(props.editor, args),
    useWidgetDeleteMenu(props.editor, args),
    useRefreshMenu(),
    {
      icon: 'ep:more-filled',
      label: '更多',
      onClick: (e: MouseEvent) => {
        openContextMenu(e)
      }
    }
  ].filter((e) => !e.hidden)
})

const isWidgetSelectable = computed(() => {
  return currWidgetRenderContext.value.options?.selectable ?? true
})

const isWidgetSelected = computed(() => {
  if (isWidgetSelectable.value) {
    return store.state.value.selectedWidgetId == props.widget._vid
  }
  return false
})

const hasSelectedWidget = computed(() => {
  return !isNullOrUnDef(store.state.value.selectedWidgetId)
})

const onItemClick = (e: MouseEvent) => {
  if (!isPreviewMode.value && isWidgetSelectable.value) {
    e.stopPropagation()
    e.preventDefault()
    if (isWidgetSelected.value) {
      store.setSelected()
    } else {
      store.setSelected(props.widget)
    }
  }
}

const openContextMenu = (e: MouseEvent) => {
  if (!isPreviewMode.value && isWidgetSelectable.value) {
    e.preventDefault()
    if (!hasSelectedWidget.value) {
      store.setSelected(props.widget)
    }
    if (isWidgetSelected.value) {
      e.stopPropagation()
      nextTick(() => {
        showContextMenu(
          e,
          useWidgetMenus(props.editor, {
            parentWidget: props.parentWidget,
            parentRenderContext: props.parentRenderContext,
            widget: props.widget,
            widgetRenderContext: currWidgetRenderContext.value,
            widgetIndex: props.widgetIndex,
            options: props.options,
            widgetMenus: [useRefreshMenu()],
            inject: {
              openWidgetPrdForm,
              openWidgetTreeDrawer,
              openWidgetPrdDrawer,
              openDeployMenuDialog,
              openDesignerPageDialog,
              openEditorDataDialog
            }
          })
        )
      })
    }
  }
}
// 右键菜单 end

if (isDesignMode.value) {
  watch(
    () => store.state.value.locationWidgetId,
    () => {
      const locationWidgetId = store.state.value.locationWidgetId
      if (!isNullOrUnDef(locationWidgetId) && locationWidgetId == props.widget._vid) {
        store.setSelected(props.widget)
      }
    }
  )
}

watch(
  () => store.state.value.refreshWidgetId,
  () => {
    const refreshWidgetId = store.state.value.refreshWidgetId
    if (!isNullOrUnDef(refreshWidgetId) && refreshWidgetId == props.widget._vid) {
      doRefresh()
    }
  }
)
</script>

<style scoped lang="scss">
.WidgetItem {
  position: relative;
  cursor: move;

  .label {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 99;
    display: none;
    padding: 2px 5px;
    font-size: 12px;
    color: #fff;
    background: #409eff99;

    &:hover {
      background: #409eff;
    }
  }

  .action {
    position: absolute;
    right: 0;
    bottom: 0;
    z-index: 99;
    display: none;
    padding: 0 4px;
    color: #fff;
    cursor: pointer;
    background: #409eff99;
    align-items: center;

    &:hover {
      background: #409eff;
    }

    div {
      padding: 2px 4px;
    }
  }

  &.focus {
    z-index: 99;
    outline: 2px solid #409eff;

    > .label {
      display: block;
    }

    > .action {
      display: flex;
    }
  }
}
</style>
