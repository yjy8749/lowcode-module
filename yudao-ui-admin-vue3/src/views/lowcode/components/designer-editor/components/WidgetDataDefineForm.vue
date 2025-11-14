<template>
  <Dialog width="900px" :title="dialogArgs?.title" v-model="dialogVisible" @close="onDialogClose">
    <el-form ref="formRef" labelWidth="150px" :model="analyzerDataDefine" :rules="formRules">
      <!-- base info -->
      <!-- 变量定义 -->
      <el-form-item prop="_var" v-if="isType('def', 'remote', 'ref', 'submit', 'const')">
        <template #label>
          <TextLabel label="数据变量" helps="可通过该名称访问数据" />
        </template>
        <el-input placeholder="请输入数据变量" clearable v-model="analyzerDataDefine._var" />
      </el-form-item>
      <template v-if="isType('def', 'remote', 'ref', 'submit')">
        <!-- 类型定义 -->
        <el-form-item label="数据类型" prop="_type">
          <el-select
            placeholder="请选择数据类型"
            :disabled="!isNewAdd"
            v-model="analyzerDataDefine._type"
            @change="onTypeChange"
          >
            <el-option
              v-for="item in dataTypeSelectOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <!-- 名称配置 -->
        <el-form-item label="数据名称" prop="name">
          <el-input placeholder="请输入数据名称" clearable v-model="analyzerDataDefine.name" />
        </el-form-item>
        <!-- 数据属性配置 -->
        <div class="flex" v-if="isType('def', 'remote', 'ref')">
          <el-form-item class="w-full" prop="scope">
            <template #label>
              <TextLabel label="作用域" helps="限制被绑定或被引用时是否可用" />
            </template>
            <el-select
              class="w-full"
              placeholder="请选择数据作用域"
              :disabled="!isNewAdd"
              v-model="analyzerDataDefine.scope"
            >
              <el-option
                v-for="item in DATA_SCOPE_OPTIONS"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item class="w-full" label="数据配置" required>
            <div class="flex items-center gap-2">
              <el-text>
                自动加载
                <el-switch
                  size="small"
                  :disabled="isType('ref')"
                  v-model="analyzerDataDefine.isAutoLoad"
                />
              </el-text>
            </div>
          </el-form-item>
        </div>
      </template>

      <!-- remote or submit data define -->
      <template v-if="isType('remote', 'submit')">
        <!-- Api地址模式 -->
        <el-form-item prop="requestUrlMode">
          <template #label>
            <TextLabel
              label="地址模式"
              helps="在api地址非绝对地址时生效; 跟随项目: 相对项目api请求基础路径; 相对base: 相对项目页面base路径"
            />
          </template>
          <el-select
            class="w-full"
            placeholder="请选择Api地址模式"
            v-model="analyzerDataDefine.requestUrlMode"
          >
            <el-option
              v-for="item in RequestUrlModeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <!-- Api地址 -->
        <el-form-item label="Api地址" prop="requestUrl">
          <el-input v-model="analyzerDataDefine.requestUrl" placeholder="请输入Api地址" clearable>
            <template #prepend>
              <el-select
                style="width: 100px"
                v-model="analyzerDataDefine.requestMethod"
                @change="onRequestMethodChange"
              >
                <el-option
                  v-for="item in RequestMethodOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </template>
            <template #append>
              <el-button :loading="isRemoteRequestLoading" @click="doTestRemoteRequest">
                测试
              </el-button>
            </template>
          </el-input>
        </el-form-item>

        <!-- 请求配置 -->
        <el-form-item label="请求配置" required>
          <div class="flex items-center gap-2">
            <el-text>
              loading
              <el-switch size="small" v-model="analyzerDataDefine.isShowLoading" />
            </el-text>
            <el-text>
              错误提示
              <el-switch size="small" v-model="analyzerDataDefine.isShowErrorMsg" />
            </el-text>
            <el-text>
              成功提示
              <el-switch size="small" v-model="analyzerDataDefine.isShowSuccessMsg" />
            </el-text>
          </div>
        </el-form-item>
        <!-- 成功提示配置 -->
        <template v-if="analyzerDataDefine.isShowSuccessMsg">
          <el-form-item label="成功提示" prop="successMsg">
            <el-input
              clearable
              placeholder="请输入成功提示"
              v-model="analyzerDataDefine.successMsg"
            />
          </el-form-item>
        </template>

        <!-- headers -->
        <el-form-item label="Headers配置" prop="requestHeadersType">
          <el-select
            class="w-full"
            placeholder="请选择Headers配置类型"
            v-model="analyzerDataDefine.requestHeadersType"
            @change="analyzerDataDefine.requestHeaders = undefined"
          >
            <el-option
              v-for="item in DATA_INPUT_BIND_OPTIONS"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <template
          v-if="
            analyzerDataDefine.requestHeadersType == 'enable-input' &&
            asType<WidgetDataDefineRequestHeaders[]>(analyzerDataDefine.requestHeaders)
          "
        >
          <el-form-item label="Headers输入" prop="requestHeaders">
            <RequestHeadersInput v-model="analyzerDataDefine.requestHeaders" />
          </el-form-item>
        </template>
        <template
          v-if="
            analyzerDataDefine.requestHeadersType == 'enable-bind' &&
            asType<WidgetPropDefineBind>(analyzerDataDefine.requestHeaders)
          "
        >
          <el-form-item label="Headers绑定" prop="requestHeaders">
            <DataRefBindInput
              :editor="editor"
              :bind-options="refBindBindOptions"
              :ref-prop-types="['object']"
              :disable-execute="true"
              v-model="analyzerDataDefine.requestHeaders"
            />
          </el-form-item>
        </template>

        <!-- formData -->
        <el-form-item label="FormData配置" prop="requestFormDataType">
          <el-select
            class="w-full"
            placeholder="请选择FormData配置类型"
            v-model="analyzerDataDefine.requestFormDataType"
            @change="analyzerDataDefine.requestFormData = undefined"
          >
            <el-option
              v-for="item in DATA_INPUT_BIND_OPTIONS"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <template
          v-if="
            analyzerDataDefine.requestFormDataType == 'enable-input' &&
            asType<WidgetDataDefineRequestHeaders[]>(analyzerDataDefine.requestFormData)
          "
        >
          <el-form-item label="FormData输入" prop="requestFormData">
            <RequestFormInput v-model="analyzerDataDefine.requestFormData" />
          </el-form-item>
        </template>
        <template
          v-if="
            analyzerDataDefine.requestFormDataType == 'enable-bind' &&
            asType<WidgetPropDefineBind>(analyzerDataDefine.requestFormData)
          "
        >
          <el-form-item label="FormData绑定" prop="requestFormData">
            <DataRefBindInput
              :editor="editor"
              :bind-options="refBindBindOptions"
              :ref-prop-types="['object']"
              :disable-execute="true"
              v-model="analyzerDataDefine.requestFormData"
            />
          </el-form-item>
        </template>

        <!-- requestBody -->
        <el-form-item label="RequestBody配置" prop="requestBodyType">
          <el-select
            class="w-full"
            placeholder="请选择RequestBody配置类型"
            :disabled="analyzerDataDefine.requestMethod == 'get'"
            v-model="analyzerDataDefine.requestBodyType"
            @change="analyzerDataDefine.requestBody = undefined"
          >
            <el-option
              v-for="item in DATA_INPUT_BIND_OPTIONS"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <template
          v-if="
            analyzerDataDefine.requestBodyType == 'enable-input' &&
            asType<string>(analyzerDataDefine.requestBody)
          "
        >
          <el-form-item label="RequestBody输入" prop="requestBody">
            <LowcodeCard name="RequestBody数据" :actions="requestBodyActions">
              <AceEditor lang="json" :height="200" v-model="analyzerDataDefine.requestBody" />
            </LowcodeCard>
          </el-form-item>
        </template>
        <template
          v-if="
            analyzerDataDefine.requestBodyType == 'enable-bind' &&
            asType<WidgetPropDefineBind>(analyzerDataDefine.requestBody)
          "
        >
          <el-form-item label="RequestBody绑定" prop="requestBody">
            <DataRefBindInput
              :editor="editor"
              :bind-options="refBindBindOptions"
              :ref-prop-types="['object']"
              :disable-execute="true"
              v-model="analyzerDataDefine.requestBody"
            />
          </el-form-item>
        </template>

        <!-- responseBody -->
        <el-form-item label="ResponseBody数据" prop="responseBody">
          <LowcodeCard name="ResponseBody数据" :actions="responseBodyActions">
            <AceEditor lang="json" :height="200" v-model="analyzerDataDefine.responseBody" />
          </LowcodeCard>
        </el-form-item>

        <!-- jsonDataPath -->
        <el-form-item label="数据路径" prop="jsonDataPath">
          <el-input
            clearable
            placeholder="请输入ResponseBody中数据路径"
            v-model="analyzerDataDefine.jsonDataPath"
          />
        </el-form-item>
      </template>

      <!-- ref&bind&runtime data define -->
      <template v-if="isType('ref', 'bind', 'runtime')">
        <el-form-item :label="`${refBindLabel}数据`" prop="refBind">
          <DataRefBindInput
            :editor="editor"
            :bind-options="refBindBindOptions"
            :ref-prop-types="refPropTypes"
            :disabled="isType('runtime')"
            :disableExecute="isType('runtime')"
            v-model="analyzerDataDefine.refBind"
            @change="onRefBindChange"
            @execute="onRefBindExecute"
          />
        </el-form-item>
      </template>

      <!-- <template v-if="isType('runtime')">
        <el-form-item label="运行时函数" prop="runtimeFunction">
          <LowcodeCard name="运行时辅助函数">
            <AceEditor
              lang="javascript"
              :height="200"
              v-model="analyzerDataDefine.runtimeFunction"
            />
          </LowcodeCard>
        </el-form-item>
        <el-form-item label="辅助函数" prop="analyzerFunction">
          <LowcodeCard name="结构分析时辅助函数">
            <AceEditor
              :readonly="true"
              lang="javascript"
              :height="200"
              v-model="analyzerDataDefine.analyzerFunction"
            />
          </LowcodeCard>
        </el-form-item>
      </template> -->

      <!-- widget data define -->
      <el-form-item
        prop="propDefines"
        v-if="isType('def', 'remote', 'ref', 'runtime', 'bind', 'const')"
      >
        <template #label>
          <TextLabel label="属性定义" helps="定义数组属性时名称为空可用“-”代替" />
        </template>
        <LowcodeCard name="属性定义" :actions="propDefineActions">
          <DataPropDefineInput
            :data-id="analyzerDataDefine._vid"
            :read-only="!isPropDefinesEditable"
            :only-comment-editable="isType('ref', 'bind')"
            v-model="analyzerDataDefine.propDefines"
          />
        </LowcodeCard>
      </el-form-item>
      <!-- widget data -->
      <el-form-item
        prop="jsonData"
        v-if="isType('def', 'remote', 'ref', 'runtime', 'bind', 'const')"
      >
        <template #label>
          <TextLabel label="JSON数据" helps="实际使用时的实际数据，远程数据时仅作为示例" />
        </template>
        <LowcodeCard name="JSON数据" :actions="jsonDataActions">
          <AceEditor
            lang="json"
            :height="200"
            :readonly="isType('ref', 'bind', 'runtime')"
            v-model="analyzerDataDefine.jsonData"
          />
        </LowcodeCard>
      </el-form-item>
      <!-- onSuccess -->
      <el-form-item
        label="onSuccess"
        prop="onSuccess"
        v-if="isType('def', 'remote', 'const', 'submit')"
      >
        <EvalFunctionValueInput
          name="数据加载成功时触发执行函数"
          type="simple-function"
          :editor="editor"
          :widget="dialogArgs!.widget"
          :height="100"
          :helps="`${highlightTextHtml('$args[0]')} 为 加载数据`"
          v-model="analyzerDataDefine.onSuccess"
        />
      </el-form-item>
      <!-- onError -->
      <el-form-item
        label="onError"
        prop="onError"
        v-if="isType('def', 'remote', 'const', 'submit')"
      >
        <EvalFunctionValueInput
          name="数据加载错误时触发执行函数"
          type="simple-function"
          :editor="editor"
          :widget="dialogArgs!.widget"
          :height="100"
          v-model="analyzerDataDefine.onError"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button
        v-if="isType('def', 'remote', 'ref', 'submit', 'bind', 'const')"
        type="primary"
        :disabled="formLoading"
        @click="submitForm"
      >
        确 定
      </el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { cloneDeep } from 'lodash-es'
