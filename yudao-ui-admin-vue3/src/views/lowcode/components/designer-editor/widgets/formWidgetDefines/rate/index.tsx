// index.tsx
import Render from './index.render.vue'
import { WidgetDefine } from '../../../designer-editor.type'
import {
  colorPickerDefine,
  eventDefine,
  inputDefine,
  inputNumberDefine,
  switchDefine
} from '../../../designer-editor.props'
import { formItemAdvDefine, formItemBaseDefine } from '../../hooks/useFormItemWidget'
import { writePropValuesCmd } from '../../../designer-editor.cmd'

const widget: WidgetDefine = {
  label: 'Rate 评分',
  icon: 'ep:edit',
  render: (args) => () => {
    return <Render {...args} />
  },
  baseDesignerProps: [
    inputNumberDefine({ key: 'max', label: '最大分值', defaultValue: 5 }, { min: 0, precision: 0 }),
    switchDefine({ key: 'allowHalf', label: '是否支持半选' }),
    inputNumberDefine(
      {
        key: 'lowThreshold',
        label: '低分界限值',
        helps: '小于该值将被划分为低分',
        defaultValue: 2
      },
      { min: 0, precision: 0 }
    ),
    inputNumberDefine(
      {
        key: 'highThreshold',
        label: '高分界限值',
        helps: '大于该值将被划分为高分',
        defaultValue: 4
      },
      { min: 0, precision: 0 }
    ),
    colorPickerDefine({ key: 'voidColor', label: '未选中时的颜色' }),
    colorPickerDefine({ key: 'colors', label: '各分段对应的颜色', isArray: true, maxLength: 3 }),
    switchDefine({
      key: 'showText',
      label: '是否显示辅助文字',
      helps: '辅助文字 和 分数 不能同时显示',
      onSave(editor, widget, __, propValue) {
        editor.executeCmd(
          writePropValuesCmd(editor, {
            widget: widget,
            values: {
              showText: propValue,
              showScore: !propValue && widget.props.showScore
            }
          })
        )
      }
    }),
    switchDefine({
      key: 'showScore',
      label: '是否显示当前分数',
      helps: '辅助文字 和 分数 不能同时显示',
      onSave(editor, widget, __, propValue) {
        editor.executeCmd(
          writePropValuesCmd(editor, {
            widget: widget,
            values: {
              showScore: propValue,
              showText: !propValue && widget.props.showText
            }
          })
        )
      }
    }),
    colorPickerDefine({
      key: 'textColor',
      label: '辅助文字的颜色',
      isShow: ({ widget }) => widget.props.showText
    }),
    inputDefine({
      key: 'texts',
      label: '辅助文字',
      isArray: true,
      maxLength: 3,
      isShow: ({ widget }) => widget.props.showText
    }),
    ...formItemBaseDefine()
  ],
  advDesignerProps: formItemAdvDefine(),
  events: [eventDefine('change', { label: '值改变' })]
}
export default widget
