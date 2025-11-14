// index.tsx
import { generateVid, highlightTextHtml } from '../../../../common/utils'
import Render from './index.render.vue'
import { WidgetDefine } from '../../../designer-editor.type'
import {
  eventDefine,
  inputDefine,
  switchDefine,
  evalFunctionDefine
} from '../../../designer-editor.props'
import { formItemAdvDefine, formItemBaseDefine } from '../../hooks/useFormItemWidget'

const widget: WidgetDefine = {
  _vid: generateVid(),
  label: '树形选择TreeSelect',
  icon: 'ep:edit',
  render: (args) => () => {
    return <Render {...args} />
  },
  baseDesignerProps: [
    switchDefine({ key: 'clearable', label: '是否支持一键清空' }),
    ...formItemBaseDefine(),
    inputDefine({ key: 'defaultValue', label: '默认值' }),
    switchDefine({ key: 'defaultExpandAll', label: '是否默认展开所有节点' }),
    switchDefine({ key: 'showCheckbox', label: '是否显示复选框' }),
    switchDefine({
      key: 'checkStrictly',
      label: '是否父子不互相关联选择',
      isShow: ({ widget }) => widget.props.showCheckbox
    }),
    switchDefine({ key: 'lazy', label: '是否懒加载' }),
    evalFunctionDefine(
      { key: 'loadData', label: '数据加载函数' },
      {
        helps: `懒加载情况下 ${highlightTextHtml('$args[0]')} 为 node 数据`,
        defaultFunction: '/** 返回数据 */\n' + 'return Promise.resolve([])'
      }
    ),
    evalFunctionDefine(
      {
        key: 'loadCacheData',
        label: '缓存数据加载函数',
        isShow: ({ widget }) => widget.props.lazy,
        helps: '懒加载时加载缓存数据,用于回显'
      },
      {
        helps: `${highlightTextHtml('$args[0]')} 为表单 属性值`,
        defaultFunction: '/** 返回数据 */\n' + 'return Promise.resolve([])'
      }
    )
  ],
  advDesignerProps: [
    switchDefine({ key: 'disabled', label: '是否禁用', bindable: true }),
    ...formItemAdvDefine()
  ],
  events: [eventDefine('change', { label: '值改变' })]
}
export default widget