import { isEmpty, isNullOrUnDef } from '@/utils/is'
import { jsonStringify, highlightTextHtml } from '../../common/utils'
import { useMessage } from '@/hooks/web/useMessage'
import {
  WidgetRenderContext,
  RequestUrlModeOptions,
  RequestMethodQueryOptions,
  RequestMethodModifyOptions,
  WidgetDataDefine,
  WidgetDataDefinePropDefine,
  WidgetDataDefinePropType,
  WidgetDataDefineRequestFormData,
  WidgetDataDefineRequestHeaders,
  WidgetDataDefeinScope,
  WidgetDataDefineType,
  WidgetDefine,
  WidgetInstance,
  WidgetPropDefine,
  WidgetPropDefineBind,
  DesignerEditor,
  PromiseCallback
} from '../designer-editor.type'
import LowcodeCard from '../../common/LowcodeCard.vue'
import AceEditor from '../../ace-editor/index.vue'
import DataPropDefineInput from './dataDefine/DataPropDefineInput.vue'
import RequestHeadersInput from './dataDefine/RequestHeadersInput.vue'
import RequestFormInput from './dataDefine/RequestFormInput.vue'
import DataRefBindInput from './dataDefine/DataRefBindInput.vue'
import TextLabel from '../../common/TextLabel.vue'
import {
  createDataDefine,
  getWidgetShortVidOrVar,
  checkDataDefineAreBound,
  checkDataDefineAreRefed,
  useDataDefineByVar,
  useWidgetTree,
  checkPropDefineBindType,
  useWidgetDataDefinesAndRuntime
} from '../designer-editor.utils'
import { useDataDefineAnalyzer, useDataDefineExecutor } from '../components/dataDefine/hooks'
import { ElForm } from 'element-plus'
import EvalFunctionValueInput from '../components/EvalFunctionValueInput.vue'

