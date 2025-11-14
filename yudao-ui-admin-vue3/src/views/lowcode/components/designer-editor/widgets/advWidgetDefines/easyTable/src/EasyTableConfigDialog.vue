<template>
  <Dialog title="表格配置" width="1200px" v-model="dialogVisible" @close="onDialogClose">
    <el-form :model="formModel" :rules="formRules" v-loading="dialogLoading">
      <ContentWrap>
        <div class="flex gap-2">
          <el-form-item class="flex-1 !mb-0" label="接口名称">
            <el-input placeholder="请输入接口名称" v-model="formModel.analyzeApiName" />
          </el-form-item>
          <el-form-item class="flex-1 !mb-0" label="接口编码">
            <el-input placeholder="请输入接口编码" v-model="formModel.analyzeApiCode" />
          </el-form-item>
          <el-form-item class="!mb-0">
            <el-button type="default" @click="doAnalyze">解析</el-button>
          </el-form-item>
        </div>
      </ContentWrap>
      <ContentWrap>
        <div class="flex gap-2">
          <el-form-item class="flex-1" prop="requestUrlMode">
            <template #label>
              <TextLabel
                label="地址模式"
                helps="在api地址非绝对地址时生效; 跟随项目: 相对项目api请求基础路径; 相对base: 相对项目页面base路径"
              />
            </template>
            <el-select
              class="w-full"
              placeholder="请选择Api地址模式"
              v-model="formModel.requestUrlMode"
            >
              <el-option
                v-for="item in RequestUrlModeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item class="flex-1" label="Api地址" prop="requestUrl">
            <el-input v-model="formModel.requestUrl" placeholder="请输入Api地址" clearable>
              <template #prepend>
                <el-select style="width: 100px" v-model="formModel.requestMethod">
                  <el-option
                    v-for="item in RequestMethodQueryOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </template>
            </el-input>
          </el-form-item>
        </div>
      </ContentWrap>
      <ContentWrap>
        <el-tabs v-model="activeTab">
          <el-tab-pane lazy label="查询配置" name="searchConfig">
            <div class="flex gap-8">
              <el-form-item label="是否自动加载数据" prop="loadOnInit">
                <el-switch size="small" v-model="formModel.loadOnInit" />
              </el-form-item>
            </div>
            <el-form-item label="默认查询参数" label-position="top" prop="defaultParamsFunction">
              <EvalFunctionValueInput
                name="读取默认查询参数函数"
                type="simple-function"
                :height="100"
                :editor="editor"
                :widget="dialogArgs!.widget"
                :helps="`返回 ${highlightTextHtml('[{ name, symbol, value}]')} 查询参数数组`"
                default-function="return []"
                v-model="formModel.defaultParamsFunction"
              />
            </el-form-item>
            <el-form-item label="数据转换函数" label-position="top" prop="itemProcessFunction">
              <EvalFunctionValueInput
                name="加载后对数据二次处理函数"
                type="simple-function"
                :height="100"
                :editor="editor"
                :widget="dialogArgs!.widget"
                :helps="`${highlightTextHtml('args[0]')} 为列表数据`"
                default-function="return args[0]"
                v-model="formModel.itemProcessFunction"
              />
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane lazy label="查询条件配置" name="searchFields">
            <div class="flex gap-8">
              <el-form-item label="开启条件查询">
                <el-switch size="small" v-model="formModel.enableSearch" />
              </el-form-item>
              <el-form-item label="开启分页查询">
                <el-switch size="small" v-model="formModel.enablePagination" />
              </el-form-item>
            </div>
            <el-form-item label-position="top" prop="searchs">
              <EasyTableSearchFieldArrayValueInput v-model="formModel.searchs" />
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane lazy label="查询按钮配置" name="searchActions">
            <div class="flex justify-between">
              <div class="flex gap-8">
                <el-form-item label="开启查询区动态插槽">
                  <el-switch size="small" v-model="formModel.enableSearchActionSlot" />
                </el-form-item>
              </div>
              <div class="flex gap-8">
                <el-form-item>
                  <el-button type="primary" link size="small" @click="addExportAction">
                    添加导出按钮
                  </el-button>
                </el-form-item>
              </div>
            </div>
            <el-form-item label-position="top" prop="searchActions">
              <ActionButtonArrayValueInput
                v-if="dialogArgs?.widget"
                :editor="editor"
                :widget="dialogArgs.widget"
                v-model="formModel.searchActions"
              />
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane lazy label="操作按钮配置" name="operationActions">
            <div class="flex gap-8">
              <el-form-item label="开启操作区动态插槽">
                <el-switch size="small" v-model="formModel.enableOperationActionSlot" />
              </el-form-item>
            </div>
            <el-form-item label-position="top" prop="operationActions">
              <ActionButtonArrayValueInput
                v-if="dialogArgs?.widget"
                :editor="editor"
                :widget="dialogArgs.widget"
                v-model="formModel.operationActions"
              />
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane lazy label="表格配置" name="tableColumns">
            <div class="flex gap-8">
              <el-form-item label="自定义表格元素">
                <el-switch
                  size="small"
                  v-model="formModel.enableTableBodySlot"
                  @update:model-value="
                    (val) => {
                      formModel.enableTableBodySlot = !!val
                      formModel.enableTableBodyCardSlot = true
                    }
                  "
                />
              </el-form-item>
              <el-form-item label="开启表头动态插槽">
                <el-switch size="small" v-model="formModel.enableTableHeaderSlot" />
              </el-form-item>
              <el-form-item label="开启表尾动态插槽">
                <el-switch size="small" v-model="formModel.enableTableFooterSlot" />
              </el-form-item>
              <template v-if="!formModel.enableTableBodySlot">
                <el-form-item label="表格固定高度">
                  <el-input-number size="small" v-model="formModel.height" :min="0" :precision="0">
                    <template #suffix>
                      <span>px</span>
                    </template>
                  </el-input-number>
                </el-form-item>
                <el-form-item label="显示序号列">
                  <el-switch
                    size="small"
                    v-model="formModel.showIndexColumn"
                    @change="onHideIndexAndActionChange"
                  />
                </el-form-item>
                <el-form-item label="显示操作列">
                  <el-switch
                    size="small"
                    v-model="formModel.showRowAction"
                    @change="onHideIndexAndActionChange"
                  />
                </el-form-item>
              </template>
              <template v-else>
                <el-form-item label="使用卡片容器" v-if="formModel.enableTableBodySlot">
                  <el-switch size="small" v-model="formModel.enableTableBodyCardSlot" />
                </el-form-item>
                <el-form-item label="显示卡片操作" v-if="formModel.enableTableBodyCardSlot">
                  <el-switch
                    size="small"
                    v-model="formModel.showRowAction"
                    @change="onHideIndexAndActionChange"
                  />
                </el-form-item>
              </template>
            </div>
            <el-form-item label-position="top" prop="columns">
              <EasyTableBodyColumnArrayValueInput v-model="formModel.columns" />
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane lazy label="操作配置" name="rowActions" v-if="formModel.showRowAction">
            <div class="flex gap-8">
              <el-form-item>
                <template #label>
                  <TextLabel label="全部展开" helps="开启后,按钮会全部展开,否则2个以上自动折叠" />
                </template>
                <el-switch
                  size="small"
                  v-model="formModel.expandRowActions"
                  @change="
                    () =>
                      formModel.expandRowActions ? (formModel.foldRowActions = false) : undefined
                  "
                />
              </el-form-item>
              <el-form-item>
                <template #label>
                  <TextLabel
                    label="全部收起"
                    helps="开启后,按钮会全部折叠起来,否则2个以内展开显示"
                  />
                </template>
                <el-switch
                  size="small"
                  v-model="formModel.foldRowActions"
                  @change="
                    () =>
                      formModel.foldRowActions ? (formModel.expandRowActions = false) : undefined
                  "
                />
              </el-form-item>
              <el-form-item v-if="!formModel.expandRowActions && !formModel.foldRowActions">
                <template #label>
                  <TextLabel
                    label="超过自动收起"
                    helps="按钮数超过该数量后,自动收起为下拉菜单样式"
                  />
                </template>
                <el-input-number
                  placeholder="2"
                  size="small"
                  :min="0"
                  :precision="0"
                  v-model="formModel.autoFoldNum"
                />
              </el-form-item>
            </div>
            <el-form-item label-position="top" prop="rowActions">
              <ActionButtonArrayValueInput
                v-if="dialogArgs?.widget"
                :editor="editor"
                :widget="dialogArgs.widget"
                :helps="`变量:${highlightTextHtml('$args[1]')}, 为 el-table 插槽 ${highlightTextHtml('scope')} 属性`"
                v-model="formModel.rowActions"
              />
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane lazy label="可选择配置" name="selectConfig">
            <div class="flex gap-8">
              <el-form-item label="开启选择功能">
                <template #label>
                  <TextLabel
                    label="开启选择功能"
                    helps="选择功能续配合主键字段使用, 主键字段需支持 IN 和 EQ 查询, 未指定主键默认使用 id 字段, "
                  />
                </template>
                <el-switch size="small" v-model="formModel.selectable" />
              </el-form-item>
              <template v-if="formModel.selectable">
                <el-form-item label="是否为追加选择模式">
                  <template #label>
                    <TextLabel
                      label="是否为追加选择模式"
                      helps="追加选择模式下,预置已选择数据不可取消选择"
                    />
                  </template>
                  <el-switch size="small" v-model="formModel.appendSelectMode" />
                </el-form-item>
                <el-form-item label="最少选择">
                  <el-input-number
                    size="small"
                    v-model="formModel.minSelectCount"
                    :min="0"
                    :precision="0"
                  >
                    <template #suffix>
                      <span>条</span>
                    </template>
                  </el-input-number>
                </el-form-item>
                <el-form-item label="最多选择">
                  <el-input-number
                    size="small"
                    v-model="formModel.maxSelectCount"
                    :min="0"
                    :precision="0"
                  >
                    <template #suffix>
                      <span>条</span>
                    </template>
                  </el-input-number>
                </el-form-item>
              </template>
            </div>
            <el-form-item
              v-if="formModel.selectable"
              label="是否可选择函数"
              label-position="top"
              prop="itemSelectableFunction"
            >
              <EvalFunctionValueInput
                name="判断元素是否可选择函数代码"
                type="simple-function"
                :height="100"
                :editor="editor"
                :widget="dialogArgs!.widget"
                :helps="`${highlightTextHtml('args[0]')} 为列表数据`"
                default-function="return true"
                v-model="formModel.itemSelectableFunction"
              />
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
      </ContentWrap>
    </el-form>
    <template #footer>
      <el-button type="primary" :loading="dialogLoading" @click="doConfirm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import EvalFunctionValueInput from '../../../../components/EvalFunctionValueInput.vue'
