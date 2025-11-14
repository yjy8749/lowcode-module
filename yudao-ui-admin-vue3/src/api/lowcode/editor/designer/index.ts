import request from '@/config/axios'
import { MenuVO } from '@/api/system/menu'

export interface GetSourceFileRefMenuReqVO {
  sourceFileId: number
}

export interface GetSourceFileRefMenuRespVO {
  refMenu?: MenuVO
  refButtonList?: MenuVO[]
}

export interface DeployMenuDeployReqVO {
  sourceFileId: number
  sourceFileVersion: number
  systemMenu: MenuVO
}

export interface DeployMenuPageReqVO {
  sourceFileId?: number
  pageNo: number
  pageSize: number
}

export interface DeployMenuRespVO {
  id?: number
  createTime?: any
  menuId?: number
  sourceFileId?: number
  sourceFileVersion?: number
  menuStatus?: number
  systemMenu?: MenuVO
}

// 低代码-设计器 API
export const DesignerEditorApi = {
  // 设计器-获取文件关联菜单
  getSourceFileRefMenu: async (
    params: GetSourceFileRefMenuReqVO
  ): Promise<GetSourceFileRefMenuRespVO> => {
    return await request.get({ url: '/lowcode/designer-editor/source-file-ref-menu', params })
  },
  // 设计器-菜单部署
  deployMenuDeploy: async (data: Partial<DeployMenuDeployReqVO>) => {
    return await request.post({ url: `/lowcode/designer-editor/deploy-menu/deploy`, data })
  },
  // 设计器-菜单部署分页
  deployMenuPage: async (params: DeployMenuPageReqVO): Promise<PageResult<DeployMenuRespVO[]>> => {
    return await request.get({ url: `/lowcode/designer-editor/deploy-menu/page`, params })
  }
}
