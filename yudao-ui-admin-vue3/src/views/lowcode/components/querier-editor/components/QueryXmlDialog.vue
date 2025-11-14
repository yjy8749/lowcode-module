<template>
  <Dialog title="查询 XML 配置" width="1200px" v-model="dialogVisible">
    <el-form
      ref="formRef"
      labelWidth="120px"
      :model="formData"
      :rules="formRules"
      v-loading="formLoading"
    >
      <el-form-item label="描述" prop="desc">
        <el-input :disabled="isPreview" v-model="formData.desc" />
      </el-form-item>
      <div class="flex justify-between">
        <el-form-item label="必须登录" prop="login">
          <el-switch :disabled="isPreview" v-model="formData.login" />
        </el-form-item>
        <el-form-item label="资源权限" prop="permission">
          <el-input placeholder="权限编码" :disabled="isPreview" v-model="formData.permission" />
        </el-form-item>
        <el-form-item label="最大返回行数" prop="maxReturnRows">
          <el-input-number
            :min="0"
            :step="10"
            :precision="0"
            :disabled="isPreview"
            placeholder="1000"
            v-model="formData.maxReturnRows"
          />
        </el-form-item>
        <el-form-item label="开启缓存" prop="cache">
          <el-switch :disabled="isPreview" v-model="formData.cache" />
        </el-form-item>
        <el-form-item label="缓存时间(毫秒)" prop="ttl">
          <el-input-number
            :placeholder="`${DEFAULT_CACHE_TTL}`"
            :min="0"
            :step="100"
            :precision="0"
            :disabled="!formData.cache || isPreview"
            v-model="formData.ttl"
          />
        </el-form-item>
      </div>
      <el-tabs v-model="activeTab">
        <el-tab-pane lazy label="主表配置" name="mainTableList">
          <el-form-item label-position="top" prop="mainTableList">
            <QueryXmlTableArrayValueInput
              :disabled="isPreview"
              :is-main-table="true"
              :min-length="1"
              :max-length="10"
              v-model="formData.mainTableList"
            />
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane lazy label="副表配置" name="queryTableList">
          <el-form-item label-position="top" prop="queryTableList">
            <QueryXmlTableArrayValueInput
              :disabled="isPreview"
              :is-main-table="false"
              :max-length="10"
              v-model="formData.queryTableList"
            />
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane lazy label="字段配置" name="queryFieldList">
          <div class="flex flex-col gap-1">
            <QueryXmlTableArrayValueInput
              :disabled="isPreview"
              :is-main-table="true"
              :only-field-editable="true"
              :model-value="hasFieldMainTableList"
            />
            <QueryXmlTableArrayValueInput
              :disabled="isPreview"
              :is-main-table="false"
              :only-field-editable="true"
              :model-value="hasFieldQueryTableList"
            />
            <el-card class="w-full" header="全局字段" shadow="hover">
              <QueryXmlTableFieldArrayValueInput
                :disabled="isPreview"
                v-model="formData.queryFieldList"
              />
            </el-card>
          </div>
        </el-tab-pane>
        <el-tab-pane lazy label="查询条件" name="queryWhere.value">
          <el-form-item label-position="top" prop="mainTableList">
            <LowcodeCard name="默认查询条件" tips="输入默认查询条件, 每次查询均会执行">
              <AceEditor
                lang="sql"
                :height="200"
                :readonly="isPreview"
                :model-value="formData.queryWhere?.value"
                @update:model-value="
                  (value) => (formData.queryWhere = !isEmpty(value) ? { value } : undefined)
                "
              />
            </LowcodeCard>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane lazy label="过滤器" name="queryFilter">
          <el-form-item label-position="top" prop="queryFilter">
            <QueryXmlFilterArrayValueInput
              :disabled="isPreview"
              :model-value="formData.queryFilter?.queryFilterValueList ?? []"
              @update:model-value="
                (val) =>
                  (formData.queryFilter = !isEmpty(val) ? { queryFilterValueList: val } : undefined)
              "
            />
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane lazy label="拦截器" name="queryInterceptor">
          <el-form-item label-position="top" prop="queryInterceptor">
            <QueryXmlInterceptorArrayValueInput
              :disabled="isPreview"
              :model-value="formData.queryInterceptor?.queryInterceptorValueList ?? []"
              @update:model-value="
                (val) =>
                  (formData.queryInterceptor = !isEmpty(val)
                    ? { queryInterceptorValueList: val }
                    : undefined)
              "
            />
          </el-form-item>
        </el-tab-pane>
      </el-tabs>
    </el-form>
    <template #footer>
      <el-button type="primary" v-if="!isPreview" :disabled="formLoading" @click="doConfirm">
        确 定
      </el-button>
      <el-button @click="dialogVisible = false">关 闭</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { ParseQueryDomainXmlReqVO } from '@/api/lowcode/editor/querier'
import { QuerierEditorApi } from '@/api/lowcode/editor/querier'
import { DEFAULT_CACHE_TTL, QueryDomain } from '../querier-editor.type'
import QueryXmlTableArrayValueInput from './QueryXmlTableArrayValueInput.vue'
import QueryXmlTableFieldArrayValueInput from './QueryXmlTableFieldArrayValueInput.vue'
import QueryXmlFilterArrayValueInput from './QueryXmlFilterArrayValueInput.vue'
import QueryXmlInterceptorArrayValueInput from './QueryXmlInterceptorArrayValueInput.vue'
import { ElForm, FormRules } from 'element-plus'
import { isEmpty } from '@/utils/is'
import LowcodeCard from '../../common/LowcodeCard.vue'
import AceEditor from '../../ace-editor/index.vue'

export type QueryXmlDialogEmits = {
  success: [xml: string]
}

const emits = defineEmits<QueryXmlDialogEmits>()

const dialogVisible = ref(false)

const formRef = ref<InstanceType<typeof ElForm>>()

const formData = ref<QueryDomain>({})

const formRules = reactive<FormRules>({})

const formLoading = ref(false)

const isPreview = ref(false)

const activeTab = ref('mainTableList')

const hasFieldMainTableList = computed(() =>
  (formData.value.mainTableList ?? []).filter((i) => !isEmpty(i.queryFieldList))
)
const hasFieldQueryTableList = computed(() =>
  (formData.value.queryTableList ?? []).filter((i) => !isEmpty(i.queryFieldList))
)

const open = async (args: ParseQueryDomainXmlReqVO, readOnly: boolean) => {
  dialogVisible.value = true
  try {
    activeTab.value = 'mainTableList'
    formLoading.value = true
    const queryDomain = await QuerierEditorApi.parseQueryDomainXml(args)
    formData.value = queryDomain
    isPreview.value = readOnly
  } finally {
    formLoading.value = false
  }
}

const doConfirm = async () => {
  await formRef.value?.validate()
  try {
    formLoading.value = true
    const queryXml = await QuerierEditorApi.toQueryDomainXml({ queryDomain: formData.value })
    emits('success', queryXml)
    dialogVisible.value = false
  } finally {
    formLoading.value = false
  }
}

defineExpose({ open })
</script>

<style scoped lang="scss"></style>