import { ref } from 'vue'
import { isEmpty, isNullOrUnDef } from '@/utils/is'
import TextLabel from '../../../../../common/TextLabel.vue'
import { highlightTextHtml } from '../../../../../common/utils'
import {
  DesignerEditor,
  PromiseCallback,
  RequestUrlModeOptions,
  RequestMethodQueryOptions,
  RequestUrlModeType,
  WidgetDataDefineRequestMethod,
  WidgetInstance,
  WidgetRenderContext,
  WidgetDataDefine,
  DATA_EMPTY_NAME_FLAG,
  ActionButtonConfig,
  DesignerEditorEvalFunction
} from '../../../../designer-editor.type'
import {
  COLUMN_ACTION_PROP,
  COLUMN_INDEX_PROP,
  QuerierTableBodyColumnProps,
  QuerierTableSearchFieldProps
} from '../../../../../querier-table/querier-table.type'
import { QueryDomain, QueryTable } from '../../../../../querier-editor/querier-editor.type'
import { QuerierEditorApi } from '@/api/lowcode/editor/querier'
import EasyTableSearchFieldArrayValueInput from './EasyTableSearchFieldArrayValueInput.vue'
import ActionButtonArrayValueInput from '../../../../components/ActionButtonArrayValueInput.vue'
import EasyTableBodyColumnArrayValueInput from './EasyTableBodyColumnArrayValueInput.vue'
import { generateVid } from '../../../../../common/utils'
import {
  buildTableDataDefines,
  calcDatetimeColumnWidth,
  DEFAULT_DATETIME_FORMAT,
  getTableDataId
} from '../utils'
import { useWidgetDefine } from '../../../index'
import {
  createSlotItem,
  createWidgetInstance,
  getWidgetShortVidOrVar,
  isWidgetInstanceOf
} from '../../../../designer-editor.utils'
import { isActionColumn, isIndexColumn } from '../../../../../querier-table/querier-table.utils'
import { cloneDeep } from 'lodash-es'

