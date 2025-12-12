// index.tsx
import Render from './index.render.vue'
import { CssSymbols, WidgetDefine } from '../../../designer-editor.type'
import {
  evalFunctionDefine,
  eventDefine,
  formatInputNumberDefine,
  inputDefine
} from '../../../designer-editor.props'
import { formItemAdvDefine, formItemBaseDefine } from '../../hooks/useFormItemWidget'
import { highlightTextHtml } from '../../../../common/utils'

const widget: WidgetDefine = {
  label: 'Switch 开关',
  icon: 'ep:edit',
  render: (args) => () => {
    return <Render {...args} />
  },
  baseDesignerProps: [
    formatInputNumberDefine({ key: 'width', label: '宽度' }, { symbol: CssSymbols }),
    inputDefine({ key: 'activeIcon', label: '激活状态图标' }, { _iconInput: true }),
    inputDefine({ key: 'inactiveIcon', label: '关闭状态图标' }, { _iconInput: true }),
    inputDefine({ key: 'activeText', label: '激活状态文字' }),
    inputDefine({ key: 'inactiveText', label: '关闭状态文字' }),
    evalFunctionDefine(
      { key: 'activeValue', label: '激活状态值' },
      {
        type: 'simple-function',
        defaultFunction: '/** 同步或异步返回 */\n' + 'return true'
      }
    ),
    evalFunctionDefine(
      { key: 'inactiveValue', label: '关闭状态值' },
      {
        type: 'simple-function',
        defaultFunction: '/** 同步或异步返回 */\n' + 'return false'
      }
    ),
    evalFunctionDefine(
      { key: 'beforeChange', label: '状态改变前函数' },
      {
        helps: `切换状态时触发，${highlightTextHtml('$args[0]')} 为当前值，返回 false 则停止切换`,
        defaultFunction: '/** 同步或异步返回 */\n' + 'return true'
      }
    ),
    ...formItemBaseDefine()
  ],
  advDesignerProps: formItemAdvDefine(),
  events: [eventDefine('change', { label: '值改变' })]
}
export default widget
