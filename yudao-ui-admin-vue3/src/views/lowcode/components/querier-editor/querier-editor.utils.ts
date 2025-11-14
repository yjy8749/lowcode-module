import { isEmpty } from '@/utils/is'
import { copyValue } from '../common/utils'
import { highlightTextHtml } from '../common/utils'

// JS函数内置变量说明
export function jsFunctionBuiltInHelps() {
  const helps = [
    `变量:${highlightTextHtml('$domain')}, QueryDomain类型, 获取对应Domain信息`,
    `变量:${highlightTextHtml('$params')}, QueryDomainParams类型, 获取请求参数信息`,
    `变量:${highlightTextHtml('$mainTable')}, QueryTable类型, 本次查询中的生效主表`,
    `变量:${highlightTextHtml('$tableList')}, List<QueryTable>类型, 本次查询中的生效副表`,
    `变量:${highlightTextHtml('$results')}, List<Map<Object, Object>>类型, 查询返回的结果数据`
  ]
  return `<p>${helps.join('</p><p>')}</p>`
}

// 表有消息验证函数
export function defaultTableValid(): string {
  return '/** 返回true代表该表配置本次查询有效 */\n' + 'return true'
}

// 查询过滤器
export function defaultQueryFilter(): string {
  return '/** 校验不通过返回错误信息, 否则校验通过 */\n' + "return '错误信息'"
}

// 拦截器前处理
export function defaultQueryInterceptorPreHandle(): string {
  return (
    '/** 前处理, 查询前对参数预处理, 返回处理后的参数 */\n' +
    "const QueryDomainUtils = Java.type('cn.iocoder.yudao.module.lowcode.querier.utils.QueryDomainUtils')\n" +
    'return $params'
  )
}

// 拦截器后处理
export function defaultQueryInterceptorPostHandle(): string {
  return '/** 后处理, 查询后对结果后处理, 返回处理后的结果 */\n' + 'return $results'
}

export function copyApis(apiName?: string, apiCode?: string) {
  const baseAdmin = '/admin-api/lowcode/deploy-api'
  const baseApp = '/app-api/lowcode/deploy-api'
  const paths = ['select-list', 'select-one', 'select-page', 'select-count', 'export']

  const formatUrl = (base, path) => {
    const url = `${base}/${apiName}/${path}`
    return !isEmpty(apiCode) ? `${url}?apiCode=${apiCode}` : url
  }

  const adminApis: string[] = []
  const appApis: string[] = []
  for (const path of paths) {
    adminApis.push(formatUrl(baseAdmin, path))
    appApis.push(formatUrl(baseApp, path))
  }

  copyValue(
    ['/** 管理后台接口地址 */', ...adminApis, '', '/** App接口地址 */', ...appApis].join('\n'),
    '接口地址'
  )
}