export interface EasyTableFormModel {
  analyzeApiDesc?: string
  analyzeApiName?: string
  analyzeApiCode?: string
  requestUrlMode?: RequestUrlModeType
  requestUrl?: string
  requestMethod?: WidgetDataDefineRequestMethod
  itemProcessFunction?: DesignerEditorEvalFunction
  searchs?: QuerierTableSearchFieldProps[]
  enableSearchActionSlot?: boolean
  searchActions?: ActionButtonConfig[]
  enableOperationActionSlot?: boolean
  operationActions?: ActionButtonConfig[]
  enableSearch?: boolean
  enablePagination?: boolean
  enableTableHeaderSlot?: boolean
  enableTableBodySlot?: boolean
  enableTableBodyCardSlot?: boolean
  enableTableFooterSlot?: boolean
  showIndexColumn?: boolean
  showRowAction?: boolean
  columns?: QuerierTableBodyColumnProps[]
  expandRowActions?: boolean
  foldRowActions?: boolean
  autoFoldNum?: number
  rowActions?: ActionButtonConfig[]
  height?: number
  selectable?: boolean
  minSelectCount?: number
  maxSelectCount?: number
  appendSelectMode?: boolean
  itemSelectableFunction?: DesignerEditorEvalFunction
  loadOnInit?: boolean
  defaultParamsFunction?: DesignerEditorEvalFunction
}