const DATA_TYPE_OPTIONS: Array<{ value: WidgetDataDefineType; label: string }> = [
  {
    value: 'def',
    label: '定义数据'
  },
  {
    value: 'remote',
    label: '远程数据'
  },
  {
    value: 'ref',
    label: '引用数据'
  },
  {
    value: 'submit',
    label: '提交数据'
  },
  {
    value: 'bind',
    label: '绑定数据'
  },
  {
    value: 'runtime',
    label: '运行时数据'
  }
]

const DATA_INPUT_BIND_OPTIONS: Array<{ value: string; label: string }> = [
  {
    value: 'disable',
    label: '不使用'
  },
  {
    value: 'enable-input',
    label: '输入数据'
  },
  {
    value: 'enable-bind',
    label: '绑定数据'
  }
]

const DATA_SCOPE_OPTIONS: Array<{ value: WidgetDataDefeinScope; label: string }> = [
  {
    value: 'global',
    label: '全局'
  },
  {
    value: 'self-children',
    label: '子组件(包括自身)'
  },
  {
    value: 'children',
    label: '子组件(仅子组件)'
  }
]

const RequestMethodOptions = computed(() =>
  isType('remote') ? RequestMethodQueryOptions : RequestMethodModifyOptions
)

const props = defineProps<{ editor: DesignerEditor }>()

