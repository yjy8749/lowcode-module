import request from '@/config/axios'
import { MaterialFileDataVO } from '../../materialfiledata'
import { requestOriginal } from '../../utils'

export interface GenTableXmlReqVO {
  dataSourceId: number
  tableName?: string
}

export interface QueryDomainWhereParams {
  ands?: QueryDomainWhereParams[]
  ors?: QueryDomainWhereParams[]
  name?: string
  symbol?: string
  value?: any
  values?: any[]
}

export interface QueryDomainPageParams {
  pageNo: number
  pageSize: number
}

export interface QueryDomainParams {
  pageParams?: QueryDomainPageParams
  whereParamsList?: QueryDomainWhereParams[]
}

export interface TestQueryDomainReqVO {
  dataSourceId: number
  queryXml: string
  params?: QueryDomainParams
}
export interface ParseQueryDomainXmlReqVO {
  queryXml?: string
}
export interface ToQueryDomainXmlReqVO {
  queryDomain: any
}
export interface DeployApiDeployReqVO extends MaterialFileDataVO {
  isOfflineOther?: boolean
}

// 低代码-部署接口 VO
export interface DeployApiVO {
  id: number // 主键
  apiCode: string // 接口编码
  apiName: string // 接口名称
  sourceFileId: number // 接口源文件ID
  sourceFileVersion: number // 接口源文件版本号
  apiStatus: number // 接口状态 1-已上线 2-已下线
}

export interface DeployApiPageReqVO {
  sourceFileId?: number
  apiStatus?: number
  pageNo: number
  pageSize: number
}

export interface DeployApiUpdateStatusReqVO {
  sourceFileId: number
  sourceFileVersion: number
  apiStatus: number
}

export interface DeployApiDeleteReqVO {
  sourceFileId: number
  sourceFileVersion: number
}

export interface GetQueryDomainReqVO {
  apiName?: string
  apiCode?: string
}

// 低代码-查询器 API
export const QuerierEditorApi = {
  // 获得数据源配置列表
  getDataSourceList: async () => {
    return await request.get({ url: '/lowcode/querier-editor/data-source-list' })
  },
  // 查询器-生成数据表配置XML
  genTableXml: async (data: GenTableXmlReqVO) => {
    return await request.post({ url: `/lowcode/querier-editor/gen-table-xml`, data })
  },
  // 查询器-解析数据表配置XML
  parseQueryDomainXml: async (data: ParseQueryDomainXmlReqVO) => {
    return await request.post({ url: `/lowcode/querier-editor/parse-query-domain-xml`, data })
  },
  // 查询器-数据表配置对象生成XML
  toQueryDomainXml: async (data: ToQueryDomainXmlReqVO) => {
    return await request.post({ url: `/lowcode/querier-editor/to-query-domain-xml`, data })
  },
  // 查询器-获取接口查询配置Bean
  getQueryDomain: async (data: GetQueryDomainReqVO) => {
    return await request.post({ url: `/lowcode/querier-editor/get-query-domain`, data })
  },
  // 查询器-test-selectList
  testSelectList: async (data: Partial<TestQueryDomainReqVO>) => {
    return await request.post({ url: `/lowcode/querier-editor/test/select-list`, data })
  },
  // 查询器-test-selectOne
  testSelectOne: async (data: Partial<TestQueryDomainReqVO>) => {
    return await request.post({ url: `/lowcode/querier-editor/test/select-one`, data })
  },
  // 查询器-test-selectPage
  testSelectPage: async (data: Partial<TestQueryDomainReqVO>) => {
    return await request.post({ url: `/lowcode/querier-editor/test/select-page`, data })
  },
  // 查询器-test-export
  testExport: async (data: Partial<TestQueryDomainReqVO>) => {
    return requestOriginal({
      url: '/lowcode/querier-editor/test/export',
      method: 'POST',
      responseType: 'blob',
      data
    })
  },
  // 查询器-接口部署
  deployApiDeploy: async (data: Partial<DeployApiDeployReqVO>) => {
    return await request.post({ url: `/lowcode/querier-editor/deploy-api/deploy`, data })
  },
  // 查询器-接口部署分页
  deployApiPage: async (params: DeployApiPageReqVO) => {
    return await request.get({ url: `/lowcode/querier-editor/deploy-api/page`, params })
  },
  // 查询器-接口状态更新
  deployApiUpdateStatus: async (data: DeployApiUpdateStatusReqVO) => {
    return await request.post({ url: `/lowcode/querier-editor/deploy-api/update-status`, data })
  },
  // 查询器-接口删除
  deployApiDelete: async (data: DeployApiDeleteReqVO) => {
    return await request.post({ url: `/lowcode/querier-editor/deploy-api/delete`, data })
  }
}