export interface EasyTableConfigDialogArgs {
  parentWidget?: WidgetInstance
  parentContext?: WidgetRenderContext
  widget: WidgetInstance
  widgetContext: WidgetRenderContext
}

const props = defineProps<{ editor: DesignerEditor }>()

const message = useMessage()

const dialogVisible = ref(false)

const dialogLoading = ref(false)

const dialogArgs = ref<EasyTableConfigDialogArgs>()

const dialogCallback = ref<PromiseCallback>({})

const formModel = ref<EasyTableFormModel>({})

const formRules = reactive({
  requestUrlMode: [{ required: true, message: '请选择地址模式', trigger: 'change' }],
  requestUrl: [{ required: true, message: '请输入请求接口地址', trigger: 'change' }]
})

const activeTab = ref('searchConfig')

const onHideIndexAndActionChange = () => {
  formModel.value.columns = regenConstColumn(
    formModel.value.columns,
    formModel.value.showIndexColumn,
    formModel.value.showRowAction
  )
}

const doAnalyze = async () => {
  if (isEmpty(formModel.value.analyzeApiName)) {
    message.error('请输入接口名称')
    return
  }
  try {
    dialogLoading.value = true
    const queryDomain: QueryDomain = await QuerierEditorApi.getQueryDomain({
      apiName: formModel.value.analyzeApiName,
      apiCode: formModel.value.analyzeApiCode
    })

    formModel.value.searchs = []
    formModel.value.columns = []

    formModel.value.analyzeApiDesc = queryDomain.desc

    const addQueryFields = (tables?: QueryTable[]) => {
      tables?.forEach((table) => {
        table.queryFieldList?.forEach((field) => {
          if (!isEmpty(field.symbols)) {
            formModel.value.searchs?.push({
              label: field.comment,
              prop: field.name,
              symbolType: field.symbols?.split(',')[0],
              inputType: 'input'
            })
          }
          const col: QuerierTableBodyColumnProps = { label: field.comment, prop: field.name }
          if (['createTime', 'updateTime', 'deletedTime'].includes(col.prop ?? '')) {
            col.columnType = 'datetime'
            col.datetimeFormat = DEFAULT_DATETIME_FORMAT
            col.width = calcDatetimeColumnWidth(DEFAULT_DATETIME_FORMAT)
          }
          if (col.prop == 'id') {
            col.rowKey = true
            col.width = '65px'
          }
          formModel.value.columns?.push(col)
        })
      })
    }
    addQueryFields(queryDomain.mainTableList)
    addQueryFields(queryDomain.queryTableList)
    formModel.value.requestUrlMode = 'REF_PROJECT'
    formModel.value.requestMethod = 'post'
    formModel.value.requestUrl = `/lowcode/deploy-api/${formModel.value.analyzeApiName}/select-page`
    if (!isEmpty(formModel.value.analyzeApiCode)) {
      formModel.value.requestUrl = `${formModel.value.requestUrl}?apiCode=${formModel.value.analyzeApiCode}`
    }
    formModel.value.itemProcessFunction = undefined
    formModel.value.itemSelectableFunction = undefined
    formModel.value.showIndexColumn = !formModel.value.columns.some((col) => col.prop == 'id')
    formModel.value.showRowAction = true
    formModel.value.columns = regenConstColumn(
      formModel.value.columns,
      formModel.value.showIndexColumn,
      formModel.value.showRowAction
    )
  } finally {
    dialogLoading.value = false
  }
}

