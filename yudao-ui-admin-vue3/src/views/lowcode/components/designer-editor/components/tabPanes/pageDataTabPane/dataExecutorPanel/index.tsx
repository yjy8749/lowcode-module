import { Icon } from '@/components/Icon'
import { ElButton, ElProgress, ElText } from 'element-plus'
import { isNullOrUnDef, isEmpty } from '@/utils/is'
import { useDataDefines } from '../../../../designer-editor.utils'
import { useDataDefineExecutor } from '../../../../components/dataDefine/hooks'
import { DesignerEditor, WidgetDataDefine } from '../../../../designer-editor.type'
import EmptyText from '../../../../../common/EmptyText.vue'

const STATUS_CONFIG = {
  executing: {
    styleType: 'warning',
    percentage: 100,
    status: 'warning',
    text: '执行中',
    icon: () => <Icon class="animate-spin animate-duration-3000" icon="ep:loading" />
  },
  success: {
    styleType: 'success',
    percentage: 100,
    status: 'success',
    text: '数据已加载',
    icon: () => <Icon icon="ep:circle-check-filled" />
  },
  fail: {
    styleType: 'danger',
    percentage: 100,
    status: 'exception',
    text: '数据加载失败',
    icon: () => <Icon icon="ep:circle-close-filled" />
  },
  ref: {
    styleType: 'warning',
    percentage: 100,
    status: 'warning',
    text: '运行时自动执行',
    icon: () => <Icon icon="ep:circle-check-filled" />
  },
  default: {
    styleType: 'info',
    percentage: 0,
    status: '',
    text: '未加载',
    icon: () => <Icon icon="ep:warning-filled" />
  }
}

export default defineComponent({
  label: '数据执行',
  order: 1,
  props: {
    editor: {
      type: Object as PropType<DesignerEditor>,
      required: true
    }
  },
  setup(props) {
    const openDataDefineExecuteDialog = inject('openDataDefineExecuteDialog') as Function
    const store = props.editor.getStore()

    function getStatusVal(executor: any) {
      const { dataDefine, result } = executor
      if (dataDefine.value?._type == 'ref') {
        return STATUS_CONFIG.ref
      } else if (result.value?.status == 'executing') {
        return STATUS_CONFIG.executing
      } else if (result.value?.status == 'success') {
        return STATUS_CONFIG.success
      } else if (result.value?.status == 'fail') {
        return STATUS_CONFIG.fail
      } else {
        return STATUS_CONFIG.default
      }
    }

    const executorList = computed(() => {
      return useDataDefines(props.editor, {
        _types: ['def', 'remote', 'ref', 'const', 'submit']
      }).map((dataDefine) => useDataDefineExecutor(props.editor, { dataDefine }))
    })

    const handleOpenDialog = (dataDefine?: WidgetDataDefine) => {
      if (!isNullOrUnDef(dataDefine)) {
        openDataDefineExecuteDialog({ dataDefine })
      }
    }

    const handleLocateWidget = (dataDefine?: WidgetDataDefine) => {
      if (!isNullOrUnDef(dataDefine)) {
        store.setLocation({ widgetId: dataDefine.widgetId, dataId: dataDefine._vid })
      }
    }

    const formatDefineTips = (dataDefine?: WidgetDataDefine): string => {
      return [
        dataDefine?.name ?? '',
        dataDefine?._type ?? '',
        dataDefine?.isAutoLoad ? '自动' : '按需加载'
      ].join(', ')
    }

    const DataDefineList = () => {
      if (isEmpty(executorList.value)) {
        return <EmptyText />
      }
      return executorList.value.map((executor) => {
        const { dataDefine, isExecuting, failError } = executor
        const statusVal = computed(() => getStatusVal(executor))
        const StatusIcon = statusVal.value.icon
        return (
          <>
            <div class="px-2 py-1 bg-[--el-fill-color-light]">
              <ElText size="small" type={statusVal.value.styleType}>
                {formatDefineTips(dataDefine.value)}
              </ElText>
              <ElProgress
                striped={isExecuting.value}
                stripedFlow={isExecuting.value}
                percentage={statusVal.value.percentage}
                strokeWidth={16}
                duration={30}
                status={statusVal.value.status}
              >
                <div class="flex gap-1 items-center">
                  <StatusIcon />
                  <ElText size="small" type={statusVal.value.styleType}>
                    {statusVal.value.text}{' '}
                  </ElText>
                  <ElButton
                    class="!m-0"
                    type="primary"
                    link
                    onClick={() => handleOpenDialog(dataDefine.value)}
                  >
                    结果
                  </ElButton>
                  <ElButton
                    class="!m-0"
                    type="primary"
                    link
                    onClick={() => handleLocateWidget(dataDefine.value)}
                  >
                    <Icon icon="ep:aim" />
                  </ElButton>
                </div>
              </ElProgress>
              {!isNullOrUnDef(failError.value) && (
                <ElText size="small" type="danger">
                  {failError.value}
                </ElText>
              )}
            </div>
          </>
        )
      })
    }

    return () => (
      <>
        <DataDefineList />
      </>
    )
  }
})
