import {
  QuerierTableBodyColumnProps,
  QuerierTableSearchFieldProps
} from '../../../../../querier-table/querier-table.type'
import {
  ActionButtonConfig,
  DesignerEditorEvalFunction,
  RequestUrlModeType,
  WidgetDataDefineRequestMethod
} from '../../../../designer-editor.type'

export interface EasyTableFormModel {
  analyzeApiDesc?: string
  analyzeApiName?: string
  analyzeApiCode?: string
  requestUrlMode?: RequestUrlModeType
  requestUrl?: string
  requestMethod?: WidgetDataDefineRequestMethod
  itemProcessFunction?: DesignerEditorEvalFunction
  searchs?: EasyTableSearchFieldProps[]
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

export type EasyTableSearchFieldProps = {
  remoteMethod?: DesignerEditorEvalFunction
  load?: DesignerEditorEvalFunction
  filterMethod?: DesignerEditorEvalFunction
  disabledDate?: DesignerEditorEvalFunction
} & Omit<QuerierTableSearchFieldProps, 'remoteMethod' | 'load' | 'filterMethod' | 'disabledDate'>

export type EasyTableBodyColumnProps = QuerierTableBodyColumnProps

export const SearchFieldInputTypeOptions = [
  {
    label: 'Input 输入框',
    value: 'input'
  },
  {
    label: 'Select 选择器',
    value: 'select'
  },
  {
    label: 'TreeSelect 树形选择',
    value: 'tree-select'
  },
  {
    label: 'Radio 单选框',
    value: 'radio'
  },
  {
    label: 'Checkbox 多选框',
    value: 'checkbox'
  },
  {
    label: 'Switch 开关',
    value: 'switch'
  },
  {
    label: 'DatePicker 日期选择',
    value: 'date-picker'
  },
  {
    label: 'NumberRange 数字范围输入',
    value: 'number-range'
  }
]

export const ColumnTypeOptions = [
  {
    label: '日期时间',
    value: 'datetime'
  },
  {
    label: '路由跳转',
    value: 'route'
  },
  {
    label: '超链接',
    value: 'link'
  },
  {
    label: '富文本',
    value: 'html'
  },
  {
    label: '数据字典',
    value: 'dict'
  },
  {
    label: '图片',
    value: 'image'
  },
  {
    label: '金额',
    value: 'amount'
  }
]

export const ColumnDatetimeFormatOptions = [
  {
    label: 'YYYY-MM-DD HH:mm:ss',
    value: 'YYYY-MM-DD HH:mm:ss'
  },
  {
    label: 'YYYY-MM-DD HH:mm',
    value: 'YYYY-MM-DD HH:mm'
  },
  {
    label: 'YYYY-MM-DD',
    value: 'YYYY-MM-DD'
  },
  {
    label: 'MM-DD',
    value: 'MM-DD'
  },
  {
    label: 'HH:mm:ss',
    value: 'HH:mm:ss'
  },
  {
    label: 'HH:mm',
    value: 'HH:mm'
  }
]