export interface WidgetDataDefineFormArgs {
  title: string
  widget: WidgetInstance
  context: WidgetRenderContext
  widgetDefine: WidgetDefine
  widgetTree: WidgetInstance[]
  propDefine?: WidgetPropDefine
  dataDefine?: WidgetDataDefine
  isCopy?: boolean
}

const isNewAdd = ref(false)

const message = useMessage()

const dialogArgs = ref<WidgetDataDefineFormArgs>()
const dialogCallback = ref<PromiseCallback>({})

const dialogVisible = ref(false)

const formLoading = ref(false)

const formRef = ref<InstanceType<typeof ElForm>>()

const {
  analyzer,
  dataDefine: analyzerDataDefine,
  updateAnalyzer
} = useDataDefineAnalyzer(props.editor, { dataDefine: createDataDefine() })

const isPropDefinesEditable = ref(false)

const isRemoteRequestLoading = ref(false)

const validateVar = (_: any, value: string, callback: (error?: string | Error) => void) => {
  if (isEmpty(value)) {
    callback()
  } else {
    const define = useDataDefineByVar(props.editor, value)
    if (!isNullOrUnDef(define) && define?._vid != analyzerDataDefine.value._vid) {
      callback(new Error('数据变量已存在'))
    } else {
      callback()
    }
  }
}

const validatePropDefines = (
  _: any,
  value: WidgetDataDefinePropDefine[] | undefined,
  callback: (error?: string | Error) => void
) => {
  const validatePropDefineName = (list?: WidgetDataDefinePropDefine[]): string | undefined => {
    if (!isNullOrUnDef(list)) {
      const nameSet = new Set()
      for (const item of list) {
        if (isEmpty(item.name)) {
          return '属性名称不能为空'
        }
        if (nameSet.has(item.name)) {
          return `名称[ ${item.name} ]已存在,同级别属性不能存在相同名称`
        }
        nameSet.add(item.name)
        const itemValidMsg = validatePropDefineName(item.itemDefines)
        if (!isNullOrUnDef(itemValidMsg)) {
          return itemValidMsg
        }
      }
    }
  }
  callback(validatePropDefineName(value))
}

