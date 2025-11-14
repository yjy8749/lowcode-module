import { DeepReadonly } from 'vue'
import { isEmpty, isNullOrUnDef } from '@/utils/is'
import { WidgetDefine, WidgetModuleInfo } from '../designer-editor.type'
import { widgetFullKey } from '../designer-editor.utils'

/** 导入组件模块数据 */
function importModuleInfos(): Record<string, WidgetModuleInfo> {
  const moduleInfos = import.meta.glob(['./*/index.ts', '!./hooks/index.ts'], {
    eager: true,
    import: 'default'
  }) as Record<string, any>
  const moduleInfoMap: Record<string, WidgetModuleInfo> = {}
  Object.entries(moduleInfos).forEach(([filePath, moduleInfo]) => {
    try {
      const [_moduleName] = filePath.replace(/\.\/(.*)\/index\.(ts)/, '$1').split('/')
      moduleInfoMap[_moduleName] = moduleInfo
    } catch (e) {
      console.error(`${filePath} importModuleInfo error`, e)
    }
  })
  return moduleInfoMap
}

/** 导入组件模块组件定义 */
function importWidgetDefines(): Record<string, Record<string, WidgetDefine>> {
  const widgetDefines = import.meta.glob(['./*/*/index.(tsx|ts|vue)'], {
    eager: true,
    import: 'default'
  }) as Record<string, any>

  const widgetDefinesMap: Record<string, Record<string, WidgetDefine>> = {}

  Object.entries(widgetDefines).forEach(([filePath, widgetDefine]) => {
    try {
      const [_moduleName, _key] = filePath.replace(/\.\/(.*)\/index\.(tsx|ts|vue)/, '$1').split('/')
      widgetDefinesMap[_moduleName] ??= {}
      widgetDefinesMap[_moduleName][_key] = widgetDefine
    } catch (e) {
      console.error(`${filePath} importWidgetDefines error`, e)
    }
  })

  return widgetDefinesMap
}

/** 组件&模块注册 */
function registry(): {
  registryWidgetModules: DeepReadonly<Record<string, WidgetModuleInfo>>
  registryWidgetDefines: DeepReadonly<Record<string, WidgetDefine>>
} {
  const registryWidgetModules: Record<string, WidgetModuleInfo> = {}
  const registryWidgetDefines: Record<string, WidgetDefine> = {}

  const registryWidget = (module: WidgetModuleInfo, define: WidgetDefine) => {
    if (isEmpty(define._key)) {
      console.error('registryWidget error', new Error(`widget key 不能为空`))
      return
    }
    if (!isNullOrUnDef(module.ignores) && module.ignores.includes(define._key)) {
      console.error('registryWidget error', new Error(`widget ${define._key} 忽略注册`))
      return
    }
    const fullKey = widgetFullKey(define)
    if (registryWidgetDefines[fullKey]) {
      console.warn('registryWidget error', new Error(`widget ${fullKey} 已注册`))
      return
    }
    module.defines ??= []
    module.defines.push(define)
    registryWidgetDefines[fullKey] = define
  }

  const moduleInfos = importModuleInfos()
  const widgetDefines = importWidgetDefines()

  Object.entries(moduleInfos).forEach(([_moduleName, moduleInfo]) => {
    // 模块 init
    const preDefines = moduleInfo.defines
    moduleInfo.name ??= _moduleName
    moduleInfo.defines = []
    preDefines?.forEach((widgetDefine) => {
      registryWidget(moduleInfo, widgetDefine)
    })
    registryWidgetModules[moduleInfo.name] = moduleInfo
  })

  Object.entries(registryWidgetModules).forEach(([_, moduleInfo]) => {
    Object.entries(widgetDefines[moduleInfo.name!] ?? {}).forEach(([_key, widgetDefine]) => {
      // 组件定义 init
      widgetDefine._moduleName ??= moduleInfo.name
      widgetDefine._key ??= _key
      registryWidget(moduleInfo, widgetDefine)
    })
  })

  console.log('registry module info', registryWidgetModules)
  return {
    registryWidgetModules: readonly(registryWidgetModules),
    registryWidgetDefines: readonly(registryWidgetDefines)
  }
}

/** 注册信息 */
const { registryWidgetModules, registryWidgetDefines } = registry()

/** 获取全部模块 */
export function useWidgetModules() {
  return registryWidgetModules
}

/** 获取模块 */
export function useWidgetModule(args: { name?: string; _moduleName?: string }): WidgetModuleInfo {
  const name = `${args._moduleName ?? args.name}`
  if (isNullOrUnDef(registryWidgetModules[name])) {
    throw new Error(`module ${name} 不存在`)
  }
  return registryWidgetModules[name] as WidgetModuleInfo
}

/** 获取组件定义 */
export function useWidgetDefine(args: { _moduleName?: string; _key?: string }): WidgetDefine {
  const fullKey = widgetFullKey(args)
  if (isNullOrUnDef(registryWidgetDefines[fullKey])) {
    throw new Error(`widget ${fullKey} 不存在`)
  }
  return registryWidgetDefines[fullKey] as WidgetDefine
}
