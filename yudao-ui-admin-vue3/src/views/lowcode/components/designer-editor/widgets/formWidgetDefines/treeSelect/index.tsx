// index.tsx
import { highlightTextHtml } from '../../../../common/utils'
import Render from './index.render.vue'
import {
  ElCommonTagTypeOptions,
  ElCommonTagEffectOptions,
  WidgetDefine
} from '../../../designer-editor.type'
import {
  eventDefine,
  inputDefine,
  switchDefine,
  evalFunctionDefine,
  inputNumberDefine,
  radioButtonDefine
} from '../../../designer-editor.props'
import { formItemAdvDefine, formItemBaseDefine } from '../../hooks/useFormItemWidget'

const widget: WidgetDefine = {
  label: 'TreeSelect 树形选择',
  icon: 'ep:edit',
  render: (args) => () => {
    return <Render {...args} />
  },
  baseDesignerProps: [
    switchDefine({ key: 'clearable', label: '是否支持一键清空', defaultValue: true }),
    inputDefine({ key: 'prefixIcon', label: '前缀图标' }, { _iconInput: true }),
    switchDefine({ key: 'multiple', label: '是否支持多选' }),
    switchDefine({
      key: 'collapseTags',
      label: '是否折叠标签',
      isShow: ({ widget }) => widget.props.multiple
    }),
    inputNumberDefine(
      {
        key: 'maxCollapseTags',
        label: '最多显示的标签数量',
        isShow: ({ widget }) => widget.props.multiple
      },
      { min: 0, precision: 0 }
    ),
    inputNumberDefine({
      key: 'multipleLimit',
      label: '最多可选择项目数',
      isShow: ({ widget }) => widget.props.multiple
    }),
    radioButtonDefine(
      {
        key: 'tagType',
        label: '标签类型',
        isShow: ({ widget }) => widget.props.multiple
      },
      ElCommonTagTypeOptions,
      {
        _cancelable: true
      }
    ),
    radioButtonDefine(
      {
        key: 'tagEffect',
        label: '标签效果',
        isShow: ({ widget }) => widget.props.multiple
      },
      ElCommonTagEffectOptions,
      {
        _cancelable: true
      }
    ),
    switchDefine({ key: 'defaultExpandAll', label: '是否默认展开所有节点' }),
    switchDefine({ key: 'showCheckbox', label: '是否显示复选框' }),
    switchDefine({ key: 'checkStrictly', label: '是否父子不互相关联选择' }),
    switchDefine({ key: 'filterable', label: '是否支持筛选' }),
    evalFunctionDefine(
      {
        key: 'filterMethod',
        label: '数据搜索函数',
        isShow: ({ widget }) => widget.props.filterable
      },
      {
        helps: `可筛选时 ${highlightTextHtml('$args[0]')} 为查询值，返回树节点数组`,
        defaultFunction:
          '/** 异步返回 { id, name, parentId, disabled, leaf } 数组 */\n' +
          'return Promise.resolve([])'
      }
    ),
    switchDefine({ key: 'lazy', label: '是否懒加载' }),
    evalFunctionDefine(
      { key: 'loadData', label: '数据加载函数' },
      {
        helps: `懒加载情况下 ${highlightTextHtml('$args[0]')} 为 node 数据，返回树节点数组`,
        defaultFunction:
          '/** 异步返回 { id, name, parentId, disabled, leaf } 数组 */\n' +
          'return Promise.resolve([])'
      }
    ),
    evalFunctionDefine(
      {
        key: 'loadCacheData',
        label: '缓存数据加载函数',
        helps: '懒加载时加载缓存数据,用于回显',
        isShow: ({ widget }) => widget.props.lazy
      },
      {
        helps: `${highlightTextHtml('$args[0]')} 为绑定属性值，返回树节点数组`,
        defaultFunction:
          '/** 异步返回 { id, name, parentId, disabled, leaf } 数组 */\n' +
          'return Promise.resolve([])'
      }
    ),
    inputDefine({ key: 'placeholder', label: '输入提示文本' }),
    ...formItemBaseDefine()
  ],
  advDesignerProps: formItemAdvDefine(),
  events: [eventDefine('change', { label: '值改变' })]
}
export default widget
