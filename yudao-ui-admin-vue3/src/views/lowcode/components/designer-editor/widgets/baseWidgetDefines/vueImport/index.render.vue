<!-- index.render.vue -->
<template>
  <div
    v-if="isEmpty(importName)"
    class="w-full h-full flex justify-center items-center gap-2 p-1 bg-[--el-color-info]"
  >
    <TextLabel class="!c-#fff" placement="top" label="可通过 路径 导入 VUE 组件" />
  </div>
  <div v-else v-loading="importLoading">
    <component v-if="isEmpty(importError)" :is="importComponet" :key="widget._vid" :scope="scope" />
    <el-alert v-else :closable="false" :title="`加载失败: ${importError}`" type="error" />
  </div>
</template>
<script lang="ts" setup>
import { isEmpty } from '@/utils/is'
import { useWidget, type WidgetRenderProps } from '../../hooks'
import TextLabel from '../../../../common/TextLabel.vue'

const props = defineProps<WidgetRenderProps>()

const { usePropValue, isPreviewMode } = useWidget(props)

const importComponet = shallowRef(undefined)

const importLoading = ref(false)

const importError = ref('')

const scope = computed(() => usePropValue('scope'))

const importName = computed(() => usePropValue('importName'))

// 预加载所有组件所在路径
const components = import.meta.glob(['./src/**/*.vue'], { eager: false })

const loadComponent = async (name: string) => {
  try {
    importLoading.value = true
    importError.value = ''
    name = `${name}${name.endsWith('.vue') ? '' : '.vue'}`
    let importPath = `./src/${name}`
    const componentImporter = components[importPath]
    if (!componentImporter) {
      throw new Error(`组件 ${name} 未找到`)
    }
    const { default: component } = (await componentImporter()) as any
    importComponet.value = defineAsyncComponent(() => Promise.resolve(component))
  } catch (error) {
    importError.value = `加载组件 ${name} 失败:${error}`
    console.error(importError.value, error)
  } finally {
    importLoading.value = false
    if (isPreviewMode.value) {
      unwatch()
    }
  }
}

const unwatch = watch(
  () => importName.value,
  () => {
    if (!isEmpty(importName.value)) {
      loadComponent(importName.value)
    }
  },
  { immediate: true }
)
</script>
