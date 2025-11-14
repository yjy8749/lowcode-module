import request from '@/config/axios'

// 低代码-物料文件 VO
export interface MaterialFileVO {
  id: number // 主键
  name: string // 名称
  description: string // 描述
  source: number // 来源 0-无 1-查询器 2-设计器
  parentId: number // 父ID
  isFile: boolean // 是否是文件
  isPrivate: boolean // 是否私有
  status: number // 状态 0-禁用 1-正常 2-锁定 3-弃用
  sort: number // 排序
  sourceFileId: number // 来源文件ID
  sourceFileVersion: number // 来源文件版本号
  creator: string // 创建人
}

export interface MaterialFilePageReqVO {
  createTime?: string[]
  name?: string
  source: number
  parentId?: number
  isFile?: boolean
  status?: number
  creator?: string
  pageNo?: number
  pageSize?: number
  integratorSelectable?: boolean
  ids?: number[]
}

export interface GetMaterialFileReqVO {
  id: number
}

export interface MaterialFileSaveReqVO {
  id?: number
  name: string
  description?: string
  parentId: number
  source: number
  isFile: boolean
  isPrivate: boolean
  status: number
  sort: number
  sourceFileId?: number
  sourceFileVersion?: number
  creator?: string
}

export interface MaterialFileUpdateReqVO {
  id: number
  name?: string
  description?: string
  isPrivate?: boolean
  sort?: number
}

export interface MaterialFileUpdateStatusReqVO {
  id: number
  status: number
}

export interface MaterialFileDeleteReqVO {
  id: number
}

export interface MaterialFileTransferReqVO {
  id: number
  receiverId: number
  receiverName: string
  creator?: string
}

export interface MaterialFileMoveReqVO {
  id: number
  parentId: number
  parentName: string
}

// 低代码-物料文件 API
export const MaterialFileApi = {
  // 查询低代码-物料文件目录List
  getMaterialFileFolderList: async (params: MaterialFilePageReqVO) => {
    return await request.get({ url: `/lowcode/material-file/folder-list`, params })
  },
  // 查询低代码-物料文件分页
  getMaterialFilePage: async (params: MaterialFilePageReqVO) => {
    return await request.get({ url: `/lowcode/material-file/file-page`, params })
  },
  // 查询低代码-物料文件
  getMaterialFile: async (params: GetMaterialFileReqVO) => {
    return await request.get({ url: `/lowcode/material-file/get-file`, params })
  },
  // 创建低代码-物料文件
  createMaterialFile: async (data: MaterialFileSaveReqVO) => {
    return await request.post({ url: `/lowcode/material-file/create`, data })
  },
  // 更新低代码-物料文件
  updateMaterialFile: async (data: MaterialFileUpdateReqVO) => {
    return await request.put({ url: `/lowcode/material-file/update`, data })
  },
  // 更新状态低代码-物料文件
  updateMaterialFileStatus: async (data: MaterialFileUpdateStatusReqVO) => {
    return await request.put({ url: `/lowcode/material-file/update-status`, data })
  },
  // 删除低代码-物料文件
  deleteMaterialFile: async (data: MaterialFileDeleteReqVO) => {
    return await request.delete({ url: `/lowcode/material-file/delete`, data })
  },
  // 转移所有权-物料文件
  transferMaterialFile: async (data: MaterialFileTransferReqVO) => {
    return await request.put({ url: `/lowcode/material-file/transfer`, data })
  },
  // 移动位置-物料文件
  moveMaterialFile: async (data: MaterialFileMoveReqVO) => {
    return await request.put({ url: `/lowcode/material-file/move`, data })
  }
}
