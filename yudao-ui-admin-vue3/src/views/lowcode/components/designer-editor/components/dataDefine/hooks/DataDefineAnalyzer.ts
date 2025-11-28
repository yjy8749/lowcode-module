import { generateRandomStr } from '@/utils'
import { generateVid, jsonStringify, readValueByJsonPath } from '../../../../common/utils'
import { isArray, isNullOrUnDef, isEmpty, isObject } from '@/utils/is'
import {
  DATA_EMPTY_NAME_FLAG,
  DATA_ROOT_ITEM_FLAG,
  DATA_VALUE_ITEM_FLAG,
  DesignerEditor,
  WidgetDataDefine,
  WidgetDataDefinePropDefine,
  WidgetDataDefinePropType,
  WidgetPropDefineBind,
  WidgetPropDefineBindBase
} from '../../../designer-editor.type'
import {
  requestDataDefine,
  executeBindRefFunction,
  executeValueFunction,
  useDataDefine
} from '../../../designer-editor.utils'
import { useDataDefineExecutor } from './dataExecutor'

const EXTRACT_VALUE_TYPE_MAP = {
  '[object String]': 'string',
  '[object Number]': 'number',
  '[object Boolean]': 'boolean',
  '[object Object]': 'object',
  '[object Array]': 'array',
  '[object Null]': 'undefined',
  '[object Undefined]': 'undefined'
}
export default class DataDefineAnalyzer {
  readonly editor: DesignerEditor
  readonly dataDefine: WidgetDataDefine

  public static of(editor: DesignerEditor, dataDefine: WidgetDataDefine): DataDefineAnalyzer {
    return new DataDefineAnalyzer(editor, dataDefine)
  }

  constructor(editor: DesignerEditor, dataDefine: WidgetDataDefine) {
    this.editor = editor
    this.dataDefine = dataDefine
  }

  // 工具函数

  // 提取值类型
  private extractValueType(value?: any): WidgetDataDefinePropType {
    const prototypeStr = Object.prototype.toString.call(value)
    const typeStr = EXTRACT_VALUE_TYPE_MAP[prototypeStr]
    return !isNullOrUnDef(typeStr) ? typeStr : 'undefined'
  }

  // 合并数组元素属性
  private mergedItemObject(array?: any[]) {
    return array?.reduce((accumulator, currentObject, index) => {
      if (index === 0) {
        return { ...accumulator, ...currentObject }
      }
      return Object.entries(currentObject).reduce((acc, [key, value]) => {
        if (!isNullOrUnDef(value) || !(key in acc)) {
          return { ...acc, [key]: value }
        }
        return acc
      }, accumulator)
    }, {})
  }

  // 生成json时根据类型生成默认值
  private generateValueByType(type?: string, value: any = undefined): any | undefined {
    switch (type) {
      case 'string':
        return isEmpty(value) ? generateRandomStr(6) : String(value)
      case 'number':
        return isEmpty(value) ? Math.round(Math.random() * 100) : Number(value)
      case 'boolean':
        return isEmpty(value) ? false : Boolean(value)
      default:
        return undefined
    }
  }

  // 根据属性定义生成属性值
  private generateValueByDefine(def: WidgetDataDefinePropDefine): any {
    if (def.type == 'object') {
      return this.generateJsonObject(def.itemDefines)
    } else if (def.type == 'array') {
      if (def.itemType != 'object' && def.itemType != 'array') {
        if (!isEmpty(def.value)) {
          return JSON.parse(def.value ?? '[]')
        } else {
          return Array.from({ length: 3 }).map(() => this.generateValueByType(def.itemType))
        }
      } else {
        return Array.from({ length: 3 }).map(() => this.generateJsonObject(def.itemDefines))
      }
    } else {
      return this.generateValueByType(def.type, def.value)
    }
  }

  // 根据数据结构定义生成json对象
  private generateJsonObject(propDefines?: WidgetDataDefinePropDefine[]): any {
    const jsonData = {}
    propDefines?.forEach((def) => {
      jsonData[def.name ?? ''] = this.generateValueByDefine(def)
    })
    if (jsonData.hasOwnProperty(DATA_EMPTY_NAME_FLAG)) {
      return jsonData[DATA_EMPTY_NAME_FLAG]
    }
    return jsonData
  }