const validateHeadersOrFormData = (
  value?: WidgetDataDefineRequestHeaders[] | WidgetDataDefineRequestFormData[]
) => {
  if (!isNullOrUnDef(value) && !isEmpty(value)) {
    const nameSet = new Set()
    for (const item of value) {
      if (isEmpty(item.name)) {
        return '名称不能为空'
      }
      if (nameSet.has(item.name)) {
        return `名称[ ${item.name} ]已存在`
      }
      if (isEmpty(item.value)) {
        return '值不能为空'
      }
      nameSet.add(item.name)
    }
  } else {
    return '配置数据不能为空'
  }
}

const validatePropDefineBind = (label: string, value: WidgetPropDefineBind | undefined) => {
  if (!isNullOrUnDef(value)) {
    if (isEmpty(value?.bindList)) {
      return `请选择${label}的数据`
    }
    for (const bind of value?.bindList ?? []) {
      if (isNullOrUnDef(bind.bind)) {
        return `请选择${label}的数据模型`
      }
      if (isEmpty(bind.refPropKey)) {
        return `请选择${label}的数据属性`
      }
    }
  } else {
    return `请选择${label}数据`
  }
}

const validateRequestHeaders = (_: any, value: any, callback: (error?: string | Error) => void) => {
  if (analyzerDataDefine.value.requestHeadersType == 'enable-input') {
    return callback(validateHeadersOrFormData(value as WidgetDataDefineRequestHeaders[]))
  } else if (analyzerDataDefine.value.requestHeadersType == 'enable-bind') {
    return callback(validatePropDefineBind('绑定', value as WidgetPropDefineBind))
  } else {
    return callback()
  }
}

const validateRefBind = (_: any, value: any, callback: (error?: string | Error) => void) => {
  return callback(validatePropDefineBind(refBindLabel.value, value))
}

const validateRequestFormData = (
  _: any,
  value: any,
  callback: (error?: string | Error) => void
) => {
  if (analyzerDataDefine.value.requestFormDataType == 'enable-input') {
    return callback(validateHeadersOrFormData(value as WidgetDataDefineRequestHeaders[]))
  } else if (analyzerDataDefine.value.requestFormDataType == 'enable-bind') {
    return callback(validatePropDefineBind('绑定', value as WidgetPropDefineBind))
  } else {
    return callback()
  }
}

const validateRequestBody = (_: any, value: any, callback: (error?: string | Error) => void) => {
  if (analyzerDataDefine.value.requestBody == 'enable-input') {
    return callback(isEmpty(value) ? '请输入请求体' : undefined)
  } else if (analyzerDataDefine.value.requestBody == 'enable-bind') {
    return callback(validatePropDefineBind('绑定', value as WidgetPropDefineBind))
  } else {
    return callback()
  }
}

// 表单校验规则
const formRules = computed(() => {
  return {
    _var: [{ validator: validateVar, trigger: 'change' }],
    _type: [{ required: true, message: '请选择数据类型', trigger: 'change' }],
    name: [{ required: true, message: '请输入数据名称', trigger: 'change' }],
    scope: [{ required: true, message: '请选择数据作用域', trigger: 'change' }],
    propDefines: [
      { required: true, message: '请输入属性定义或者输入JSON示例数据解析', trigger: 'change' },
      { validator: validatePropDefines, trigger: 'change' }
    ],
    jsonData: [{ required: true, message: '请输入JSON示例数据', trigger: 'change' }],
    refBind: [
      { required: true, message: '请选择数据模型', trigger: 'change' },
      { validator: validateRefBind, trigger: 'change' }
    ],
    requestUrlMode: [{ required: true, message: '请选择Api地址模式', trigger: 'change' }],
    requestUrl: [{ required: true, message: '请输入Api地址', trigger: 'change' }],
    successMsg: [{ required: true, message: '请输入成功提示', trigger: 'change' }],
    requestHeadersType: [{ required: true, message: '请选择Headers配置类型', trigger: 'change' }],
    requestHeaders: [
      { required: true, message: 'Headers数据未配置', trigger: 'change' },
      { validator: validateRequestHeaders, trigger: 'change' }
    ],
    requestFormDataType: [{ required: true, message: '请选择FormData配置类型', trigger: 'change' }],
    requestFormData: [
      { required: true, message: 'FormData数据未配置', trigger: 'change' },
      { validator: validateRequestFormData, trigger: 'change' }
    ],
    requestBodyType: [{ required: true, message: '请选择RequestBody配置类型', trigger: 'change' }],
    requestBody: [
      { required: true, message: 'RequestBody数据未配置', trigger: 'change' },
      { validator: validateRequestBody, trigger: 'change' }
    ],
    responseBody: [
      { required: isType('remote'), message: '请输入ResponseBody数据', trigger: 'change' }
    ],
    jsonDataPath: [{ required: true, message: '请输入数据路径', trigger: 'change' }]
  }
})

