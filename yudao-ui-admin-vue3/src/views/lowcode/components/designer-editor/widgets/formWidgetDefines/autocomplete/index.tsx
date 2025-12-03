// index.tsx
import Render from './index.render.vue'
import { CommonTextPattern, WidgetDefine } from '../../../designer-editor.type'
import {
  evalFunctionDefine,
  eventDefine,
  inputDefine,
  inputNumberDefine,
  selectDefine,
  switchDefine
} from '../../../designer-editor.props'
import { formItemAdvDefine, formItemBaseDefine } from '../../hooks/useFormItemWidget'
import { highlightTextHtml } from '../../../../common/utils'

const widget: WidgetDefine = {
  label: '自动补全输入框',
  icon: 'ep:edit',
  render: (args) => () => {
    return <Render {...args} />
  },
  baseDesignerProps: [
    switchDefine({ key: 'clearable', label: '是否支持一键清空' }),
    inputDefine({ key: 'prefixIcon', label: '前缀图标' }),
    inputDefine({ key: 'suffixIcon', label: '后缀图标' }),
    switchDefine({ key: 'showWordLimit', label: '是否显示统计字数', helps: '需配合最大长度使用' }),
    inputNumberDefine({ key: 'minlength', label: '最小长度' }, { min: 0 }),
    inputNumberDefine({ key: 'maxlength', label: '最大长度' }, { min: 0 }),
    selectDefine({ key: 'textPattern', label: '文本格式' }, CommonTextPattern),
    evalFunctionDefine(
      { key: 'fetchSuggestions', label: '输入建议函数' },
      {
        helps: `${highlightTextHtml('$args[0]')} 为查询值\n返回建议数组 ${highlightTextHtml('{  value }')}`,
        defaultFunction: '/** 返回 { value } 数组 */\n' + 'return Promise.resolve([])'
      }
    ),
    switchDefine({ key: 'autofocus', label: '是否自动获取焦点' }),
    ...formItemBaseDefine(),
    inputDefine({ key: 'placeholder', label: '输入提示文本' }),
    inputDefine({ key: 'defaultValue', label: '默认值' })
  ],
  advDesignerProps: formItemAdvDefine(),
  events: [eventDefine('change', { label: '值改变' })]
}
export default widget