  // 提取对象属性定义
  private extractTypeDefinitions(obj: any, objKey: string): WidgetDataDefinePropDefine[] {
    const objType = this.extractValueType(obj)
    if (objType == 'object') {
      const typeDefinitions: WidgetDataDefinePropDefine[] = []
      for (const key in obj) {
        const objPropKey = `${objKey}.${key}`
        const propValue = obj[key]
        const type: WidgetDataDefinePropDefine['type'] = this.extractValueType(propValue)
        let itemType: WidgetDataDefinePropDefine['itemType'] = undefined
        let itemDefines: WidgetDataDefinePropDefine['itemDefines'] = undefined
        let value: WidgetDataDefinePropDefine['value'] = undefined

        if (!isNullOrUnDef(propValue)) {
          if (isArray(propValue)) {
            const firstItemData = propValue.filter((i) => !isNullOrUnDef(i))[0]
            if (!isNullOrUnDef(firstItemData)) {
              if (isArray(firstItemData)) {
                itemType = 'array'
                itemDefines = this.extractTypeDefinitions(firstItemData, objPropKey)
              } else if (isObject(firstItemData)) {
                itemType = 'object'
                const mergedItemData = this.mergedItemObject(propValue)
                itemDefines = this.extractTypeDefinitions(mergedItemData, objPropKey)
              } else {
                itemType = this.extractValueType(firstItemData)
                value = JSON.stringify(propValue)
              }
            } else {
              itemType = 'undefined'
            }
          } else if (isObject(propValue)) {
            itemDefines = this.extractTypeDefinitions(propValue, objPropKey)
          } else {
            value = String(propValue)
          }
        }
        typeDefinitions.push({
          _vid: generateVid(),
          _key: objPropKey,
          name: key,
          type,
          itemType,
          itemDefines,
          value
        })
      }
      return typeDefinitions
    } else if (objType == 'array') {
      const arrayObj = {}
      arrayObj[DATA_EMPTY_NAME_FLAG] = obj
      return this.extractTypeDefinitions(arrayObj, objKey)
    } else {
      return [
        {
          _vid: generateVid(),
          _key: `${objKey}.${DATA_VALUE_ITEM_FLAG}`,
          name: DATA_VALUE_ITEM_FLAG,
          type: objType,
          value: String(obj)
        }
      ]
    }
  }

  // 提取备份定义属性映射
  private extractPropDefineKeyMapping(
    defines?: WidgetDataDefinePropDefine[]
  ): Record<string, WidgetDataDefinePropDefine> {
    const backupPropDefinesMapping: Record<string, WidgetDataDefinePropDefine> = {}
    const extractPropDefinesMapping = (defines?: WidgetDataDefinePropDefine[]) => {
      defines?.forEach((dataDefine) => {
        // 判断是否保留属性定义的属性仅保留 id, comment
        if (!isNullOrUnDef(dataDefine._vid) && !isEmpty(dataDefine.comment)) {
          backupPropDefinesMapping[dataDefine._key ?? ''] = dataDefine
        }
        extractPropDefinesMapping(dataDefine.itemDefines)
      })
    }
    extractPropDefinesMapping(defines)
    return backupPropDefinesMapping
  }

  // 属性已有定义,重新生成定义时保留备注信息
  private keepBackupPropDefines(
    propDefines?: WidgetDataDefinePropDefine[],
    backupMap?: Record<string, WidgetDataDefinePropDefine>
  ) {
    return propDefines?.map((def) => {
      const backupDef = backupMap?.[def._key ?? '']
      return {
        ...def,
        _vid: backupDef?._vid ?? def._vid,
        comment: !isEmpty(backupDef?.comment) ? backupDef?.comment : def.comment,
        itemDefines: this.keepBackupPropDefines(def.itemDefines, backupMap)
      }
    })
  }

  //更新属性定义Key
  public replacePropDefinesKey(
    propDefines?: WidgetDataDefinePropDefine[],
    oldKey?: string,
    newKey?: string
  ): WidgetDataDefinePropDefine[] {
    if (!isNullOrUnDef(oldKey) && !isNullOrUnDef(newKey)) {
      return (propDefines ?? []).map((def) => {
        return {
          ...def,
          _key: def._key?.replace(oldKey ?? '', newKey ?? ''),
          itemDefines: this.replacePropDefinesKey(def.itemDefines, oldKey, newKey)
        }
      })
    } else {
      return propDefines ?? []
    }
  }

