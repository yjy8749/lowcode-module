import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'
import ContextMenu, { type MenuItem } from '@imengyu/vue3-context-menu'
import { Icon } from '@/components/Icon'
import { isNullOrUnDef, isString } from '@/utils/is'

function wrapIcon(items?: MenuItem[]): MenuItem[] | undefined {
  if (!isNullOrUnDef(items)) {
    return [...items].map((e) => {
      return {
        ...e,
        icon: isString(e.icon)
          ? () => {
              return h(Icon, { icon: e.icon as string })
            }
          : e.icon,
        children: wrapIcon(e.children)
      }
    })
  } else {
    return undefined
  }
}

/** 显示右键菜单 */
export function showContextMenu(e: MouseEvent, items: MenuItem[]) {
  e.preventDefault()
  ContextMenu.showContextMenu({
    x: e.x,
    y: e.y,
    zIndex: 9999,
    items: wrapIcon(items)
  })
}
