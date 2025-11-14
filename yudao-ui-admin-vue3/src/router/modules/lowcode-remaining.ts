import { Layout } from '@/utils/routerHelper'

const remainingRouter: AppRouteRecordRaw[] = [
  {
    path: '/lowcode',
    component: Layout,
    name: 'Lowcode',
    meta: {
      hidden: true
    },
    children: [
      {
        path: 'querier/editor/:id',
        name: 'LowcodeQuerierEditor',
        meta: {
          title: '查询器-查询定义',
          noCache: true,
          hidden: true,
          activeMenu: '/lowcode/querier'
        },
        component: () => import('@/views/lowcode/querier/editor/index.vue')
      },
      {
        path: 'designer/editor/:id',
        name: 'LowcodeDesignerEditor',
        meta: {
          title: '设计器-页面设计',
          noCache: true,
          hidden: true,
          activeMenu: '/lowcode/designer'
        },
        component: () => import('@/views/lowcode/designer/editor/index.vue')
      },
      {
        path: 'integrator/editor/:id',
        name: 'LowcodeIntegratorEditor',
        meta: {
          title: '集成器-集成配置',
          noCache: true,
          hidden: true,
          activeMenu: '/lowcode/integrator/index'
        },
        component: () => import('@/views/lowcode/integrator/editor/index.vue')
      }
    ]
  }
]

export default remainingRouter
