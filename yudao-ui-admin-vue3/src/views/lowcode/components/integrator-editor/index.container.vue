<template>
  <ContentWrap v-loading="isSaving">
    <div class="flex my-4 justify-center">
      <div class="w-full mt-12px">
        <el-steps :active="currentStep" finish-status="success" align-center>
          <el-step title="查询器选择" description="选择要集成的接口" />
          <el-step title="设计器选择" description="选择要集成的页面" />
          <el-step title="选择配置" description="选择要使用的集成配置" />
          <el-step title="执行" description="确认执行" />
        </el-steps>
      </div>
    </div>

    <!-- 查询器选择 -->
    <div class="flex my-4 justify-center" v-if="currentStep == 0">
      <div class="w-90%">
        <QuerierIndex
          integrator-selectable
          :integrator-selected-ids="querierSelectedIds"
          @integrator-select-change="setQuerierSelectedIds"
        />
      </div>
    </div>

    <!-- 设计器选择 -->
    <div class="flex my-4 justify-center" v-if="currentStep == 1">
      <div class="w-90%">
        <DesignerIndex
          integrator-selectable
          :integrator-selected-ids="designerSelectedIds"
          @integrator-select-change="setDesignerSelectedIds"
        />
      </div>
    </div>

    <!-- 选择配置 -->
    <div class="flex my-4 justify-center" v-if="currentStep == 2">
      <div class="w-90%">
        <IntegratorConfig
          integrator-selectable
          :integrator-selected-ids="integratorConfigIds"
          @integrator-select-change="setIntegratorConfigIds"
        />
      </div>
    </div>

    <!-- 确认执行 -->
    <div
      class="flex flex-col gap-2 my-4 items-center"
      v-loading="isSelectedConfigLoading"
      v-if="currentStep == 3"
    >
      <div class="w-50%">
        <div
          v-for="item in selectedConfigs"
          :key="item.id"
          class="flex gap-2 p-2 bg-[--el-fill-color-light]"
        >
          <div class="w-100px flex justify-center items-center">
            <el-text :type="isPull(item) ? 'danger' : 'primary'">
              {{ item.configName }}
            </el-text>
          </div>
          <div class="flex-1">
            <el-progress
              :stroke-width="16"
              :duration="30"
              :status="isDone(item) ? 'success' : isPull(item) ? 'exception' : ''"
              :percentage="calcPercentage(item)"
              :striped="!isDone(item)"
              :stripedFlow="!isDone(item)"
            >
              <div @click="toggleIsPull(item)">
                <el-text class="cursor-pointer">
                  <el-text :type="isPull(item) ? 'info' : 'primary'">推送</el-text>
                  /
                  <el-text :type="isPull(item) ? 'danger' : 'info'">拉取</el-text>
                </el-text>
              </div>
            </el-progress>
          </div>
        </div>
      </div>
      <div class="w-50%">
        <div class="h-200px p-2 bg-[--el-fill-color-dark]">
          <el-scrollbar ref="logScrollRef">
            <div ref="scrollerInnerRef">
              <div v-for="(item, i) in integratorSyncLogs" :key="`${i}`">
                <el-text :type="item.type">{{ item.msg }}</el-text>
              </div>
            </div>
          </el-scrollbar>
        </div>
      </div>
    </div>

    <div class="flex my-4 justify-center">
      <el-button :disabled="currentStep == 0" @click="prevStep"> 上一步 </el-button>
      <el-button v-if="currentStep < 3" type="primary" @click="nexStep"> 下一步 </el-button>
      <el-button v-else type="primary" :loading="isSyncing" @click="startAsync">
        开始执行
      </el-button>
    </div>
  </ContentWrap>
</template>

<script lang="ts" setup>
import { IntegratorEditor } from './integrator-editor.type'
import QuerierIndex from '../../querier/index.vue'
import DesignerIndex from '../../designer/index.vue'
import IntegratorConfig from '../../integrator/config.vue'
import { IntegratorConfigVO } from '@/api/lowcode/editor/integrator'
import { ElScrollbar } from 'element-plus'

const props = defineProps<{ editor: IntegratorEditor }>()

const store = props.editor.getStore()

const logScrollRef = ref<InstanceType<typeof ElScrollbar>>()

const scrollerInnerRef = ref()

const {
  state,
  isSaving,
  isSelectedConfigLoading,
  isSyncing,
  nexStep,
  prevStep,
  setQuerierSelectedIds,
  setDesignerSelectedIds,
  setIntegratorConfigIds,
  loadSyncConfigs,
  toggleSyncConfigIsPull,
  startAsync
} = store

const currentStep = computed(() => state.value.editorData.currentStep)

const querierSelectedIds = computed(() => state.value.editorData.querierSelectedIds)

const designerSelectedIds = computed(() => state.value.editorData.designerSelectedIds)

const integratorConfigIds = computed(() => state.value.editorData.integratorConfigIds)

const selectedConfigs = computed(() => state.value.selectedConfigs)

const integratorSyncConfigs = computed(() => state.value.editorData.integratorSyncConfigs)

const integratorSyncLogs = computed(() => state.value.editorData.integratorSyncLogs as any[])

const isPull = (c: IntegratorConfigVO) => {
  return integratorSyncConfigs.value.find((e) => e.id == c.id)?.isPull
}

const isDone = (c: IntegratorConfigVO) => {
  return integratorSyncConfigs.value.find((e) => e.id == c.id)?.isDone
}

const toggleIsPull = (c: IntegratorConfigVO) => {
  return toggleSyncConfigIsPull(c.id)
}

const calcPercentage = (c: IntegratorConfigVO) => {
  const total = querierSelectedIds.value.length + designerSelectedIds.value.length
  const sync = integratorSyncConfigs.value.find((e) => e.id == c.id)
  return (
    (((sync?.querierSuccessIds.length ?? 0) + (sync?.designerSuccessIds.length ?? 0)) / total) * 100
  )
}

watch(
  () => currentStep.value,
  () => {
    if (currentStep.value == 3) {
      loadSyncConfigs()
    }
  },
  { immediate: true }
)

watch(
  () => integratorSyncLogs.value,
  () => {
    nextTick(() => {
      logScrollRef.value?.setScrollTop(scrollerInnerRef.value?.clientHeight ?? Number.MAX_VALUE)
    })
  },
  { immediate: true }
)
</script>
