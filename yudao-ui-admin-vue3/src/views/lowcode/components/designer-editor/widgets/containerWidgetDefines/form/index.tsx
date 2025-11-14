import { generateVid } from '../../../../common/utils'
import Render from './index.render.vue'
import {
  CssSymbols,
  ElCommonSizeOptions,
  LayoutJustifyOptions,
  WidgetDefine
} from '../../../designer-editor.type'
import { createSlotItem, createWidgetInstanceDefault } from '../../../designer-editor.utils'
import {
  formatInputNumberDefine,
  inputDefine,
  propBindDefine,
  radioButtonDefine,
  selectDefine,
  switchDefine
} from '../../../designer-editor.props'
import { isNullOrUnDef } from '@/utils/is'
import { buildConstDataDefines } from './utils'
import { getFormModelDataId } from '../../hooks'

const ElFormLabelPositionOptions = [
  { label: '靠左', value: 'left' },
  { label: '靠右', value: 'right' },
  { label: '上方', value: 'top' }
]

const widget: WidgetDefine = {
  _vid: generateVid(),
  label: '表单容器',
  icon: 'ep:finished',
  tips: '表单元素部分属性变更后需刷新组件后生效',
  disableInMenu(action, _, ctx) {
    return (
      action == 'add' &&
      !isNullOrUnDef(
        ctx?.seekParent?.({
          _moduleName: 'containerWidgetDefines',
          _key: 'form'
        }).seekWidget
      )
    )
  },
  render: (args) => () => {
    return <Render {...args} />
  },
  baseDesignerProps: [
    switchDefine({ key: 'compact', label: '是否紧凑型表单' }),
    selectDefine({ key: 'size', label: '表单元素尺寸' }, ElCommonSizeOptions),
    switchDefine({ key: 'hideLabel', label: '是否隐藏表单标签' }),
    inputDefine({ key: 'labelSuffix', label: '标签文本后缀' }),
    formatInputNumberDefine({ key: 'labelWidth', label: '标签宽度' }, { symbol: CssSymbols }),
    selectDefine(
      {
        key: 'labelPosition',
        label: '标签文本位置',
        helps: '需配合标签宽度属性'
      },
      ElFormLabelPositionOptions
    ),
    radioButtonDefine(
      {
        key: 'requireAsteriskPosition',
        label: '必填项星号的位置'
      },
      ElFormLabelPositionOptions.slice(0, 2),
      {
        _cancelable: true
      }
    ),
    switchDefine({ key: 'hideRequiredAsterisk', label: '是否隐藏必填项星号' }),
    switchDefine({ key: 'statusIcon', label: '是否显示校验反馈图标' }),
    radioButtonDefine(
      {
        key: 'justify',
        label: '水平排列'
      },
      LayoutJustifyOptions.slice(0, 3),
      {
        _optionsOnlyIcon: true,
        _cancelable: true,
        _chunkSize: 3
      }
    )
  ],
  advDesignerProps: [
    propBindDefine({
      key: 'data',
      label: '绑定数据',
      bindType: ['object'],
      isDataDefineBindable: (widget, dataDefine) => {
        return dataDefine._vid != getFormModelDataId(widget)
      }
    }),
    switchDefine({ key: 'readonly', label: '是否表单只读', bindable: true }),
    switchDefine({ key: 'disabled', label: '是否禁用表单', bindable: true })
  ],
  create(editor, define) {
    const instance = createWidgetInstanceDefault(editor, define)
    instance.slots = [createSlotItem(editor)]
    instance.dataDefines = buildConstDataDefines(instance)
    return instance
  }
}
export default widget