const regenConstColumn = (
  columns?: QuerierTableBodyColumnProps[],
  showIndexColumn?: boolean,
  showRowAction?: boolean
) => {
  const cols = (columns ?? []).filter((col) => {
    if (isIndexColumn(col)) {
      return showIndexColumn
    } else if (isActionColumn(col)) {
      return showRowAction
    } else {
      return true
    }
  })
  if (showIndexColumn) {
    if (!cols.some(isIndexColumn)) {
      cols.unshift({ label: '#', prop: COLUMN_INDEX_PROP, width: '65px' })
    }
  }

  if (showRowAction) {
    if (!cols.some(isActionColumn)) {
      cols.push({ label: '操作', prop: COLUMN_ACTION_PROP, width: '120px' })
    }
  }
  return cols
}

const regenSlots = async (): Promise<WidgetInstance[]> => {
  const widget = dialogArgs.value!.widget
  const slots = [...widget.slots]
  if (formModel.value.enableSearchActionSlot) {
    if (!slots.some((item) => item.slotKey == 'searchActionSlot')) {
      slots.push(createSlotItem(props.editor, 'searchActionSlot'))
    }
  }
  if (formModel.value.enableOperationActionSlot) {
    if (!slots.some((item) => item.slotKey == 'operationActionSlot')) {
      slots.push(createSlotItem(props.editor, 'operationActionSlot'))
    }
  }
  if (formModel.value.enableTableHeaderSlot) {
    if (!slots.some((item) => item.slotKey == 'tableHeaderSlot')) {
      slots.push(createSlotItem(props.editor, 'tableHeaderSlot'))
    }
  }
  if (formModel.value.enableTableFooterSlot) {
    if (!slots.some((item) => item.slotKey == 'tableFooterSlot')) {
      slots.push(createSlotItem(props.editor, 'tableFooterSlot'))
    }
  }
  if (formModel.value.enableTableBodySlot) {
    let tableBodySlotWidget = slots.find((item) => item.slotKey == 'tableBodySlot')
    if (isNullOrUnDef(tableBodySlotWidget)) {
      const vforDefine = useWidgetDefine({ _moduleName: 'codeWidgetDefines', _key: 'vforDefine' })
      tableBodySlotWidget = await createWidgetInstance(props.editor, vforDefine, {
        slotKey: 'tableBodySlot'
      })
      tableBodySlotWidget.propsBind = {
        data: {
          bindList: [
            {
              bind: {
                label: `表格数据 [ ${getWidgetShortVidOrVar(widget)} ]`,
                refDataId: getTableDataId(widget),
                refDataType: 'const',
                refWidgetId: widget._vid
              },
              refPropKey: '#'
            }
          ]
        }
      }
      slots.push(tableBodySlotWidget)
    }

    const tableCardSlotDefine = useWidgetDefine({
      _moduleName: 'advWidgetDefines',
      _key: 'easyTableCardSlot'
    })

    const bodySlotItem = tableBodySlotWidget!.slots[0]
    if (isWidgetInstanceOf(bodySlotItem, tableCardSlotDefine)) {
      if (!formModel.value.selectable && !formModel.value.enableTableBodyCardSlot) {
        tableBodySlotWidget!.slots = [...bodySlotItem.slots]
      }
    } else {
      if (formModel.value.selectable || formModel.value.enableTableBodyCardSlot) {
        tableBodySlotWidget!.slots = [
          await createWidgetInstance(props.editor, tableCardSlotDefine, {
            slotKey: bodySlotItem.slotKey,
            slots: [bodySlotItem]
          })
        ]
      }
    }
  }
  return slots
}