// 可用模型类型
const validDataType = computed<WidgetDataDefineType[]>(() => {
  return dialogArgs.value?.widgetDefine?.enableDataDefineTypes ?? ['def', 'remote', 'ref', 'submit']
})

const isType = (...types: WidgetDataDefineType[]): boolean => {
  return types.includes(analyzer.value.dataDefine._type)
}

const refBindLabel = computed(() => {
  if (isType('bind')) {
    return '绑定'
  } else if (isType('ref')) {
    return '引用'
  } else if (isType('runtime')) {
    return '依赖'
  } else {
    return '--'
  }
})

// 模型类型选项
const dataTypeSelectOptions = computed(() => {
  return DATA_TYPE_OPTIONS.filter((e) => validDataType.value.includes(e.value))
})

// 父组件id
const parentWidgetIdList = computed<string[]>(() => {
  return dialogArgs.value?.context.seekParent().seekLink?.map((i) => i._vid) ?? []
})

// 根据类型过滤可用的数据定义
const filterByType = (define: WidgetDataDefine) => {
  if (isType('ref')) {
    return ['def', 'remote', 'runtime', 'const'].includes(define._type)
  } else {
    return ['def', 'remote', 'ref', 'runtime', 'const'].includes(define._type)
  }
}

// 根据作用域过滤可用的数据定义
const filterByScope = (_vid: string, define: WidgetDataDefine) => {
  if (define.scope == 'global') {
    return true
  } else if (define.scope == 'self-children') {
    return _vid == dialogArgs.value?.widget._vid || parentWidgetIdList.value.includes(_vid)
  } else if (define.scope == 'children') {
    return parentWidgetIdList.value.includes(_vid)
  }
  return false
}

// 组件树平整化
const flatWidgetTree = computed(() => {
  const flatList: WidgetInstance[] = []
  const seekDataDefineWidget = (array?: WidgetInstance[]) => {
    array?.forEach((w) => {
      const dataDefinesWithRuntime = useWidgetDataDefinesAndRuntime(props.editor, w)
      if (dataDefinesWithRuntime.find((d) => filterByType(d) && filterByScope(w._vid, d))) {
        flatList.push(w)
      }
      seekDataDefineWidget(w.slotChildren)
      seekDataDefineWidget(w.slots)
    })
  }
  seekDataDefineWidget(dialogArgs.value?.widgetTree ?? useWidgetTree(props.editor))
  return flatList
})

// 引用数据选项
const refBindBindOptions = computed(() => {
  const optionList: any[] = []
  const { widget, propDefine } = dialogArgs.value ?? {}
  flatWidgetTree.value.forEach((w) => {
    const dataDefinesWithRuntime = useWidgetDataDefinesAndRuntime(props.editor, w)
    dataDefinesWithRuntime.forEach((dataDefine) => {
      if (!isNullOrUnDef(widget) && filterByType(dataDefine) && filterByScope(w._vid, dataDefine)) {
        if (propDefine?.isDataDefineBindable?.(widget, dataDefine) ?? true)
          optionList.push({
            refWidgetId: w._vid,
            refDataType: dataDefine._type,
            refDataId: dataDefine._vid,
            label: `${dataDefine.name} [ ${getWidgetShortVidOrVar(w)} ]`
          })
      }
    })
  })
  return optionList
})

// 引用数据类型
const refPropTypes = computed<WidgetDataDefinePropType[] | undefined>(() => {
  if (isType('ref')) {
    return ['object', 'array']
  }
  return undefined
})

const asType = <T = unknown,>(_?: any): _ is T => {
  return true
}

const onTypeChange = () => {
  if (analyzerDataDefine.value._type == 'ref') {
    analyzerDataDefine.value.isAutoLoad = true
  } else if (analyzerDataDefine.value._type == 'submit') {
    analyzerDataDefine.value.scope = 'global'
    analyzerDataDefine.value.isAutoLoad = false
    analyzerDataDefine.value.requestMethod = 'post'
    analyzerDataDefine.value.isShowSuccessMsg = true
    analyzerDataDefine.value.successMsg = '提交成功'
  } else {
    analyzerDataDefine.value.isAutoLoad = true
    analyzerDataDefine.value.requestMethod = 'get'
    analyzerDataDefine.value.isShowSuccessMsg = false
    analyzerDataDefine.value.successMsg = undefined
  }
}

