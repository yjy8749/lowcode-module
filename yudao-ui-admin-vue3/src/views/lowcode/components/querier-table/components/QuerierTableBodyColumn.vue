<template>
  <el-table-column v-bind="columnAttrs">
    <template #default="scope">
      <component :is="columnSlots.defaultSlot" :scope="scope" />
    </template>
  </el-table-column>
</template>
<script lang="ts" setup>
import { ElButton, ElLink } from 'element-plus'
import DictTag from '@/components/DictTag/src/DictTag.vue'
import HtmlText from './HtmlText.vue'
import Image from '../../designer-editor/widgets/baseWidgetDefines/image/src/Image.vue'
import { formatDate } from '@/utils/formatTime'
import { QuerierTableBodyColumnProps } from '../querier-table.type'
import {
  getTableBodyColumnProp,
  isActionColumn,
  isIndexColumn,
  parseUrlToRouteParams
} from '../querier-table.utils'
import { isEmpty } from '@/utils/is'
import QuerierTableBodyRowActions from './QuerierTableBodyRowActions.vue'
import { ActionButtonProps } from '../../common/ActionButton.vue'

const props = defineProps<
  QuerierTableBodyColumnProps & {
    expandRowActions?: boolean
    foldRowActions?: boolean
    autoFoldNum?: number
    fixedRight?: boolean
    rowActions?: ActionButtonProps[]
  }
>()

const router = useRouter()

const getColumnValue = (row: any) => {
  return row[getTableBodyColumnProp(props)]
}

const getProcessedData = (row) => {
  const data = getColumnValue(row)
  const results = Array.isArray(data) ? data : [data]
  if (!isEmpty(props.splitChar)) {
    const list: any[] = []
    results.forEach((item) => {
      list.push(...`${item}`.split(props.splitChar!))
    })
    return list
  }
  return results
}

const defaultSlotHandlerMap = {
  default: ({ data, row, toPatternFn }) => {
    return data.map((item) =>
      h('span', { class: 'overflow-hidden text-ellipsis' }, toPatternFn(item, row))
    )
  },
  datetime: ({ data }) => {
    return data.map((item) => h('span', {}, formatDate(item, props.datetimeFormat)))
  },
  route: ({ data, row, toPatternFn }) => {
    return data.map((item) => {
      return h(
        ElButton,
        {
          type: 'primary',
          link: true,
          onClick: (e) => {
            e.stopPropagation()
            router.push(parseUrlToRouteParams(toPatternFn(item, row)))
          }
        },
        getColumnValue(row)
      )
    })
  },
  link: ({ data, row, toPatternFn }) => {
    return data.map((item) => {
      return h(
        ElLink,
        {
          type: 'primary',
          target: '_self',
          href: toPatternFn(item, row)
        },
        getColumnValue(row)
      )
    })
  },
  html: ({ data, row, toPatternFn }) => {
    return data.map((item) => h(HtmlText, { html: toPatternFn(item, row) }))
  },
  dict: ({ data, row, toPatternFn }) => {
    return data.map((item) => {
      const value = toPatternFn(item, row)
      return h(DictTag, {
        type: props.dictType ?? '',
        value
      })
    })
  },
  image: ({ data, row, toPatternFn }) => {
    return data.map((item) =>
      h(Image, {
        width: '60px',
        preview: true,
        lazy: true,
        src: toPatternFn(item, row)
      })
    )
  }
}

const getDefaultSlot = (): any => {
  if (props.defaultSlot) {
    return props.defaultSlot
  }
  if (isIndexColumn(props)) {
    return ({ scope }) => {
      const { $index } = scope
      return h('span', { class: 'flex justify-center' }, $index + 1)
    }
  } else if (isActionColumn(props)) {
    return ({ scope }) => {
      return h(QuerierTableBodyRowActions, {
        scope,
        expandRowActions: props.expandRowActions,
        foldRowActions: props.foldRowActions,
        autoFoldNum: props.autoFoldNum,
        rowActions: props.rowActions
      })
    }
  } else {
    const dataPattern = !isEmpty(props.dataPattern) ? props.dataPattern : '${data}'
    const toPatternFn = eval(`(function(data, row) { return \`${dataPattern}\` })`)

    let handler = defaultSlotHandlerMap[props.columnType ?? '']
    handler ??= defaultSlotHandlerMap['default']

    return ({ scope }) => {
      const { row } = scope
      const data = getProcessedData(row)
      return h('div', { class: 'flex justify-center' }, handler({ data, row, toPatternFn }))
    }
  }
}

const columnAttrs = computed(() => {
  return {
    align: 'center',
    label: props.label,
    prop: getTableBodyColumnProp(props),
    width: props.width,
    showOverflowTooltip: true,
    fixed: props.fixed ? (props.fixedRight ? 'right' : 'left') : undefined
  }
})

const columnSlots = computed(() => {
  return {
    defaultSlot: getDefaultSlot()
  }
})
</script>
