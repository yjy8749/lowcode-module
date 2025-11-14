<template>
  <el-form class="querier-table-search" ref="formRef" :model="formModel" @submit.prevent="doSearch">
    <el-row :gutter="18">
      <!-- 查询区字段 -->
      <el-col
        v-for="item in showSearchFields"
        :key="getSearchFieldProp(item)"
        :span="item.span ?? 6"
      >
        <QuerierTableSearchField
          v-bind="item"
          v-model="formModel[getSearchFieldProp(item)]"
          @clear="doClear"
        />
      </el-col>
      <el-col :span="btnColSpan">
        <div class="flex gap-2">
          <!-- 查询区按钮 -->
          <el-button
            v-if="!isEmpty(showSearchFields)"
            class="!m-0"
            type="default"
            @click.stop="doSearch"
          >
            <Icon icon="ep:search" class="mr-5px" /> 搜索
          </el-button>
          <el-button
            v-if="!isEmpty(showSearchFields)"
            class="!m-0"
            type="default"
            @click.stop="doReset"
          >
            <Icon icon="ep:refresh" class="mr-5px" />重置
          </el-button>
          <!-- 查询区配置按钮 -->
          <ActionButton v-for="(item, index) in searchActions" :key="index" v-bind="item" />
          <!-- 查询区插槽 -->
          <slot v-if="slots.searchActionSlot" name="searchActionSlot"></slot>
          <!-- 查询区其他按钮 -->
          <el-button
            v-if="hasHiddenFields"
            class="!m-0"
            link
            type="primary"
            @click.stop="toggleShowAllFields"
          >
            <div class="rotate-90">
              <Icon :icon="isShowAllFields ? 'ep:d-arrow-left' : 'ep:d-arrow-right'" />
            </div>
          </el-button>
          <el-button
            v-if="!disableSetting"
            class="!m-0"
            link
            type="primary"
            @click.stop="openSetting"
          >
            <Icon icon="ep:setting" />
          </el-button>
        </div>
      </el-col>
    </el-row>
  </el-form>
</template>
<script lang="ts" setup>
import { isNullOrUnDef, isEmpty, isArray } from '@/utils/is'
import { ElForm } from 'element-plus'
import { getSearchFieldProp } from '../querier-table.utils'
import {
  ALL_OPTIONS_VALUE,
  QuerierTableSearchProps,
  QueryDomainWhereParams
} from '../querier-table.type'
import QuerierTableSearchField from './QuerierTableSearchField.vue'
import ActionButton from '../../common/ActionButton.vue'

export type QuerierTableSearchEmits = {
  search: []
  openSetting: []
}

const props = defineProps<QuerierTableSearchProps>()

const emits = defineEmits<QuerierTableSearchEmits>()

const slots = useSlots()

const formRef = ref<InstanceType<typeof ElForm>>()

const showSearchFields = computed(() => {
  return props.searchs?.filter((e) => e.hidden != true || isShowAllFields.value) ?? []
})

const hasHiddenFields = computed(() => props.searchs?.find((e) => e.hidden))

const isShowAllFields = ref(false)

const btnColSpan = computed(() => {
  const val = showSearchFields.value.map((e) => e.span ?? 6).reduce((p, c) => p + c, 0) % 24
  return Math.max(val == 0 ? 24 : 24 - val, props.searchBtnSpan ?? 6)
})
const toggleShowAllFields = () => {
  isShowAllFields.value = !isShowAllFields.value
}
const getFormModel = (): object => {
  const modelValue = {}
  props.searchs?.forEach((field) => {
    const propKey = getSearchFieldProp(field)
    if (!isNullOrUnDef(field.defaultValue)) {
      modelValue[propKey] = field.defaultValue
    } else if (field.inputType == 'select') {
      modelValue[propKey] = ALL_OPTIONS_VALUE
    } else {
      modelValue[propKey] = undefined
    }
  })
  return modelValue
}

const formModel = reactive(getFormModel())

const isValidValue = (val: any): boolean => {
  if (val !== undefined) {
    if (isArray(val)) {
      return val.length > 0
    } else {
      return val != ALL_OPTIONS_VALUE
    }
  }
  return false
}
const getWhereParams = (dfs?: QueryDomainWhereParams[]): QueryDomainWhereParams[] => {
  const whereParams: QueryDomainWhereParams[] = [...(dfs ?? [])]
  props.searchs?.forEach((c) => {
    let val = formModel[getSearchFieldProp(c)]
    if (isNullOrUnDef(val) || isEmpty(val)) {
      return
    }
    if (isArray(val)) {
      val = (val as any[]).filter(isValidValue)
    } else {
      val = isValidValue(val) ? val : undefined
    }
    if (isNullOrUnDef(val) || isEmpty(val)) {
      return
    }
    if (isArray(val)) {
      whereParams.push({ name: c.prop, symbol: c.symbolType, values: val })
    } else {
      whereParams.push({ name: c.prop, symbol: c.symbolType, value: val })
    }
  })
  return whereParams
}

const setWhereParams = (whereParams?: QueryDomainWhereParams[]): void => {
  if (!isEmpty(whereParams)) {
    props.searchs?.forEach((c) => {
      const key = getSearchFieldProp(c)
      const val = whereParams?.find((e) => e.name == c.prop && e.symbol == c.symbolType)
      formModel[key] = val?.value ?? val?.values
    })
  }
}

const doSearch = () => {
  emits('search')
}

const doReset = () => {
  Object.assign(formModel, getFormModel())
  emits('search')
}

const doClear = () => {
  emits('search')
}

const openSetting = () => {
  emits('openSetting')
}

defineExpose({
  getWhereParams,
  setWhereParams
})
</script>
<style scoped lang="scss">
.querier-table-search {
  margin-bottom: -8px;

  .el-form-item:not(.is-error) {
    margin-bottom: 8px;
  }
}
</style>
