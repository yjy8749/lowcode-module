import request from '@/config/axios'

// 低代码-物料文件操作日志 VO
export interface MaterialFileLogVO {
  id: number // 主键
  fileId: number // 文件ID
  fileSource: number // 来源 0-无 1-查询器 2-设计器
  dataType: number // 数据类型 0-主数据
  opType: number // 操作类型
  opDesc: string // 操作描述
  opDetail: string // 详细信息
  opVersion: number // 版本号
  opData: string // 文件数据
}

export interface MaterialFileLogPageReqVO {
  createTime?: string[]
  fileId: number
  fileSource: number
  dataType: number
  opType?: number
  pageNo: number
  pageSize: number
}

// 低代码-物料文件操作日志 API
export const MaterialFileLogApi = {
  // 查询低代码-物料文件操作日志分页
  getMaterialFileLogPage: async (params: MaterialFileLogPageReqVO) => {
    return await request.get({ url: `/lowcode/material-file-log/page`, params })
  }
}
