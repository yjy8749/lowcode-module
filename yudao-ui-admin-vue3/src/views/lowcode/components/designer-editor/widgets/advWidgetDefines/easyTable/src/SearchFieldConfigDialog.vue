<template>
  <Dialog title="查询属性配置" :width="900" v-model="dialogVisible">
    <el-form label-width="100px" :model="formModel" :rules="formRules">
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
            name="数据加载函数"
            type="simple-function"
            :height="100"
            :editor="editor"
            :widget="widget"
            :helps="`可筛选时 ${highlightTextHtml('args[0]')} 为查询值\n返回字典类型数据数组 ${highlightTextHtml('{ label, value }')}`"
            :default-function="'/** 返回数据 */\n' + 'return Promise.resolve([])'"
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
        <el-form-item label="加载函数" prop="load">
          <EvalFunctionValueInput
            name="数据加载函数"
            type="simple-function"
            :height="100"
            :editor="editor"
            :widget="widget"
            :helps="`返回树节点数据数组 ${highlightTextHtml('{ id, parentId, name }')}, 懒加载情况下 ${highlightTextHtml('$args[0]')} 为 node 数据`"
            :default-function="'/** 返回数据 */\n' + 'return Promise.resolve([])'"
            v-model="formModel.load"
          />
        </el-form-item>
        <el-form-item label="搜索函数" prop="filterMethod" v-if="formModel.filterable">
          <EvalFunctionValueInput
            name="数据搜索函数"
            type="simple-function"
            :height="100"
            :editor="editor"
            :widget="widget"
            :helps="`返回树节点数据数组 ${highlightTextHtml('{ id, parentId, name }')}, 可筛选时 ${highlightTextHtml('args[0]')} 为查询值`"
            :default-function="'/** 返回数据 */\n' + 'return Promise.resolve([])'"
            v-model="formModel.filterMethod"
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
            :helps="`可筛选时 ${highlightTextHtml('args[0]')} 为查询值\n返回字典类型数据数组 ${highlightTextHtml('{ label, value }')}`"
            :default-function="'/** 返回数据 */\n' + 'return Promise.resolve([])'"
            v-model="formModel.remoteMethod"
          />
        </el-form-item>
      </template>
      <!-- switch 配置 -->
      <template v-else-if="formModel.inputType == 'switch'">
        <el-form-item label="开启时的值" prop="activeValue">
          <el-input clearable placeholder="true" v-model="formModel.activeValue" />
        </el-form-item>
        <el-form-item label="关闭时的值" prop="inactiveValue">
          <el-input clearable placeholder="false" v-model="formModel.inactiveValue" />
        </el-form-item>
      </template>
      <!-- date-picker 配置 -->
      <template v-else-if="formModel.inputType == 'date-picker'">
        <el-form-item label="选择器类型" prop="datePickerType">
          <el-radio-group v-model="formModel.datePickerType" @change="onDatePickerTypeChange">
            <el-radio v-for="opt in datePickerTypeOptions" :key="opt.label" :value="opt.value">
              {{ opt.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="显示格式" prop="format">
          <el-input clearable placeholder="输入框显示格式" v-model="formModel.format" />
        </el-form-item>
        <el-form-item label="后端值格式" prop="valueFormat">
          <el-input clearable placeholder="后端数据值格式" v-model="formModel.valueFormat" />
        </el-form-item>
        <div class="flex justify-between" v-if="isRangeDatePicker">
          <el-form-item label="范围分隔符" prop="rangeSeparator">
            <el-input
              clearable
              placeholder="选择范围时的分隔符"
              v-model="formModel.rangeSeparator"
            />
          </el-form-item>
          <el-form-item label="开始文本" prop="startPlaceholder">
            <el-input
              clearable
              placeholder="开始日期的占位文本"
              v-model="formModel.startPlaceholder"
            />
          </el-form-item>
          <el-form-item label="结束文本" prop="endPlaceholder">
            <el-input
              clearable
              placeholder="结束日期的占位文本"
              v-model="formModel.endPlaceholder"
            />
          </el-form-item>
        </div>
        <el-form-item label="范围控制">
          <div class="flex gap-2">
            <el-text>从前 </el-text>
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
            <el-text>天为止 </el-text>
            <template v-if="isRangeDatePicker">
              <el-text>，选择不超过 </el-text>
              <el-input-number
                class="!w-100px"
                v-bind="inputNumberProps"
                v-model="formModel.maxDaysRange"
              />
              <el-text>天范围的日期 </el-text>
            </template>
          </div>
        </el-form-item>
        <el-form-item label="是否禁用函数" prop="disabledDate">
          <EvalFunctionValueInput
            name="判断日期是否被禁用的函数"
            type="simple-function"
            :height="100"
            :editor="editor"
            :widget="widget"
            :helps="`${highlightTextHtml('args[0]')} 为要判断的日期Date对象, 范围选择时为[开始, 结束]日期数组`"
            :default-function="'/** 返回数据 */\n' + 'return false'"
            v-model="formModel.disabledDate"
          />
        </el-form-item>
      </template>
      <!-- number-range 配置 -->
      <template v-else-if="formModel.inputType == 'number-range'">
        <el-form-item label="数字控制">
          <div class="flex gap-2">
            <el-text>在 </el-text>
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
import { EasyTableSearchFieldProps } from './EasyTableSearchFieldValueInput.vue'
import { DesignerEditor, WidgetInstance } from '../../../../designer-editor.type'
import { highlightTextHtml } from '../../../../../common/utils'
import EvalFunctionValueInput from '../../../../components/EvalFunctionValueInput.vue'

const inputNumberProps: any = {
  placeholder: '不限',
  controlsPosition: 'right',
  min: 0,
  precision: 0
}

const datePickerTypeOptions = [
  { value: 'year', label: '单个年份', format: 'YYYY' },
  { value: 'month', label: '单个月份', format: 'YYYY-MM' },
  { value: 'date', label: '单个日期', format: 'YYYY-MM-DD' },
  { value: 'datetime', label: '单个日期时间', format: 'YYYY-MM-DD HH:mm:ss' },
  { value: 'years', label: '多个年份', format: 'YYYY' },
  { value: 'months', label: '多个月份', format: 'YYYY-MM' },
  { value: 'dates', label: '多个日期', format: 'YYYY-MM-DD' },
  { value: 'daterange', label: '日期范围选择', format: 'YYYY-MM-DD' },
  { value: 'datetimerange', label: '日期时间范围选择', format: 'YYYY-MM-DD HH:mm:ss' },
  { value: 'monthrange', label: '月份范围选择', format: 'YYYY-MM' },
  { value: 'yearrange', label: '年份范围选择', format: 'YYYY' }
]

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

const formModel = ref<EasyTableSearchFieldProps>({})

const formRules = reactive({
  // requestUrlMode: [{ required: true, message: '请选择地址模式', trigger: 'change' }],
})

const isRangeDatePicker = computed(() => {
  return ['daterange', 'datetimerange', 'monthrange', 'yearrange'].includes(
    formModel.value.datePickerType ?? ''
  )
})

const onDatePickerTypeChange = () => {
  formModel.value.format = datePickerTypeOptions.find(
    (e) => e.value == formModel.value.datePickerType
  )?.format
  formModel.value.valueFormat = formModel.value.format
  if (isRangeDatePicker.value) {
    formModel.value.rangeSeparator = '至'
    //根据类型不同设置， 开始和结束的占位符
    if (formModel.value.datePickerType == 'daterange') {
      formModel.value.startPlaceholder = '开始日期'
      formModel.value.endPlaceholder = '结束日期'
    } else if (formModel.value.datePickerType == 'datetimerange') {
      formModel.value.startPlaceholder = '开始时间'
      formModel.value.endPlaceholder = '结束时间'
    } else if (formModel.value.datePickerType == 'monthrange') {
      formModel.value.startPlaceholder = '开始月份'
      formModel.value.endPlaceholder = '结束月份'
    } else if (formModel.value.datePickerType == 'yearrange') {
      formModel.value.startPlaceholder = '开始年份'
      formModel.value.endPlaceholder = '结束年份'
    }
  } else {
    formModel.value.rangeSeparator = undefined
    formModel.value.startPlaceholder = undefined
    formModel.value.endPlaceholder = undefined
  }
}

const open = async (args: SearchFieldConfigDialogArgs) => {
  doReset()
  dialogArgs.value = args
  formModel.value = reactive(cloneDeep(args.value))
  dialogVisible.value = true
}

defineExpose({ open })

const doConfirm = () => {
  dialogArgs.value.onConfirm(formModel.value)
  dialogVisible.value = false
}

const doReset = () => {
  formModel.value = {}
}
</script>

<style scoped lang="scss"></style>
