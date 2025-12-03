import { generateRandomStr } from '@/utils'
import { isNullOrUnDef, isObject, isEmpty, is, isFunction } from '@/utils/is'
import { useClipboard } from '@vueuse/core'

export const DATA_ROOT_ITEM_FLAG = '#'
export const DATA_EMPTY_NAME_FLAG = '-'
export const DATA_VALUE_ITEM_FLAG = '='

/**
 * json字符串格式化, 自定义序列化函数 处理正则
 */
export const jsonStringify = (obj: any) => {
  return JSON.stringify(
    obj,
    (_, value: any) => {
      if (value instanceof RegExp) {
        return value.toString() // 将正则表达式转换为字符串
      }
      return value
    },
    2
  )
}

/**
 * json字符串压缩
 */
export const jsonCompress = (str?: string) => {
  return str ? JSON.stringify(JSON.parse(str)) : undefined
}

/**
 * 根据json path提取数据
 */
export const readValueByJsonPath = (json?: any, jsonPath?: string): any | undefined => {
  if (isNullOrUnDef(json)) {
    return undefined
  }
  if (isNullOrUnDef(jsonPath)) {
    return undefined
  }
  if (isEmpty(jsonPath)) {
    return json
  }
  const parts = jsonPath!.split('.')
  if (
    parts[0] == DATA_ROOT_ITEM_FLAG ||
    parts[0] == DATA_VALUE_ITEM_FLAG ||
    parts[0] == DATA_EMPTY_NAME_FLAG
  ) {
    return readValueByJsonPath(json, parts.slice(1).join('.'))
  }
  if (parts.length == 1) {
    return json[parts[0]]
  }
  return readValueByJsonPath(json[parts[0]], parts.slice(1).join('.'))
}

/** 生成 _vid */
export function generateVid() {
  const timeStr = Date.now().toString(36)
  return `${timeStr}${generateRandomStr(24 - timeStr.length)}`
}

/** 自动补充 v-for key */
export function generateVForKey(list?: any[], force?: boolean, key?: string): any[] {
  key ??= '__key__'
  return (list ?? []).map((i) => {
    if (!isNullOrUnDef(i) && isObject(i) && (isNullOrUnDef(i[key]) || force)) {
      i[key] = generateVid()
    }
    return i
  })
}

/** 连接Key */
export function joinKeys(...keys: any[]): string {
  return keys.join('#')
}

/** 复制 */
export async function copyValue(val?: string, name?: string) {
  const copyName = name ?? ''
  try {
    const { copy } = useClipboard({ source: val ?? '' })
    await copy()
    useMessage().success(`${copyName}复制成功`)
  } catch (err) {
    console.error(err)
    useMessage().error(`${copyName}复制失败`)
  }
}

/** 延迟执行 */
export function asyncSleep(t: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, t))
}

/** 将 name 解析为 value */
export function getSourceValue(name: string) {
  if (name == 'querier') {
    return 1
  } else if (name == 'designer') {
    return 2
  } else if (name == 'integrator') {
    return 3
  } else {
    return -1
  }
}

/** 将 source 解析为 查询权限 */
export function sourceQueryPermiValue(name: string) {
  return `lowcode:${name}:query`
}

/** 将 source 解析为 Editor权限 */
export function sourceEditorPermiValue(name: string) {
  return `lowcode:${name}:editor`
}

/** 帮助说明文本高亮显示 */
export function highlightTextHtml(text: string) {
  const escapedText = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
  return `<b style='color:#E6A23C'>${escapedText}</b>`
}

/** 获取 格式化数值 单位 */
export function parseFormatNumUnit(value?: string): string {
  const match = value?.match(/[^0-9.]+$/)
  return match ? match[0] : ''
}

/** 获取 格式化数值 值 */
export function parseFormatNumValue(val?: string): number {
  const num = parseFloat(`${val}`.replace(/[^0-9]/gi, ''))
  return Number.isNaN(num) ? 0 : num
}

export function isPromise<T = any>(val: any): val is Promise<T> {
  return is(val, 'Promise') && isFunction(val.then) && isFunction(val.catch)
}

/**
 * 替换或删除选项数组中的项
 * @param options 原始选项数组，每项应包含 label 和 value
 * @param replaceMap 替换/删除映射：
 *   - 若 replaceMap[value] 为对象，则合并替换（{ ...item, ...replacement }）
 *   - 若 replaceMap[value] 为 null / false，则删除该项
 * @returns 新的选项数组
 */
export function transformOptions<T extends { label: string; value: string }>(
  options: T[],
  replaceMap: Record<string, Partial<T> | null | false>
): T[] {
  return options
    .map((item) => {
      const action = replaceMap[item.value]
      if (action === null || action === false) {
        return null // 标记为删除
      }
      if (action !== undefined) {
        return { ...item, ...action } as T
      }
      return item
    })
    .filter((item): item is T => item !== null)
}
