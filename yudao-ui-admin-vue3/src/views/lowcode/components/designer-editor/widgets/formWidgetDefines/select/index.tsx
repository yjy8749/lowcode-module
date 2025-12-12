// index.tsx
import Render from './index.render.vue'
import {
  ElCommonTagTypeOptions,
  ElCommonTagEffectOptions,
  WidgetDefine
} from '../../../designer-editor.type'
import {
  evalFunctionDefine,
  eventDefine,
  inputDefine,
  inputNumberDefine,
  radioButtonDefine,
  switchDefine
} from '../../../designer-editor.props'
import { formItemAdvDefine, formItemBaseDefine } from '../../hooks/useFormItemWidget'
import { highlightTextHtml } from '../../../../common/utils'

const widget: WidgetDefine = {
  label: 'Select 选择器',
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
        helps: `可筛选时 ${highlightTextHtml('$args[0]')} 为查询值，返回字典数组`,
        defaultFunction:
          '/** 异步返回 { label, value, disabled } 数组 */\n' + 'return Promise.resolve([])'
      }
    ),
    evalFunctionDefine(
      {
        key: 'loadCacheData',
        label: '缓存选项加载函数',
        helps: '可用于加载缓存选项数据,用于回显',
        isShow: ({ widget }) => widget.props.remote && widget.props.filterable
      },
      {
        helps: `${highlightTextHtml('$args[0]')} 为绑定属性值，返回字典数组`,
        defaultFunction:
          '/** 异步返回 { label, value, disabled } 数组 */\n' + 'return Promise.resolve([])'
      }
    ),
    inputDefine({ key: 'placeholder', label: '输入提示文本' }),
    ...formItemBaseDefine()
  ],
  advDesignerProps: formItemAdvDefine(),
  events: [eventDefine('change', { label: '值改变' })]
}
export default widget
