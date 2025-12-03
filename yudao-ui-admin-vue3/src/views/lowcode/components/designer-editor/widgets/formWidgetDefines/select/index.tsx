// index.tsx
import Render from './index.render.vue'
import { WidgetDefine } from '../../../designer-editor.type'
import {
  evalFunctionDefine,
  eventDefine,
  inputDefine,
  inputNumberDefine,
  switchDefine
} from '../../../designer-editor.props'
import { formItemAdvDefine, formItemBaseDefine } from '../../hooks/useFormItemWidget'
import { highlightTextHtml } from '../../../../common/utils'

const widget: WidgetDefine = {
  label: '选择器Select',
  icon: 'ep:edit',
  render: (args) => () => {
    return <Render {...args} />
  },
  baseDesignerProps: [
    switchDefine({ key: 'clearable', label: '是否支持一键清空' }),
    inputDefine({ key: 'prefixIcon', label: '前缀图标' }),
    switchDefine({ key: 'multiple', label: '是否支持多选' }),
    switchDefine({
      key: 'collapseTags',
      label: '是否折叠标签',
      defaultValue: true,
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
    switchDefine({ key: 'filterable', label: '是否支持筛选' }),
    switchDefine({ key: 'remote', label: '是否远程加载' }),
    inputDefine({
      key: 'dictType',
      label: '字典类型',
      isShow: ({ widget }) => !widget.props.remote
    }),
    evalFunctionDefine(
      { key: 'remoteMethod', label: '选项加载函数', isShow: ({ widget }) => widget.props.remote },
      {
        helps: `可筛选时 ${highlightTextHtml('$args[0]')} 为查询值，返回字典类型数组 ${highlightTextHtml('{ label, value }')}`,
        defaultFunction: '/** 返回 { label, value } 数组 */\n' + 'return Promise.resolve([])'
      }
    ),
    ...formItemBaseDefine(),
    inputDefine({ key: 'placeholder', label: '输入提示文本' }),
    inputDefine({ key: 'defaultValue', label: '默认值' })
  ],
  advDesignerProps: formItemAdvDefine(),
  events: [eventDefine('change', { label: '值改变' })]
}
export default widget
