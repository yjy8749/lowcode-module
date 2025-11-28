import { highlightTextHtml } from '../../../../common/utils'
import {
  actionButtonDefine,
  evalFunctionDefine,
  eventDefine,
  switchDefine
} from '../../../designer-editor.props'
import { WidgetDefine } from '../../../designer-editor.type'
import Render from './index.render.vue'

const widget: WidgetDefine = {
  label: 'EasyTree',
  icon: 'svg-icon:lowcode-icon-tree',
  render: (args) => () => {
    return <Render {...args} />
  },
  baseDesignerProps: [
    switchDefine({ key: 'highlightCurrent', label: '是否高亮当前选中节点' }),
    switchDefine({ key: 'defaultExpandAll', label: '是否默认展开所有节点' }),
    switchDefine({
      key: 'accordion',
      label: '是否手风琴模式展开节点',
      helps: '每次只打开一个同级树节点展开'
    }),
    switchDefine({ key: 'lazy', label: '是否懒加载' }),
    switchDefine({
      key: 'expandOnClickNode',
      label: '点击时是否展开或收缩节点',
      defaultValue: false
    }),
    switchDefine({
      key: 'checkOnClickNode',
      label: '点击时是否选中节点',
      defaultValue: true
    }),
    evalFunctionDefine(
      { key: 'loadData', label: '数据加载函数' },
      {
        helps: `懒加载情况下 ${highlightTextHtml('$args[0]')} 为 node 数据`,
        defaultFunction: '/** 返回数据 */\n' + 'return Promise.resolve([])'
      }
    ),
    actionButtonDefine({ key: 'createButton', label: '创建按钮' }),
    actionButtonDefine(
      { key: 'menuButtons', label: '节点菜单按钮', isArray: true },
      {
        helps: `${highlightTextHtml('$args[0]')} 为 node 数据`,
        isMenuButton: true
      }
    )
  ],
  events: [eventDefine('node-click', { type: 'function', label: '树节点点击' })]
}
export default widget
