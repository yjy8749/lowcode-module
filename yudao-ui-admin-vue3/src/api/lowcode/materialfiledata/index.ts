import request from '@/config/axios'

// 低代码-物料文件数据 VO
export interface MaterialFileDataVO {
  id: number // 主键
  fileId: number // 文件ID
  fileSource: number // 来源 0-无 1-查询器 2-设计器
  dataType: number // 数据类型 0-主数据
  version: number // 版本号
  data: string // 文件数据
}

export interface GetMaterialFileDataReqVO {
  fileId: number
  fileSource: number
  dataType: number
  version?: number
}

export interface MaterialFileDataSaveReqVO {
  fileId: number
  fileSource: number
  dataType: number
  version: number
  data: string
}

// 低代码-物料文件数据 API
export const MaterialFileDataApi = {
  // 获得低代码-物料文件数据
  getMaterialFileData: async (params: GetMaterialFileDataReqVO) => {
    return await request.get({ url: `/lowcode/material-file-data/get`, params })
  },
  // 保存低代码-物料文件设计器数据
  saveMaterialFileData: async (data: Partial<MaterialFileDataVO>) => {
    return await request.post({ url: `/lowcode/material-file-data/save`, data })
  }
}
