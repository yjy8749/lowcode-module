<template>
  <Dialog title="查询属性配置" :width="900" v-model="dialogVisible">
    <el-form ref="formRef" label-width="100px" :model="formModel" :rules="formRules">
      <div class="flex">
        <el-form-item class="flex-1" label="属性名称" prop="label">
          <el-input clearable :placeholder="`请输入属性名称`" v-model="formModel.label" />
        </el-form-item>
        <el-form-item class="flex-1" label="查询字段" prop="prop">
          <el-input clearable :placeholder="`请输入查询字段`" v-model="formModel.prop" />
        </el-form-item>
        <el-form-item class="flex-1" label="查询类型" prop="symbolType">
          <el-select placeholder="请选择查询类型" v-model="formModel.symbolType">
            <el-option
              v-for="dict in getStrDictOptions(LOWCODE_DICT_TYPE.LOWCODE_QUERIER_FIELD_SYMBOLS)"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
      </div>
      <div class="flex">
        <el-form-item class="flex-1" label="输入类型" prop="inputType">
          <el-select
            class="!w-full"
            placeholder="请选择输入类型"
            v-model="formModel.inputType"
            @change="onInputTypeChange"
          >
            <el-option
              v-for="opt in SearchFieldInputTypeOptions"
              :key="opt.label"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item class="flex-1" label="宽度(Span)" prop="span">
          <el-input-number
            placeholder="6"
            clearable
            :max="24"
            :min="6"
            :step="1"
            :precision="0"
            v-model="formModel.span"
          />
        </el-form-item>
        <el-form-item class="flex-1" prop="hidden">
          <template #label>
            <TextLabel label="是否显示" helps="隐藏的查询条件默认不显示，点击展开按钮才会显示" />
          </template>
          <el-switch :active-value="false" :inactive-value="true" v-model="formModel.hidden" />
        </el-form-item>
      </div>
      <el-form-item label="占位文本" prop="placeholder">
        <el-input
          clearable
          :placeholder="`请输入${formModel.label}`"
          v-model="formModel.placeholder"
        />
      </el-form-item>
      <!-- select 配置 -->
      <template v-if="formModel.inputType == 'select'">
        <el-form-item label="开关控制">
          <div class="flex gap-8">
            <el-form-item label="多选" label-width="40px" prop="multiple">
              <el-switch size="small" v-model="formModel.multiple" />
            </el-form-item>
            <el-form-item label="可筛选" label-width="54px" prop="filterable">
              <el-switch size="small" v-model="formModel.filterable" />
            </el-form-item>
            <el-form-item label="远程加载" label-width="68px" prop="remote">
              <el-switch size="small" v-model="formModel.remote" />
            </el-form-item>
          </div>
        </el-form-item>
        <el-form-item label="折叠配置" v-if="formModel.multiple">
          <div class="flex gap-8">
            <el-form-item label="折叠标签" prop="collapseTags" label-width="68px">
              <el-switch size="small" v-model="formModel.collapseTags" />
            </el-form-item>
            <el-form-item prop="maxCollapseTags" v-if="formModel.collapseTags">
              <div class="flex gap-2">
                <el-text>超出 </el-text>
                <el-input-number
                  v-bind="inputNumberProps"
                  placeholder="1"
                  v-model="formModel.maxCollapseTags"
                />
                <el-text>条自动折叠 </el-text>
              </div>
            </el-form-item>
          </div>
        </el-form-item>
        <el-form-item label="绑定字典" prop="dictType" v-if="!formModel.remote">
          <el-input clearable placeholder="请输入绑定字典" v-model="formModel.dictType" />
        </el-form-item>
        <el-form-item label="加载函数" prop="remoteMethod" v-else>
          <EvalFunctionValueInput
            name="选项加载函数"
            type="simple-function"
            :height="100"
            :editor="editor"
            :widget="widget"
            :helps="`可筛选时 ${highlightTextHtml('$args[0]')} 为查询值，返回字典类型数组`"
            :default-function="returnDictDefaultFunction"
            :set-default-function="true"
            v-model="formModel.remoteMethod"
          />
        </el-form-item>
      </template>
      <!-- tree-select 配置 -->
      <template v-else-if="formModel.inputType == 'tree-select'">
        <el-form-item label="开关控制">
          <div class="flex gap-8">
            <el-form-item label="多选" label-width="40px" prop="multiple">
              <el-switch size="small" v-model="formModel.multiple" />
            </el-form-item>
            <el-form-item label="可筛选" label-width="54px" prop="filterable">
              <el-switch size="small" v-model="formModel.filterable" />
            </el-form-item>
            <el-form-item label="父子不联动" label-width="82px" prop="checkStrictly">
              <el-switch size="small" v-model="formModel.checkStrictly" />
            </el-form-item>
            <el-form-item label="懒加载" label-width="54px" prop="lazy">
              <el-switch size="small" v-model="formModel.lazy" />
            </el-form-item>
            <el-form-item label="手风琴模式" label-width="82px" prop="accordion">
              <el-switch size="small" v-model="formModel.accordion" />
            </el-form-item>
          </div>
        </el-form-item>
        <el-form-item label="折叠配置" v-if="formModel.multiple">
          <div class="flex gap-8">
            <el-form-item label="折叠标签" prop="collapseTags" label-width="68px">
              <el-switch size="small" v-model="formModel.collapseTags" />
            </el-form-item>
            <el-form-item prop="maxCollapseTags" v-if="formModel.collapseTags">
              <div class="flex gap-2">
                <el-text>超出 </el-text>
                <el-input-number
                  v-bind="inputNumberProps"
                  placeholder="1"
                  v-model="formModel.maxCollapseTags"
                />
                <el-text>条自动折叠 </el-text>
              </div>
            </el-form-item>
          </div>
        </el-form-item>
        <el-form-item label="搜索函数" prop="filterMethod" v-if="formModel.filterable">
          <EvalFunctionValueInput
            name="数据搜索函数"
            type="simple-function"
            :height="100"
            :editor="editor"
            :widget="widget"
            :helps="`可筛选时 ${highlightTextHtml('$args[0]')} 为查询值，返回树节点数组`"
            :default-function="returnTreeDefaultFunction"
            :set-default-function="true"
            v-model="formModel.filterMethod"
          />
        </el-form-item>
        <el-form-item label="加载函数" prop="loadData">
          <EvalFunctionValueInput
            name="数据加载函数"
            type="simple-function"
            :height="100"
            :editor="editor"
            :widget="widget"
            :helps="`懒加载情况下 ${highlightTextHtml('$args[0]')} 为 node 数据，返回树节点数组`"
            :default-function="returnTreeDefaultFunction"
            :set-default-function="true"
            v-model="formModel.loadData"
          />
        </el-form-item>
      </template>
      <!-- radio,checkbox 配置 -->
      <template v-else-if="formModel.inputType == 'radio' || formModel.inputType == 'checkbox'">
        <el-form-item label="开关控制">
          <div class="flex gap-8">
            <el-form-item label="远程加载" label-width="68px" prop="remote">
              <el-switch size="small" v-model="formModel.remote" />
            </el-form-item>
            <el-form-item label="仅显示图标" label-width="82px" prop="onlyIcon">
              <el-switch size="small" v-model="formModel.onlyIcon" />
            </el-form-item>
            <el-form-item label="显示为按钮" label-width="82px" prop="showAsButton">
              <el-switch size="small" v-model="formModel.showAsButton" />
            </el-form-item>
          </div>
        </el-form-item>
        <el-form-item label="绑定字典" prop="dictType" v-if="!formModel.remote">
          <el-input clearable placeholder="请输入绑定字典" v-model="formModel.dictType" />
        </el-form-item>
        <el-form-item label="加载函数" prop="remoteMethod" v-else>
          <EvalFunctionValueInput
            name="数据加载函数"
            type="simple-function"
            :height="100"
            :editor="editor"
            :widget="widget"
            :helps="`可筛选时 ${highlightTextHtml('$args[0]')} 为查询值，返回字典数组`"
            :default-function="returnDictDefaultFunction"
            :set-default-function="true"
            v-model="formModel.remoteMethod"
          />
        </el-form-item>
      </template>
      <!-- switch 配置 -->
      <template v-else-if="formModel.inputType == 'switch'">
        <div class="flex">
          <el-form-item class="flex-1" label="宽度" prop="width">
            <FormatInputNumber class="!w-full" v-model="formModel.width" :symbol="CssSymbols" />
          </el-form-item>
          <el-form-item class="flex-1" label="激活图标" prop="activeIcon">
            <el-input v-model="formModel.activeIcon">
              <template #suffix>
                <Icon :icon="formModel.activeIcon" />
              </template>
            </el-input>
          </el-form-item>
          <el-form-item class="flex-1" label="关闭图标" prop="inactiveIcon">
            <el-input v-model="formModel.inactiveIcon">
              <template #suffix>
                <Icon :icon="formModel.inactiveIcon" />
              </template>
            </el-input>
          </el-form-item>
        </div>
        <div class="flex">
          <el-form-item class="flex-1" label="激活文字" prop="activeText">
            <el-input v-model="formModel.activeText" />
          </el-form-item>
          <el-form-item class="flex-1" label="关闭文字" prop="inactiveText">
            <el-input v-model="formModel.inactiveText" />
          </el-form-item>
          <div class="flex-1"></div>
        </div>
        <el-form-item label="激活状态值" prop="activeValue">
          <EvalFunctionValueInput
            name="激活状态值"
            type="simple-function"
            :height="100"
            :editor="editor"
            :widget="widget"
            :default-function="'/** 同步或异步返回 */\n' + 'return true'"
            v-model="formModel.activeValue"
          />
        </el-form-item>
        <el-form-item label="关闭状态值" prop="inactiveValue">
          <EvalFunctionValueInput
            name="关闭状态值"
            type="simple-function"
            :height="100"
            :editor="editor"
            :widget="widget"
            :default-function="'/** 同步或异步返回 */\n' + 'return false'"
            v-model="formModel.inactiveValue"
          />
        </el-form-item>
      </template>
      <!-- date-picker 配置 -->
      <template v-else-if="formModel.inputType == 'date-picker'">
        <el-form-item label="选择器类型" prop="type">
          <el-radio-group v-model="formModel.type" @change="onDatePickerTypeChange">
            <el-radio v-for="opt in ElDatePickerTypeOptions" :key="opt.label" :value="opt.value">
              {{ opt.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <div class="flex justify-between">
          <el-form-item class="flex-1" label="显示格式" prop="format">
            <el-input clearable placeholder="输入框显示格式" v-model="formModel.format" />
          </el-form-item>
          <el-form-item class="flex-1" prop="valueFormat">
            <template #label>
              <TextLabel label="数值格式" helps="时间戳格式使用 x" />
            </template>
            <el-input clearable placeholder="后端数据值格式" v-model="formModel.valueFormat" />
          </el-form-item>
        </div>
        <div class="flex justify-between" v-if="isType('date', 'datetime')">
          <el-form-item class="flex-1" label="默认时间" prop="defaultTime">
            <el-input clearable placeholder="日期默认时间值" v-model="formModel.defaultTime" />
          </el-form-item>
          <div class="flex-1"></div>
        </div>
        <div class="flex justify-between" v-if="isType('daterange', 'datetimerange')">
          <el-form-item class="flex-1" label="开始默认时间" prop="startDefaultTime">
            <el-input
              clearable
              placeholder="开始日期默认时间值"
              v-model="formModel.startDefaultTime"
            />
          </el-form-item>
          <el-form-item class="flex-1" label="结束默认时间" prop="endDefaultTime">
            <el-input
              clearable
              placeholder="结束日期默认时间值"
              v-model="formModel.endDefaultTime"
            />
          </el-form-item>
        </div>
        <div
          class="flex justify-between"
          v-if="isType('daterange', 'datetimerange', 'monthrange', 'yearrange')"
        >
          <el-form-item label="开始文本" prop="startPlaceholder">
            <el-input
              clearable
              placeholder="开始日期占位文本"
              v-model="formModel.startPlaceholder"
            />
          </el-form-item>
          <el-form-item label="结束文本" prop="endPlaceholder">
            <el-input clearable placeholder="结束日期占位文本" v-model="formModel.endPlaceholder" />
          </el-form-item>
          <el-form-item label="范围分隔符" prop="rangeSeparator">
            <el-input clearable placeholder="范围选择分隔符" v-model="formModel.rangeSeparator" />
          </el-form-item>
        </div>
        <el-form-item
          label="范围控制"
          v-if="isType('date', 'datetime', 'dates', 'daterange', 'datetimerange')"
        >
          <div class="flex gap-2">
            <el-text>选择从前 </el-text>
            <el-input-number
              class="!w-100px"
              v-bind="inputNumberProps"
              v-model="formModel.beforeMinDays"
            />
            <el-text>天开始，往后 </el-text>
            <el-input-number
              class="!w-100px"
              v-bind="inputNumberProps"
              v-model="formModel.afterMaxDays"
            />
            <template v-if="isType('daterange', 'datetimerange')">
              <el-text>天为止，不超过 </el-text>
              <el-input-number
                class="!w-100px"
                v-bind="inputNumberProps"
                v-model="formModel.maxDaysRange"
              />
              <el-text>天跨度的日期 </el-text>
            </template>
            <el-text v-else>天为止的日期</el-text>
          </div>
        </el-form-item>
        <el-form-item label="日期是否禁用" prop="disabledDate">
          <EvalFunctionValueInput
            name="判断日期是否被禁用的函数"
            type="simple-function"
            :height="100"
            :editor="editor"
            :widget="widget"
            :helps="`${highlightTextHtml('$args[0]')} 为要判断的日期Date对象, 范围选择时${highlightTextHtml('$args[0]')}为[开始, 结束]Date数组`"
            :default-function="'/** 同步返回 */\n' + 'return false'"
            v-model="formModel.disabledDate"
          />
        </el-form-item>
        <el-form-item label="获取快捷选项" prop="shortcuts">
          <EvalFunctionValueInput
            name="获取日期快捷选项函数"
            type="simple-function"
            :height="100"
            :editor="editor"
            :widget="widget"
            :default-function="'/** 同步或异步返回 { text, value } 数组 */\n' + 'return []'"
            v-model="formModel.shortcuts"
          />
        </el-form-item>
      </template>
      <!-- number-range 配置 -->
      <template v-else-if="formModel.inputType == 'number-range'">
        <el-form-item label="数字控制">
          <div class="flex gap-2">
            <el-text>输入在 </el-text>
            <el-input-number
              class="!w-100px"
              v-bind="inputNumberProps"
              v-model="formModel.minNumber"
            />
            <el-text>到 </el-text>
            <el-input-number
              class="!w-100px"
              v-bind="inputNumberProps"
              v-model="formModel.maxNumber"
            />
            <el-text>之间的，</el-text>
            <el-input-number
              class="!w-100px"
              v-bind="inputNumberProps"
              placeholder="0"
              v-model="formModel.precision"
            />
            <el-text>位小数的数字 </el-text>
          </div>
        </el-form-item>
      </template>
      <!-- autocomplete -->
      <el-form-item
        v-else-if="formModel.inputType == 'autocomplete'"
        label="输入建议函数"
        prop="fetchSuggestions"
      >
        <EvalFunctionValueInput
          name="获取输入建议的函数"
          type="simple-function"
          :height="100"
          :editor="editor"
          :widget="widget"
          :helps="`${highlightTextHtml('$args[0]')} 为查询值，返回建议数组`"
          :default-function="'/** 异步返回 { value } 数组 */\n' + 'return Promise.resolve([])'"
          :set-default-function="true"
          v-model="formModel.fetchSuggestions"
        />
      </el-form-item>
      <!-- cascader 配置 -->
      <template v-else-if="formModel.inputType == 'cascader'">
        <el-form-item label="开关控制">
          <div class="w-full flex justify-between">
            <el-form-item label="多选" label-width="40px" prop="multiple">
              <el-switch size="small" v-model="formModel.multiple" />
            </el-form-item>
            <el-form-item label="可筛选" label-width="54px" prop="filterable">
              <el-switch size="small" v-model="formModel.filterable" />
            </el-form-item>
            <el-form-item label="父子不联动" label-width="82px" prop="checkStrictly">
              <el-switch size="small" v-model="formModel.checkStrictly" />
            </el-form-item>
            <el-form-item label="懒加载" label-width="54px" prop="lazy">
              <el-switch size="small" v-model="formModel.lazy" />
            </el-form-item>
            <el-form-item label="显示完整路径" label-width="110px" prop="showAllLevels">
              <el-switch size="small" v-model="formModel.showAllLevels" />
            </el-form-item>
            <el-form-item label="返回全部路径值" label-width="110px" prop="emitPath">
              <el-switch size="small" v-model="formModel.emitPath" />
            </el-form-item>
          </div>
        </el-form-item>
        <el-form-item label="折叠配置" v-if="formModel.multiple">
          <div class="flex gap-8">
            <el-form-item label="折叠标签" prop="collapseTags" label-width="68px">
              <el-switch size="small" v-model="formModel.collapseTags" />
            </el-form-item>
            <el-form-item prop="maxCollapseTags" v-if="formModel.collapseTags">
              <div class="flex gap-2">
                <el-text>超出 </el-text>
                <el-input-number
                  v-bind="inputNumberProps"
                  placeholder="1"
                  v-model="formModel.maxCollapseTags"
                />
                <el-text>条自动折叠 </el-text>
              </div>
            </el-form-item>
          </div>
        </el-form-item>
        <el-form-item label="搜索函数" prop="filterMethod" v-if="formModel.filterable">
          <EvalFunctionValueInput
            name="数据搜索函数"
            type="simple-function"
            :height="100"
            :editor="editor"
            :widget="widget"
            :helps="`可筛选时 ${highlightTextHtml('$args[0]')} 为查询值，返回节点数组`"
            :default-function="
              '/** 异步返回 { value, label, disabled, leaf, children } 数组 */\n' +
              'return Promise.resolve([])'
            "
            v-model="formModel.filterMethod"
          />
        </el-form-item>
        <el-form-item label="加载函数" prop="loadData">
          <EvalFunctionValueInput
            name="数据加载函数"
            type="simple-function"
            :height="100"
            :editor="editor"
            :widget="widget"
            :helps="`懒加载情况下 ${highlightTextHtml('$args[0]')} 为 node 数据，返回节点数组`"
            :default-function="
              '/** 异步返回 { value, label, disabled, leaf, children } 数组 */\n' +
              'return Promise.resolve([])'
            "
            :set-default-function="true"
            v-model="formModel.loadData"
          />
        </el-form-item>
      </template>
    </el-form>
    <template #footer>
      <el-button type="primary" @click="doConfirm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { cloneDeep } from 'lodash-es'
import {
  DesignerEditor,
  WidgetInstance,
  CssSymbols,
  ElDatePickerTypeOptions
} from '../../../../designer-editor.type'
import { highlightTextHtml } from '../../../../../common/utils'
import EvalFunctionValueInput from '../../../../components/EvalFunctionValueInput.vue'
import { getStrDictOptions } from '@/utils/dict'
import { LOWCODE_DICT_TYPE } from '../../../../../common/dict'
import { EasyTableSearchFieldProps, SearchFieldInputTypeOptions } from './types'
import { ElForm } from 'element-plus'
import TextLabel from '../../../../../common/TextLabel.vue'
import FormatInputNumber from '../../../../components/propInput/FormatInputNumber.vue'

const returnDictDefaultFunction =
  '/** 异步返回 { label, value, disabled } 数组 */\n' + 'return Promise.resolve([])'

const returnTreeDefaultFunction =
  '/** 异步返回 { id, parentId, name, disabled, leaf } 数组 */\n' + 'return Promise.resolve([])'

const inputNumberProps: any = {
  placeholder: '不限',
  controlsPosition: 'right',
  min: 0,
  precision: 0
}

function isType(...types: string[]) {
  return types.includes(formModel.value.type ?? '')
}

export interface SearchFieldConfigDialogProps {
  editor: DesignerEditor
  widget: WidgetInstance
}

defineProps<SearchFieldConfigDialogProps>()

export interface SearchFieldConfigDialogArgs {
  value: EasyTableSearchFieldProps
  onConfirm: (value: EasyTableSearchFieldProps) => void
}

const dialogVisible = ref(false)

const dialogArgs = ref<SearchFieldConfigDialogArgs>({
  value: {},
  onConfirm: () => {}
})

const formRef = ref<InstanceType<typeof ElForm>>()

const formModel = ref<EasyTableSearchFieldProps>({})

const formRules = reactive({
  label: [{ required: true, message: '请输入属性名称' }],
  prop: [{ required: true, message: '请输入查询字段' }],
  symbolType: [{ required: true, message: '请选择查询类型' }],
  inputType: [{ required: true, message: '请选择输入类型' }]
})

const onInputTypeChange = () => {
  formModel.value = {
    label: formModel.value.label,
    helps: formModel.value.helps,
    prop: formModel.value.prop,
    symbolType: formModel.value.symbolType,
    inputType: formModel.value.inputType,
    defaultValue: formModel.value.defaultValue,
    hidden: formModel.value.hidden,
    span: formModel.value.span,
    placeholder: formModel.value.placeholder
  }
  if (formModel.value.inputType == 'cascader') {
    formModel.value.showAllLevels = true
    formModel.value.emitPath = true
  }
}

const onDatePickerTypeChange = () => {
  const typeOpt = ElDatePickerTypeOptions.find((e) => e.value == formModel.value.type)
  formModel.value.format = typeOpt?.format
  formModel.value.valueFormat = formModel.value.format
  let rangeSeparator = '至'
  let startPlaceholder = ''
  let endPlaceholder = ''
  if (isType('daterange')) {
    startPlaceholder = '开始日期'
    endPlaceholder = '结束日期'
  } else if (isType('datetimerange')) {
    startPlaceholder = '开始时间'
    endPlaceholder = '结束时间'
  } else if (isType('monthrange')) {
    startPlaceholder = '开始月份'
    endPlaceholder = '结束月份'
  } else if (isType('yearrange')) {
    startPlaceholder = '开始年份'
    endPlaceholder = '结束年份'
  } else {
    rangeSeparator = ''
    startPlaceholder = ''
    endPlaceholder = ''
  }
  if (isType('date', 'datetime')) {
    formModel.value.defaultTime = '00:00:00'
  }
  if (isType('daterange', 'datetimerange')) {
    formModel.value.startDefaultTime = '00:00:00'
    formModel.value.endDefaultTime = '23:59:59'
  }
  formModel.value.rangeSeparator = rangeSeparator
  formModel.value.startPlaceholder = startPlaceholder
  formModel.value.endPlaceholder = endPlaceholder
}

const open = async (args: SearchFieldConfigDialogArgs) => {
  doReset()
  dialogArgs.value = args
  formModel.value = reactive(cloneDeep(args.value))
  dialogVisible.value = true
}

defineExpose({ open })

const doConfirm = async () => {
  await formRef.value?.validate()
  dialogArgs.value.onConfirm(formModel.value)
  dialogVisible.value = false
}

const doReset = () => {
  formModel.value = {}
}
</script>

<style scoped lang="scss"></style>