  // 重置属性Key
  public reUpdatePropDefinesRootKey(propDefines?: WidgetDataDefinePropDefine[], rootKey?: string) {
    const reUpdateKey = (
      defines?: WidgetDataDefinePropDefine[],
      objKey?: string
    ): WidgetDataDefinePropDefine[] => {
      return (defines ?? []).map((def) => {
        return {
          ...def,
          _key: `${objKey}.${def.name}`,
          itemDefines: reUpdateKey(def.itemDefines, `${objKey}.${def.name}`)
        }
      })
    }

    return reUpdateKey(propDefines, rootKey ?? DATA_ROOT_ITEM_FLAG)
  }

  // 修改函数

  // 设置引用&绑定函数
  public setRefBindRefFunction(refFunction: WidgetPropDefineBind['refFunction']) {
    this.dataDefine.refBind = { ...this.dataDefine.refBind, refFunction }
  }

  // 设置数据类型定义
  public setPropDefines(propDefines: WidgetDataDefine['propDefines']) {
    this.dataDefine.propDefines = propDefines
  }

  // 设置JSON数据
  public setJsonData(jsonData: WidgetDataDefine['jsonData']) {
    this.dataDefine.jsonData = jsonData
  }

  public seekRefPropDefine(
    refBind?: WidgetPropDefineBindBase
  ): WidgetDataDefinePropDefine | undefined {
    if (!isNullOrUnDef(refBind)) {
      const { refPropKey } = refBind
      const { refWidgetId, refDataId } = refBind.bind ?? {}
      const refDefine = useDataDefine(this.editor, { _vid: refWidgetId }, { _vid: refDataId })
      return this.findPropDefineByKey(refDefine?.propDefines, refPropKey)
    } else {
      return {
        _vid: generateVid(),
        name: DATA_EMPTY_NAME_FLAG,
        type: 'undefined'
      }
    }
  }
  public findPropDefineByKey(
    propDefines?: WidgetDataDefinePropDefine[],
    refPropKey?: string
  ): WidgetDataDefinePropDefine | undefined {
    if (!isNullOrUnDef(propDefines) && !isNullOrUnDef(refPropKey)) {
      if (refPropKey == DATA_ROOT_ITEM_FLAG) {
        return {
          _vid: generateVid(),
          _key: DATA_ROOT_ITEM_FLAG,
          name: DATA_EMPTY_NAME_FLAG,
          type: 'object',
          itemDefines: propDefines
        }
      }
      const seekPropDefines = (list?: WidgetDataDefinePropDefine[]) => {
        for (const item of list ?? []) {
          if (item._key === refPropKey) {
            return item
          }
          if (isArray(item.itemDefines)) {
            const result = seekPropDefines(item.itemDefines)
            if (result) {
              return result
            }
          }
        }
        return undefined
      }
      return seekPropDefines(propDefines)
    }
    return undefined
  }

  // 重置属性Key
  public resetPropDefinesKey(rootKey?: string) {
    rootKey = rootKey ?? DATA_ROOT_ITEM_FLAG
    const propDefines = this.reUpdatePropDefinesRootKey(this.dataDefine.propDefines, rootKey)
    this.setPropDefines(propDefines)
  }

  // 生成JSON
  public tryGenerateJsonData(): boolean {
    try {
      this.setJsonData(jsonStringify(this.generateJsonObject(this.dataDefine.propDefines ?? [])))
      return true
    } catch (error) {
      console.error('tryGenerateJsonData', error)
      return false
    }
  }

  // 解析定义
  public tryAnalysisDefines(backupMapping?: Record<string, WidgetDataDefinePropDefine>): boolean {
    try {
      backupMapping ??= this.extractPropDefineKeyMapping(this.dataDefine.propDefines)
      this.setPropDefines(
        this.extractTypeDefinitions(
          JSON.parse(this.dataDefine.jsonData ?? '{}'),
          DATA_ROOT_ITEM_FLAG
        )
      )
      this.resetPropDefinesKey()
      if (!isNullOrUnDef(backupMapping)) {
        this.setPropDefines(this.keepBackupPropDefines(this.dataDefine.propDefines, backupMapping))
      }
      return true
    } catch (error) {
      console.error('tryAnalysisDefines', error)
      return false
    }
  }