const regenDataDefines = async (): Promise<WidgetDataDefine[]> => {
  const widget = dialogArgs.value!.widget
  const dataDefines = [...(widget.dataDefines ?? [])]
  const tableDataId = getTableDataId(widget)
  if (!dataDefines.some((item) => item._vid == tableDataId)) {
    dataDefines.push(
      buildTableDataDefines(widget, {
        propDefines: [
          {
            _vid: generateVid(),
            _key: `#.${DATA_EMPTY_NAME_FLAG}`,
            name: DATA_EMPTY_NAME_FLAG,
            type: 'array',
            comment: '数据',
            itemType: 'object',
            itemDefines: (formModel.value.columns ?? [])
              .filter((col) => !isActionColumn(col) && !isIndexColumn(col))
              .map((col) => {
                return {
                  _vid: generateVid(),
                  _key: `#.${col.prop}`,
                  name: col.prop,
                  type: 'string',
                  comment: col.label
                }
              })
          }
        ],
        jsonData: '[]'
      })
    )
  }
  return dataDefines
}

const addExportAction = () => {
  let exportUrl = `/lowcode/deploy-api/${formModel.value.analyzeApiName}/export`
  if (!isEmpty(formModel.value.analyzeApiCode)) {
    exportUrl = `${exportUrl}?apiCode=${formModel.value.analyzeApiCode}`
  }
  formModel.value.searchActions ??= []
  formModel.value.searchActions?.push({
    type: 'warning',
    label: '导出',
    icon: 'ep:download',
    plain: true,
    onClick: {
      evalFunction: `return (async () => {
    await $message().exportConfirm()
    const resp = await $request({
        url: '${exportUrl}',
        method: 'POST',
        responseType: 'blob',
        data: {}
    })
    $download().excel(data, \`${formModel.value.analyzeApiDesc ?? '导出数据'}.xls\`)
})()`
    }
  })
}

const open = async (args: EasyTableConfigDialogArgs, callback?: PromiseCallback) => {
  doReset()
  dialogArgs.value = args
  dialogCallback.value = { ...callback }
  formModel.value = cloneDeep({
    requestMethod: 'post',
    enableSearch: true,
    enablePagination: true,
    showIndexColumn: true,
    showRowAction: true,
    loadOnInit: true,
    columns: regenConstColumn(
      args.widget.props?.columns,
      args.widget.props?.showIndexColumn ?? true,
      args.widget.props?.showRowAction ?? true
    ),
    ...args.widget.props
  })
  dialogVisible.value = true
}

defineExpose({ open })

const onDialogClose = () => {
  dialogCallback.value.reject?.('cancel create')
}

const doConfirm = async () => {
  const { reject, resolve } = dialogCallback.value
  try {
    dialogCallback.value = {}
    dialogLoading.value = true
    resolve?.({
      props: formModel.value,
      slots: await regenSlots(),
      dataDefines: await regenDataDefines()
    })
    dialogVisible.value = false
  } catch (e) {
    reject?.(e)
  } finally {
    dialogLoading.value = false
  }
}

const doReset = () => {
  activeTab.value = 'searchConfig'
  dialogArgs.value = undefined
  formModel.value = {}
}
</script>

<style scoped lang="scss"></style>
