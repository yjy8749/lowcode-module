import { isNullOrUnDef } from '@/utils/is'
import {
  DesignerEditor,
  WidgetDataDefine,
  WidgetDataDefinePropDefine
} from '../../../designer-editor.type'
import DataDefineAnalyzer from './DataDefineAnalyzer'

interface UseDataDefineAnalyzerArgs {
  dataDefine: WidgetDataDefine
}

export function useDataDefineAnalyzer(editor: DesignerEditor, args: UseDataDefineAnalyzerArgs) {
  const initAnalyzer = (editor: DesignerEditor, dataDefine: WidgetDataDefine) => {
    return DataDefineAnalyzer.of(editor, dataDefine)
  }

  const dataDefine = ref(reactive(args.dataDefine))
  const analyzer = ref(initAnalyzer(editor, dataDefine.value))

  const tryAnalysisDataDefine = () => {
    if (dataDefine.value._type == 'ref') {
      return analyzer.value.tryAnalysisRefDefines()
    } else if (dataDefine.value._type == 'bind') {
      return analyzer.value.tryAnalysisBindDefines()
    } else if (dataDefine.value._type == 'runtime') {
      return analyzer.value.tryAnalysisRuntimeDefines()
    } else if (dataDefine.value._type == 'const') {
      return analyzer.value.tryAnalysisConstDefines()
    } else {
      return false
    }
  }

  const updateAnalyzer = (args: UseDataDefineAnalyzerArgs) => {
    dataDefine.value = reactive(args.dataDefine)
    analyzer.value = initAnalyzer(editor, dataDefine.value)
    return {
      dataDefine,
      analyzer,
      setPropComment,
      tryAnalysisDataDefine
    }
  }

  const setPropComment = (_key?: string, _comment?: string) => {
    const setPropCommentRecursion = (list?: WidgetDataDefinePropDefine[]) => {
      if (!isNullOrUnDef(list) && !isNullOrUnDef(_key) && !isNullOrUnDef(_comment)) {
        for (const item of list) {
          if (item._key === _key) {
            item.comment = _comment
            return
          }
          setPropCommentRecursion(item.itemDefines)
        }
      }
    }

    setPropCommentRecursion(dataDefine.value.propDefines)
    return dataDefine.value
  }

  return {
    dataDefine,
    analyzer,
    updateAnalyzer,
    setPropComment,
    tryAnalysisDataDefine
  }
}
