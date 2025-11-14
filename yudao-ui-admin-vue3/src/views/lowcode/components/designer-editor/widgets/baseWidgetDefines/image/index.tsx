// index.tsx
import { generateVid } from '../../../../common/utils'
import Render from './index.render.vue'
import { CssSymbols, WidgetDefine, WidgetInstance } from '../../../designer-editor.type'
import {
  formatInputNumberDefine,
  inputDefine,
  inputNumberDefine,
  selectDefine,
  switchDefine
} from '../../../designer-editor.props'

const CloudTypeOptoins = [
  {
    label: '阿里云',
    value: 'aliyun'
  }
]

const ElImageFitType = [
  { label: 'Fill', value: 'fill' },
  { label: 'Contain', value: 'contain' },
  { label: 'Cover', value: 'cover' },
  { label: 'Scale-down', value: 'scale-down' },
  { label: 'None', value: 'none' }
]

function isAliyun(widget: WidgetInstance): boolean {
  return widget.props.cloudType == 'aliyun'
}

const widget: WidgetDefine = {
  _vid: generateVid(),
  label: '图片Image',
  icon: 'ep:picture',
  render: (args) => () => {
    return <Render {...args} />
  },
  baseDesignerProps: [
    formatInputNumberDefine({ key: 'width', label: '图片宽度' }, { symbol: CssSymbols }),
    formatInputNumberDefine({ key: 'height', label: '图片高度' }, { symbol: CssSymbols }),
    selectDefine({ key: 'fit', label: '图片填充类型' }, ElImageFitType),
    switchDefine({ key: 'lazy', label: '是否使用懒加载' }),
    selectDefine({ key: 'cloudType', label: '图床类型', defaultValue: 'aliyun' }, CloudTypeOptoins),
    inputDefine({
      key: 'defaultArgs',
      label: '默认加载参数',
      defaultValue: 'x-oss-process=style/lowQuality',
      isShow: ({ widget }) => isAliyun(widget)
    }),
    switchDefine({
      key: 'progressive',
      label: '是否渐进式加载',
      isShow: ({ widget }) => isAliyun(widget)
    }),
    inputDefine({
      key: 'thumbnailArgs',
      label: '缩略图加载参数',
      defaultValue: 'x-oss-process=style/thumbnail',
      isShow: ({ widget }) => isAliyun(widget) && widget.props.progressive
    }),
    switchDefine({ key: 'preview', label: '是否开启预览', defaultValue: true }),
    inputDefine({
      key: 'previewArgs',
      label: '预览图加载参数',
      defaultValue: 'x-oss-process=style/watermark',
      isShow: ({ widget }) => isAliyun(widget) && widget.props.preview
    })
  ],
  advDesignerProps: [
    inputDefine({
      key: 'src',
      label: '图片地址',
      defaultValue: 'https://picsum.photos/200/300',
      bindable: true
    }),
    inputDefine({
      key: 'alt',
      label: '图片描述',
      bindable: true
    }),
    inputDefine({
      key: 'previewSrcList',
      label: '图片预览列表',
      isArray: true,
      bindable: true,
      isShow: ({ widget }) => widget.props.preview
    }),
    inputNumberDefine(
      {
        key: 'initialIndex',
        label: '初始预览图像索引',
        bindable: true,
        isShow: ({ widget }) => widget.props.preview
      },
      { min: 0 }
    )
  ]
}
export default widget
