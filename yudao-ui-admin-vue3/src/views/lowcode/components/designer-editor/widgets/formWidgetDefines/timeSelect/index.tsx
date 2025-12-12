// index.tsx
import Render from './index.render.vue'
import { WidgetDefine } from '../../../designer-editor.type'
import { eventDefine, inputDefine, switchDefine } from '../../../designer-editor.props'
import { formItemAdvDefine, formItemBaseDefine } from '../../hooks/useFormItemWidget'

const widget: WidgetDefine = {
  label: 'TimeSelect 时间选择',
  icon: 'ep:edit',
  render: (args) => () => {
    return <Render {...args} />
  },
  baseDesignerProps: [
    switchDefine({ key: 'clearable', label: '是否支持一键清空', defaultValue: true }),
    switchDefine({ key: 'editable', label: '文本框是否可输入', defaultValue: true }),
    switchDefine({ key: 'includeEndTime', label: '是否在选项中包含end', defaultValue: true }),
    inputDefine({ key: 'start', label: '开始时间', defaultValue: '09:00' }),
    inputDefine({ key: 'end', label: '结束时间', defaultValue: '18:00' }),
    inputDefine({ key: 'step', label: '间隔时间', defaultValue: '00:30' }),
    inputDefine({ key: 'minTime', label: '最早时间点', helps: '早于该时间的时间段将被禁用' }),
    inputDefine({ key: 'maxTime', label: '最晚时间点', helps: '晚于该时间的时间段将被禁用' }),
    inputDefine({ key: 'format', label: '时间格式', defaultValue: 'HH:mm' }),
    inputDefine({ key: 'placeholder', label: '输入提示文本' }),
    ...formItemBaseDefine()
  ],
  advDesignerProps: formItemAdvDefine(),
  events: [eventDefine('change', { label: '值改变' })]
}
export default widget