const onRequestMethodChange = () => {
  if (analyzerDataDefine.value.requestMethod == 'get') {
    analyzerDataDefine.value.requestBodyType = 'disable'
  } else {
    analyzerDataDefine.value.requestBodyType = 'enable-input'
  }
  analyzerDataDefine.value.requestBody = undefined
}

const propDefineActions = computed(() => {
  return [
    {
      type: 'danger',
      label: isPropDefinesEditable.value ? '只读模式' : '编辑模式',
      isShow: isType('def', 'remote', 'ref', 'const'),
      onClick: () => {
        isPropDefinesEditable.value = !isPropDefinesEditable.value
      }
    },
    {
      type: 'warning',
      label: '解析请求',
      isShow: isType('remote'),
      onClick: doAnalysisRemoteRequest
    },
    {
      type: 'warning',
      label: '刷新引用',
      isShow: isType('ref'),
      onClick: doAnalysisRefDefines
    },
    {
      type: 'warning',
      label: '刷新绑定',
      isShow: isType('bind'),
      onClick: doAnalysisBindDefines
    },
    {
      type: 'success',
      label: '生成JSON',
      isShow: isType('def', 'remote', 'ref', 'const'),
      onClick: () => {
        if (!analyzer.value.tryGenerateJsonData()) {
          message.error('生成JSON失败')
        }
      }
    }
  ]
})

const jsonDataActions = computed(() => {
  return [
    {
      type: 'primary',
      label: '刷新结果',
      isShow: isType('def', 'remote', 'const'),
      onClick: () => {
        const { value } = useDataDefineExecutor(props.editor, {
          dataDefine: analyzer.value.dataDefine
        })
        analyzer.value.setJsonData(jsonStringify(value.value ?? {}))
      }
    },
    {
      type: 'success',
      label: '解析JSON',
      isShow: isType('def', 'remote', 'const'),
      onClick: () => {
        if (!analyzer.value.tryAnalysisDefines()) {
          message.error('解析JSON失败')
        }
      }
    },
    {
      type: 'warning',
      label: '解析请求',
      isShow: isType('remote'),
      onClick: doAnalysisRemoteRequest
    },
    {
      type: 'warning',
      label: '刷新引用',
      isShow: isType('ref'),
      onClick: doAnalysisRefDefines
    },
    {
      type: 'warning',
      label: '刷新绑定',
      isShow: isType('bind'),
      onClick: doAnalysisBindDefines
    }
  ]
})

const requestBodyActions = computed(() => {
  return [
    {
      type: 'primary',
      label: '测试请求',
      isShow: isType('remote', 'submit'),
      onClick: doTestRemoteRequest
    },
    {
      type: 'warning',
      label: '解析请求',
      isShow: isType('remote'),
      onClick: doAnalysisRemoteRequest
    }
  ]
})

const responseBodyActions = computed(() => {
  return [
    {
      type: 'primary',
      label: '测试请求',
      isShow: isType('remote', 'submit'),
      onClick: doTestRemoteRequest
    },
    {
      type: 'warning',
      label: '解析请求',
      isShow: isType('remote'),
      onClick: doAnalysisRemoteRequest
    }
  ]
})

// 绑定解析
const doAnalysisBindDefines = () => {
  if (!analyzer.value.tryAnalysisBindDefines()) {
    message.error('绑定数据解析失败')
  }
}

// 发送测试请求获取响应数据
const doTestRemoteRequest = async () => {
  try {
    isRemoteRequestLoading.value = true
    await analyzer.value.testRemoteRequest()
  } finally {
    isRemoteRequestLoading.value = false
  }
}

// 从远程数据中解析
const doAnalysisRemoteRequest = async () => {
  try {
    isRemoteRequestLoading.value = true
    const success = await analyzer.value.tryAnalysisRemoteDefines()
    if (!success) {
      message.error('解析远程数据失败')
    }
  } finally {
    isRemoteRequestLoading.value = false
  }
}

// 绑定|引用数据模型 change
const onRefBindChange = () => {
  analyzer.value.setJsonData('{}')
  analyzer.value.setPropDefines([])
  if (isType('ref')) {
    doAnalysisRefDefines()
  } else {
    doAnalysisBindDefines()
  }
}

const onRefBindExecute = () => {
  if (isType('ref')) {
    doAnalysisRefDefines()
  } else {
    doAnalysisBindDefines()
  }
}

