import { isNullOrUnDef } from '@/utils/is'
import { joinKeys, generateVid } from '../../../../common/utils'
import {
  DesignerEditor,
  WidgetDataDefinePropDefine,
  WidgetInstance,
  WidgetPropDefineBind
} from '../../../designer-editor.type'
import { createDataDefine } from '../../../designer-editor.utils'
import { useDataDefineAnalyzer } from '../../../components/dataDefine/hooks'

export function getForItemDataId(widget: WidgetInstance): string {
  return joinKeys(widget._vid, 'v-for-item')
}

export function buildVforItemDefine(
  editor: DesignerEditor,
  widget: WidgetInstance,
  refBind?: WidgetPropDefineBind
) {
  if (isNullOrUnDef(refBind)) {
    return undefined
  }
  const { dataDefine, analyzer, tryAnalysisDataDefine } = useDataDefineAnalyzer(editor, {
    dataDefine: createDataDefine({ _type: 'ref', refBind: refBind })
  })

  // 分析引用数据定义
  tryAnalysisDataDefine()

  // 仅支持引用数组数据
  const refDataItemDefines = dataDefine.value.propDefines?.[0]
  if (refDataItemDefines?.type != 'array') {
    return undefined
  }

  // 分析时辅助结构生成函数
  const analyzerFunction = `
    // 生成默认json结构以便于解析属性定义
    (list) => {
      return {
          index: 0,
          length: list ? list.length : 0,
          isFirst: true,
          isLast: true,
          data: list ? list[0] : undefined
      }
    }
  `

  const runtimePropDefines: WidgetDataDefinePropDefine[] = [
    {
      _vid: generateVid(),
      _key: '#.index',
      name: 'index',
      type: 'number',
      comment: '数组索引'
    },
    {
      _vid: generateVid(),
      _key: '#.length',
      name: 'length',
      type: 'number',
      comment: '数组长度'
    },
    {
      _vid: generateVid(),
      _key: '#.isFirst',
      name: 'isFirst',
      type: 'boolean',
      comment: '是否第一个元素'
    },
    {
      _vid: generateVid(),
      _key: '#.isLast',
      name: 'isLast',
      type: 'boolean',
      comment: '是否最后一个元素'
    }
  ]

  const refDataItemDefinesReKeyed = analyzer.value.replacePropDefinesKey(
    [refDataItemDefines],
    refDataItemDefines._key,
    '#.data'
  )[0]

  const runtimeDataPropDefines: WidgetDataDefinePropDefine[] = [
    {
      ...refDataItemDefinesReKeyed,
      _vid: generateVid(),
      _key: '#.data',
      name: 'data',
      type: refDataItemDefines.itemType,
      itemType: undefined,
      comment: '数组数据'
    }
  ]

  const { dataDefine: itemDataDefine } = useDataDefineAnalyzer(editor, {
    dataDefine: createDataDefine({
      _vid: getForItemDataId(widget),
      widgetId: widget._vid,
      _type: 'runtime',
      name: 'item in v-for',
      scope: 'children',
      refBind,
      analyzerFunction,
      propDefines: [...runtimePropDefines, ...runtimeDataPropDefines]
    })
  })

  return toRaw(itemDataDefine.value)
}
