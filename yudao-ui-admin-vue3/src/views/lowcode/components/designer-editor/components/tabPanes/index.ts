import type { DefineComponent } from 'vue'

/** 导入组件Tab数据 */
function importTabPaneComponents(): Record<string, Record<string, DefineComponent>> {
  const tabPanes = import.meta.glob(['./*/*/index.(tsx|vue)'], {
    eager: true,
    import: 'default'
  }) as Record<string, any>
  const tabPaneComponentMap: Record<string, Record<string, DefineComponent>> = {}
  Object.entries(tabPanes).forEach(([filePath, comp]) => {
    try {
      const [tabKey, paneKey] = filePath.replace(/\.\/(.*)\/index\.(tsx|vue)/, '$1').split('/')
      tabPaneComponentMap[tabKey] ??= {}
      tabPaneComponentMap[tabKey][paneKey] = comp
    } catch (e) {
      console.error(`${filePath} importTabPaneDefines error`, e)
    }
  })
  return tabPaneComponentMap
}

const tabPaneComponents = importTabPaneComponents()

/** 获取全部Tab配置 */
export function useTablePanes() {
  return tabPaneComponents
}
