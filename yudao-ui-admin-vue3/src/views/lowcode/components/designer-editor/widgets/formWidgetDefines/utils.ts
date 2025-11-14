import { jsonStringify } from '../../../common/utils'
import { inputNumberDefine, selectDefine, switchDefine } from '../../designer-editor.props'
import { WidgetInstance } from '../../designer-editor.type'
import { isNullOrUnDef } from '@/utils/is'

export function isTextFormItem(widget: WidgetInstance): boolean {
  return widget._moduleName == 'formWidgetDefines' && ['input'].includes(widget._key)
}

export function textFormItemValidDefine() {
  return [
    switchDefine({ key: 'showWordLimit', label: '是否显示统计字数', helps: '需配合最大长度使用' }),
    inputNumberDefine({ key: 'minlength', label: '最小长度' }, { min: 0 }),
    inputNumberDefine({ key: 'maxlength', label: '最大长度' }, { min: 0 }),
    selectDefine(
      {
        key: 'textPattern',
        label: '文本格式'
      },
      [
        {
          label: '手机号',
          value: jsonStringify({ pattern: '^1\\d{10}$', message: '请输入正确的手机号码' })
        },
        {
          label: '邮箱',
          value: jsonStringify({
            pattern: '^([A-Za-z0-9_\\-\\.])+\\@([A-Za-z0-9_\\-\\.])+\\.([A-Za-z]{2,4})$',
            message: '请输入正确的邮箱'
          })
        },
        {
          label: '身份证号',
          value: jsonStringify({
            pattern:
              '^[1-9]\\d{5}(18|19|([23]\\d))\\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\\d{3}[0-9Xx]$',
            message: '请输入正确的身份证号'
          })
        },
        {
          label: 'URL连接',
          value: jsonStringify({
            pattern:
              '^((https?|ftp|file):\\/\\/)?([\\da-z\\.-]+)\\.([a-z\\.]{2,6})([\\/\\w\\.-]*)*\\/?$',
            message: '请输入正确的URL连接'
          })
        }
      ]
    )
  ]
}

export function textFormItemValidRules(widget: WidgetInstance): any[] {
  const rules: any[] = []
  if (isTextFormItem(widget)) {
    const { props } = widget
    if (!isNullOrUnDef(props.minlength) && props.minlength > 0) {
      rules.push({
        min: props.minlength,
        message: `不能少于${props.minlength}个字`,
        trigger: 'change'
      })
    }
    if (!isNullOrUnDef(props.maxlength) && props.maxlength > 0) {
      rules.push({
        max: props.maxlength,
        message: `不能多于${props.maxlength}个字`,
        trigger: 'change'
      })
    }
    if (!isNullOrUnDef(props.textPattern)) {
      rules.push(JSON.parse(props.textPattern))
    }
  }
  return rules
}
