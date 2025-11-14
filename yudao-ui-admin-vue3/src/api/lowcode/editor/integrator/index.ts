import request from '@/config/axios'

// 低代码-集成器配置 VO
export interface IntegratorConfigVO {
  id: number // 主键
  configName: string // 配置名称
  configType: number // 配置类型 0-本机 1-远程
  integrateEntry: string // 集成器入口
  integrateKey: string // 集成校验KEY
  comment: string // 备注
}
export interface IntegratorEntrySyncReqVO {
  configId: number
  isPull?: boolean
  fileId: number
  fileVersionList?: number[]
}
export interface IntegratorEntrySyncRespVO {
  result?: boolean
}

// 低代码-集成器 API
export const IntegratorEditorApi = {
  // 新增低代码-集成器配置
  createIntegratorConfig: async (data: IntegratorConfigVO) => {
    return await request.post({ url: `/lowcode/integrator-editor/config/create`, data })
  },
  // 修改低代码-集成器配置
  updateIntegratorConfig: async (data: IntegratorConfigVO) => {
    return await request.put({ url: `/lowcode/integrator-editor/config/update`, data })
  },
  // 删除低代码-集成器配置
  deleteIntegratorConfig: async (id: number) => {
    return await request.delete({ url: `/lowcode/integrator-editor/config/delete?id=` + id })
  },
  // 查询低代码-集成器配置详情
  getIntegratorConfig: async (id: number) => {
    return await request.get({ url: `/lowcode/integrator-editor/config/get?id=` + id })
  },
  // 查询低代码-集成器配置List
  getIntegratorConfigList: async (params: any) => {
    return await request.get({ url: `/lowcode/integrator-editor/config/list`, params })
  },
  // 获得低代码-集成器配置(本机)
  getLocalIntegratorConfig: async (): Promise<IntegratorConfigVO | undefined> => {
    return await request.get({ url: `/lowcode/integrator-editor/config/get-local` })
  },
  // 生成低代码-集成器配置(本机)
  genLocalIntegratorConfig: async (): Promise<IntegratorConfigVO> => {
    return await request.post({ url: `/lowcode/integrator-editor/config/gen-local` })
  },
  // 集成器-同步数据
  integratorEntrySync: async (
    data: IntegratorEntrySyncReqVO
  ): Promise<IntegratorEntrySyncRespVO> => {
    return await request.post({ url: `/lowcode/integrator-editor/sync`, data })
  }
}
