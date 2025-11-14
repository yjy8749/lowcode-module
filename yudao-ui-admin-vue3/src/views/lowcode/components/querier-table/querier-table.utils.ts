import { isNullOrUnDef, isEmpty } from '@/utils/is'
import {
  COLUMN_ACTION_PROP,
  COLUMN_INDEX_PROP,
  QuerierTableBodyColumnProps,
  QuerierTableSearchFieldProps,
  QueryDomainWhereParams
} from './querier-table.type'
export function getSearchFieldProp(field: QuerierTableSearchFieldProps): string {
  return field.prop ?? ''
}
export function getTableBodyColumnProp(col: QuerierTableBodyColumnProps) {
  return col.prop ?? ''
}
export function getTableBodyColumnKey(col: QuerierTableBodyColumnProps) {
  return col.prop ?? ''
}

export function whereParamsToObject(params?: QueryDomainWhereParams[]): any {
  if (!isNullOrUnDef(params)) {
    return Object.fromEntries(params.map((param) => [param.name, param.value ?? param.values]))
  }
  return {}
}

export function isIndexColumn(col: QuerierTableBodyColumnProps) {
  return col.prop == COLUMN_INDEX_PROP || col.columnType == 'index'
}

export function isActionColumn(col: QuerierTableBodyColumnProps) {
  return col.prop == COLUMN_ACTION_PROP || col.columnType == 'action'
}

export function parseUrlToRouteParams(url: string) {
  const [pathPart, queryPart] = url.split('?')
  const query = {}
  if (!isEmpty(queryPart)) {
    const params = queryPart.split('&')
    for (const param of params) {
      const [key, value] = param.split('=').map(decodeURIComponent)
      query[key] = value
    }
  }
  return {
    path: pathPart,
    query
  }
}