// 引用解析
const doAnalysisRefDefines = () => {
  if (!analyzer.value.tryAnalysisRefDefines()) {
    message.error('引用数据解析失败')
  }
}

/** 打开弹窗 */
const open = async (args: WidgetDataDefineFormArgs, callback?: PromiseCallback) => {
  try {
    formLoading.value = true
    resetForm()
    dialogArgs.value = { ...args }
    if (args.isCopy) {
      dialogArgs.value.dataDefine = undefined
    }
    dialogCallback.value = { ...callback }

    // 读取copy数据定义
    const copyDefine: any = args.isCopy ? cloneDeep(args.dataDefine) : {}
    delete copyDefine._vid
    delete copyDefine._var

    // 初始化数据定义
    let dataDefine = createDataDefine({
      _type: validDataType.value[0],
      widgetId: dialogArgs.value?.widget._vid,
      ...copyDefine
    })
    if (!isNullOrUnDef(dialogArgs.value?.dataDefine)) {
      dataDefine = cloneDeep(dialogArgs.value.dataDefine)
      isNewAdd.value = false
    } else {
      isNewAdd.value = true
    }
    const { analyzer } = updateAnalyzer({ dataDefine })
    if (dataDefine._type == 'bind') {
      analyzer.value.tryAnalysisBindDefines()
    } else if (dataDefine._type == 'runtime') {
      analyzer.value.tryGenerateJsonData()
    } else if (dataDefine._type == 'const') {
      if (isEmpty(dataDefine.propDefines)) {
        analyzer.value.tryAnalysisConstDefines()
      }
    }
    dialogVisible.value = true
  } finally {
    formLoading.value = false
  }
}

// 引用属性检查
const doCheckForRefed = (propDefines?: WidgetDataDefinePropDefine[]) => {
  const refedList = checkDataDefineAreRefed(
    props.editor,
    dialogArgs.value?.widget,
    dialogArgs.value?.dataDefine
  )
  const refedPropKeyNotExist = refedList?.find((e) =>
    isNullOrUnDef(analyzer.value.findPropDefineByKey(propDefines, e.refedPropKey))
  )
  if (!isNullOrUnDef(refedPropKeyNotExist)) {
    message.error(`被引用中的 ${refedPropKeyNotExist?.refedPropKey} 属性不存在`)
    return false
  }
  return true
}
// 绑定属性检查
const doCheckForBound = (propDefines?: WidgetDataDefinePropDefine[]) => {
  const boundList = checkDataDefineAreBound(
    props.editor,
    dialogArgs.value?.widget,
    dialogArgs.value?.dataDefine
  )
  const boundPropKeyNotExist = boundList?.find((e) =>
    isNullOrUnDef(analyzer.value.findPropDefineByKey(propDefines, e.refedPropKey))
  )
  if (!isNullOrUnDef(boundPropKeyNotExist)) {
    message.error(`被绑定中的 ${boundPropKeyNotExist!.refedPropKey} 属性不存在`)
    return false
  }
  return true
}

// 绑定类型检查
const doCheckForBindType = (propDefines?: WidgetDataDefinePropDefine[]) => {
  const error = checkPropDefineBindType(dialogArgs?.value?.propDefine, propDefines)
  if (error) {
    message.error(error)
    return false
  }
  return true
}

const onDialogClose = () => {
  dialogCallback.value.reject?.('close dialog')
}
const submitForm = async () => {
  await formRef.value?.validate()
  // 重置属性Key
  analyzer.value.resetPropDefinesKey()
  // 属性检查
  const { _type, propDefines } = analyzer.value.dataDefine
  if (_type == 'def' || _type == 'remote' || _type == 'ref' || _type == 'const') {
    if (!doCheckForRefed(propDefines) || !doCheckForBound(propDefines)) {
      return
    }
  } else if (_type == 'bind') {
    if (!doCheckForBindType(propDefines)) {
      return
    }
  }
  const { reject, resolve } = dialogCallback.value
  try {
    formLoading.value = true
    dialogCallback.value = {}
    resolve?.(analyzer.value.dataDefine)
    dialogVisible.value = false
  } catch (e) {
    reject?.(e)
  } finally {
    formLoading.value = false
  }
}

const resetForm = () => {
  dialogArgs.value = undefined
  isPropDefinesEditable.value = false
  updateAnalyzer({ dataDefine: createDataDefine() })
  formRef.value?.resetFields()
}

defineExpose({ open })
</script>

<style scoped lang="scss"></style>
