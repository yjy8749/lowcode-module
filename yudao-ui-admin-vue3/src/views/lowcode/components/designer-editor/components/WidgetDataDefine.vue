<template>
  <div class="w-full flex flex-col justify-center">
    <WidgetDataDefineCard
      v-for="item in unsortableDataDefines"
      :key="item._vid"
      class="mb-2"
      :editor="editor"
      :widget="widget"
      :data-define="item"
      @edit="() => doOpenDefineForm(item)"
      @copy="() => doOpenDefineForm(item, true)"
    />
    <DraggableContainer item-key="_vid" :model-value="sortableDataDefines" @change="onDragChange">
      <template #item="{ element }">
        <WidgetDataDefineCard
          class="mb-2"
          :editor="editor"
          :widget="widget"
          :data-define="element"
          @edit="() => doOpenDefineForm(element)"
          @copy="() => doOpenDefineForm(element, true)"
        />
      </template>
    </DraggableContainer>
    <el-button type="primary" link @click="() => doOpenDefineForm()"> 新增定义 </el-button>
  </div>
</template>

<script setup lang="ts">
import { isNullOrUnDef, isEmpty } from '@/utils/is'
import { useMessage } from '@/hooks/web/useMessage'
import {
  WidgetRenderContext,
  CheckDataDefineResult,
  WidgetDataDefine,
  WidgetDefine,
  WidgetInstance,
  DesignerEditor
} from '../designer-editor.type'
import { batchCmd, writeWidgetValueCmd } from '../designer-editor.cmd'
import {
  buildDataDefineRefreshCmd,
  seekDataDefine,
  checkDataDefineAreRefed,
  useWidgetById,
  promiseWithLoading,
  useWidgetDataDefinesAndRuntime,
  useWidgetDataDefines
} from '../designer-editor.utils'
import { useDataDefineExecutor } from '../components/dataDefine/hooks'
import DraggableContainer from '../../common/DraggableContainer.vue'
import WidgetDataDefineCard from './WidgetDataDefineCard.vue'

export interface WidgetDataDefineProps {
  editor: DesignerEditor
  widget: WidgetInstance
  context: WidgetRenderContext
  widgetDefine: WidgetDefine
  widgetTree: WidgetInstance[]
}

const props = defineProps<WidgetDataDefineProps>()

const message = useMessage()

const widgetDataDefines = computed(() => {
  return useWidgetDataDefinesAndRuntime(props.editor, props.widget)
})

const unsortableDataDefines = computed(() => {
  return widgetDataDefines.value.filter((i) => i._type == 'runtime')
})

const sortableDataDefines = computed(() => {
  return widgetDataDefines.value.filter((i) => i._type != 'runtime')
})

const openDataDefineForm = inject('openDataDefineForm') as Function

const dataDefineExecutor = useDataDefineExecutor(props.editor)

// 编辑&新增定义
const doOpenDefineForm = async (dataDefine?: WidgetDataDefine, isCopy?: boolean) => {
  doSubmitDefineForm(
    await openDataDefineForm({
      title: '数据模型定义',
      widget: props.widget,
      context: props.context,
      widgetDefine: props.widgetDefine,
      widgetTree: props.widgetTree,
      dataDefine,
      isCopy
    })
  )
}

// 构建组件刷新Cmd
const buildRefreshRefedCmd = (bind: CheckDataDefineResult) => {
  const widget = useWidgetById(props.editor, bind.refedWidgetId)
  if (!isNullOrUnDef(widget)) {
    const dataDefine = seekDataDefine(props.editor, [widget], { _vid: bind.refedDataId })
    return {
      cmd: buildDataDefineRefreshCmd(props.editor, widget, dataDefine),
      executor: useDataDefineExecutor(props.editor, { dataDefine })
    }
  }
}

// 编辑&新增定义 submit
const doSubmitDefineForm = (dataDefine: WidgetDataDefine) => {
  const dataDefineList = useWidgetDataDefines(props.widget)
  const index = dataDefineList.findIndex((e) => e._vid == dataDefine._vid)
  const oldDataDefine: WidgetDataDefine | undefined = dataDefineList[index]
  if (index < 0) {
    dataDefineList.push(dataDefine)
  } else {
    dataDefineList[index] = dataDefine
  }

  props.editor.executeCmd({
    ...writeWidgetValueCmd(props.editor, {
      widget: props.widget,
      key: 'dataDefines',
      value: dataDefineList
    }),
    async executeSuccess() {
      if (dataDefine._type == 'submit') return // 提交数据跳过执行
      try {
        const { isNotExecuted, getData } = dataDefineExecutor.updateExecutor({ dataDefine })
        if (isNotExecuted.value || dataDefine.isAutoLoad) {
          if (dataDefine._type != 'const') {
            await getData()
          }
        }
      } finally {
        const refedList = checkDataDefineAreRefed(props.editor, props.widget, dataDefine)
        if (!isEmpty(refedList)) {
          await message.confirm(`是否同步刷新引用中的${refedList.length}数据?`)
          const refreshList = refedList
            .map((e) => buildRefreshRefedCmd(e))
            .filter((e) => !isNullOrUnDef(e))
          const putLoading = (val) => {
            refreshList.forEach((e) => {
              props.editor.getStore().putLoadingContext(e.executor.dataDefine.value!._vid, val)
            })
          }
          props.editor.executeCmd({
            ...batchCmd(refreshList.map((e) => e.cmd!)),
            async executeSuccess() {
              await promiseWithLoading(
                putLoading,
                Promise.allSettled(refreshList.map((e) => e.executor.getData()))
              )
            },
            async rollbackSuccess() {
              await promiseWithLoading(
                putLoading,
                Promise.allSettled(refreshList.map((e) => e.executor.getData()))
              )
            }
          })
        }
      }
    },
    async rollbackSuccess() {
      if (dataDefine._type == 'submit') return // 提交数据跳过执行
      const { result, isExecuted, getData } = dataDefineExecutor.updateExecutor({
        dataDefine: oldDataDefine
      })
      if (isExecuted.value) {
        if (index < 0) {
          result.value = undefined
        } else {
          if (dataDefine._type != 'const') {
            await getData()
          }
        }
      }
    }
  })
}

const onDragChange = (e: any) => {
  if (e.moved) {
    const { newIndex, oldIndex } = e.moved
    const oldElement = sortableDataDefines.value[oldIndex]
    const newElement = sortableDataDefines.value[newIndex]
    const dataDefineList = [...useWidgetDataDefines(props.widget)]
    const fromIndex = dataDefineList.findIndex((i) => i._vid == oldElement._vid)
    const toIndex = dataDefineList.findIndex((i) => i._vid == newElement._vid)
    if (fromIndex != toIndex) {
      const temp = dataDefineList.splice(fromIndex, 1)[0]
      if (!isNullOrUnDef(temp)) {
        dataDefineList.splice(toIndex, 0, temp)
      }
      props.editor.executeCmd(
        writeWidgetValueCmd(props.editor, {
          widget: props.widget,
          key: 'dataDefines',
          value: dataDefineList
        })
      )
    }
  }
}
</script>

<style scoped lang="scss"></style>