  // 发送测试请求获取响应数据
  public async testRemoteRequest() {
    const resp = await requestDataDefine(this.editor, this.dataDefine)
    this.dataDefine.responseBody = jsonStringify(resp)
  }

  // 从发送请求,获取远程数据并解析定义
  public async tryAnalysisRemoteDefines(): Promise<boolean> {
    const resp = await requestDataDefine(this.editor, this.dataDefine)
    this.dataDefine.responseBody = jsonStringify(resp)
    this.setJsonData(jsonStringify(readValueByJsonPath(resp, this.dataDefine.jsonDataPath)))
    return this.tryAnalysisDefines()
  }

  // 解析refBind propDefines
  private analysisGetRefBindPropDefines(): WidgetDataDefinePropDefine[][] {
    const bindList = this.dataDefine.refBind.bindList ?? []
    return bindList.map((refBind) => {
      const refPropDefine = this.seekRefPropDefine(refBind)
      if (!isNullOrUnDef(refPropDefine)) {
        const reNameRefPropDefine: WidgetDataDefinePropDefine = {
          ...refPropDefine,
          name: DATA_EMPTY_NAME_FLAG
        }
        const oldKey = refBind?.refPropKey
        let newKey = DATA_ROOT_ITEM_FLAG
        if (reNameRefPropDefine.type == 'array') {
          newKey = `${DATA_ROOT_ITEM_FLAG}.${DATA_EMPTY_NAME_FLAG}`
        }
        return this.replacePropDefinesKey([reNameRefPropDefine], oldKey, newKey)
      }
      return []
    })
  }

  // 解析refBind
  private tryAnalysisRefBind(
    refBindPropDefines: WidgetDataDefinePropDefine[][],
    backupMapping?: Record<string, WidgetDataDefinePropDefine>
  ): boolean {
    const refFunction = this.dataDefine.refBind?.refFunction
    const refDataListArgs = refBindPropDefines.map((def) => this.generateJsonObject(def))
    let jsonObj: any = executeBindRefFunction(refFunction, refDataListArgs)
    if (!isEmpty(this.dataDefine.runtimeFunction)) {
      jsonObj = executeValueFunction(this.dataDefine.runtimeFunction, jsonObj)
    }
    if (!isEmpty(this.dataDefine.analyzerFunction)) {
      jsonObj = executeValueFunction(this.dataDefine.analyzerFunction, jsonObj)
    }
    this.setJsonData(jsonStringify(jsonObj))
    return this.tryAnalysisDefines(backupMapping)
  }

  // 解析引用定义
  public tryAnalysisRefDefines(): boolean {
    const refBindPropDefines = this.analysisGetRefBindPropDefines()
    if (!isEmpty(refBindPropDefines)) {
      const backupMapping = this.extractPropDefineKeyMapping([
        ...refBindPropDefines[0],
        ...(this.dataDefine.propDefines ?? [])
      ])
      return this.tryAnalysisRefBind(refBindPropDefines, backupMapping)
    }
    return false
  }

  // 解析绑定定义
  public tryAnalysisBindDefines(): boolean {
    const refBindPropDefines = this.analysisGetRefBindPropDefines()
    if (!isEmpty(refBindPropDefines)) {
      const backupMapping = this.extractPropDefineKeyMapping(refBindPropDefines[0])
      return this.tryAnalysisRefBind(refBindPropDefines, backupMapping)
    }
    return false
  }

  // 解析Runtime定义
  public tryAnalysisRuntimeDefines(): boolean {
    const refBindPropDefines = this.analysisGetRefBindPropDefines()
    if (!isEmpty(refBindPropDefines)) {
      const backupMapping = this.extractPropDefineKeyMapping(this.dataDefine.propDefines)
      return this.tryAnalysisRefBind(refBindPropDefines, backupMapping)
    }
    return false
  }

  // 解析Const定义
  public tryAnalysisConstDefines(): boolean {
    const { value } = useDataDefineExecutor(this.editor, {
      dataDefine: this.dataDefine
    })
    const jsonObj = value.value
    if (!isNullOrUnDef(jsonObj)) {
      this.setJsonData(jsonStringify(jsonObj))
    }
    return this.tryAnalysisDefines()
  }
}
