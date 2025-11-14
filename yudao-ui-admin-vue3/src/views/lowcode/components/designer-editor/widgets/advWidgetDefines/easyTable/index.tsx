import Render from './index.render.vue'
import { generateVid } from '../../../../common/utils'
import { DesignerEditor, WidgetDefine } from '../../../designer-editor.type'
import { inputNumberDefine, propBindDefine, switchDefine } from '../../../designer-editor.props'
import { UseWidgetMenusArgs } from '../../../designer-editor.menu'
import { createWidgetContextDefault } from '../../../designer-editor.utils'
import { writeWidgetValuesCmd } from '../../../designer-editor.cmd'

const widget: WidgetDefine = {
  _vid: generateVid(),
  label: 'EasyTable',
  icon: 'svg-icon:lowcode-icon-table',
  render: (args) => () => {
    return <Render {...args} />
  },
  advDesignerProps: [
    switchDefine({ key: 'selectable', label: '是否可选择', bindable: true }),
    inputNumberDefine({ key: 'minSelectCount', label: '最少选择几条数据', bindable: true }),
    inputNumberDefine({ key: 'maxSelectCount', label: '最多选择几条数据', bindable: true }),
    propBindDefine({
      key: 'selectedRows',
      label: '预置已选择数据',
      bindType: ['any[]'],
      isShow({ widget }) {
        return widget.props.selectable
      }
    }),
    propBindDefine({
      key: 'appendSelectMode',
      label: '是否为追加选择模式',
      helps: '追加选择模式下,预置已选择数据不可取消选择',
      bindType: ['boolean'],
      isShow({ widget }) {
        return widget.props.selectable
      }
    })
  ],
  async create(editor, define) {
    const { openEasyTableConfigDialog } = editor.inject
    const context = createWidgetContextDefault(editor, define)
    const { props, slots, dataDefines } = await openEasyTableConfigDialog(context)
    const { widget } = context
    widget.props = props
    widget.slots = slots
    widget.dataDefines = dataDefines
    return widget
  },
  menus: (editor: DesignerEditor, args: UseWidgetMenusArgs) => {
    return [
      {
        icon: 'ep:set-up',
        label: '配置EasyTable',
        onClick: async () => {
          const { openEasyTableConfigDialog } = editor.inject
          const { props, slots, dataDefines } = await openEasyTableConfigDialog(args)
          editor.executeCmd({
            ...writeWidgetValuesCmd(editor, {
              widget: args.widget,
              values: { props, slots, dataDefines }
            }),
            executeSuccess() {
              editor.getStore().setRefresh(args.widget)
            },
            rollbackSuccess() {
              editor.getStore().setRefresh(args.widget)
            }
          })
        }
      }
    ]
  }
}
export default widget
