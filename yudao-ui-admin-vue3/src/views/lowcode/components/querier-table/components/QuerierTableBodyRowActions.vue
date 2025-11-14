<template>
  <template v-if="isFoldAction">
    <el-dropdown
      v-if="!isEmpty(filteredActions)"
      @command="(cmdIndex) => doAction(scope, cmdIndex)"
    >
      <el-button size="small">
        操作
        <Icon icon="ep:arrow-down" />
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <span>
            <el-dropdown-item
              v-for="(item, cmdIndex) in filteredActions"
              :key="`${cmdIndex}`"
              :command="cmdIndex"
            >
              <Icon :icon="item.icon" :size="12" v-if="!isEmpty(item.icon)" />
              {{ item.label }}
            </el-dropdown-item>
          </span>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </template>
  <template v-else>
    <ActionButton
      v-for="(item, cmdIndex) in filteredActions"
      :key="cmdIndex"
      :label="item.label"
      :icon="item.icon"
      :type="item.type"
      :size="item.size"
      :plain="item.plain"
      :link="item.link"
      :on-click="(e) => doAction(scope, cmdIndex, e)"
    />
  </template>
</template>
<script lang="ts" setup>
import { isEmpty } from '@/utils/is'
import ActionButton, { ActionButtonProps } from '../../common/ActionButton.vue'
import { QuerierTableBodyRowActionsProps } from '../querier-table.type'
import { isPromise } from '../../common/utils'

type QuerierTableBodyRowActionsEmits = {
  filterCompleted: [vals?: ActionButtonProps[]]
}

const props = withDefaults(defineProps<QuerierTableBodyRowActionsProps>(), {
  autoFoldNum: 2
})

const emits = defineEmits<QuerierTableBodyRowActionsEmits>()

const filteredActions = ref<ActionButtonProps[]>([])
let currentVersion = 0

watchEffect(async () => {
  const version = ++currentVersion
  const promises = (props.rowActions ?? []).map(async (action) => {
    if (!action.isShow) return { action, isVisible: true }
    try {
      const result = action.isShow(props.scope)
      const isVisible = await (isPromise(result) ? result : Promise.resolve(result))
      return { action, isVisible }
    } catch {
      return { action, isVisible: false }
    }
  })

  const results = await Promise.all(promises)
  const visibleActions = results.filter((r) => r.isVisible).map((r) => r.action)

  if (version === currentVersion) {
    filteredActions.value = visibleActions
    emits('filterCompleted', filteredActions.value)
  }
})

const isFoldAction = computed(() => {
  if (props.expandRowActions) {
    return false
  }
  if (props.foldRowActions) {
    return true
  }
  return filteredActions.value.length > props.autoFoldNum
})

const doAction = (scope: any, cmdIndex: number, e?: MouseEvent) => {
  const action = filteredActions.value[cmdIndex]
  if (action) {
    action.onClick?.(e, scope)
  }
}

onUnmounted(() => {
  currentVersion = 0
})
</script>
