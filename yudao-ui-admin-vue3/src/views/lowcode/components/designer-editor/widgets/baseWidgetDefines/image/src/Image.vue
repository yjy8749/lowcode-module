<template>
  <div class="Image w-full h-full overflow-hidden line-height-0" :style="sizeStyle">
    <el-image
      class="w-full h-full"
      :class="{ 'thumbnail-image': isProgressive, 'image-fade-in': realImageLoaded }"
      :src="imageSrc"
      :alt="alt"
      :fit="fit"
      :loading="lazy ? 'lazy' : undefined"
      :lazy="lazy"
      :previewSrcList="previewImageSrcList"
      :initialIndex="initialIndex"
      preview-teleported
      hide-on-clickModal
      show-progress
    />
    <el-image
      v-if="isProgressive && !realImageLoaded"
      style="width: 0; height: 0"
      :src="realImageLoadSrc"
      :loading="lazy ? 'lazy' : undefined"
      :lazy="lazy"
      @load="onRealImageLoad"
    />
  </div>
</template>
<script lang="ts" setup>
import { isEmpty } from '@/utils/is'
import { ImageProps as ElImageProps } from 'element-plus'

export interface ImageProps {
  // 图片路径
  src: string
  // 宽度
  width?: string
  // 高度
  height?: string
  // 容器适应方式
  fit?: ElImageProps['fit']
  // 是否使用懒加载
  lazy?: boolean
  // 原生属性 alt
  alt?: string
  // 是否开启预览
  preview?: boolean
  // 预览图片列表
  previewSrcList?: string[]
  // 初始预览图像索引，
  initialIndex?: number
  // 图片存储类型
  cloudType?: string | 'aliyun'
  // 是否渐进式加载
  progressive?: boolean
  // 缩略图参数
  thumbnailArgs?: string
  // 默认图参数
  defaultArgs?: string
  // 预览图参数
  previewArgs?: string
}

const props = defineProps<ImageProps>()

const sizeStyle = computed(() => {
  return { width: props.width, height: props.height }
})

const isAliyun = computed(() => `${props.cloudType}`.toLowerCase() == 'aliyun')

const isProgressive = computed(
  () => props.progressive && !isEmpty(props.thumbnailArgs) && isAliyun.value
)

const thumbnailSrc = (src?: string) => {
  const strs = `${src}`.split('?')
  return `${strs[0]}?${isEmpty(strs[1]) ? '' : strs[1]}&${props.thumbnailArgs}`
}

const defaultImageSrc = (src?: string) => {
  const strs = `${src}`.split('?')
  return `${strs[0]}?${isEmpty(strs[1]) ? '' : strs[1]}${isEmpty(props.defaultArgs) ? '' : '&'}${props.defaultArgs ?? ''}`
}

const previewImageSrc = (src?: string) => {
  const strs = `${src}`.split('?')
  return `${strs[0]}?${isEmpty(strs[1]) ? '' : strs[1]}${isEmpty(props.previewArgs) ? '' : '&'}${props.previewArgs ?? ''}`
}

const previewImageSrcList = computed(() => {
  if (props.preview) {
    const list = [...(props.previewSrcList ?? [])]
    if (isEmpty(list) && !isEmpty(props.src)) {
      list.push(props.src)
    }
    return list.map((e) => previewImageSrc(e))
  }
})

const imageSrc = ref('')

const realImageLoadSrc = computed(() => defaultImageSrc(props.src))

const realImageLoaded = ref(false)

const onRealImageLoad = () => {
  imageSrc.value = defaultImageSrc(props.src)
  realImageLoaded.value = true
}

watch(
  () => props.src,
  () => {
    realImageLoaded.value = false
    if (isProgressive.value) {
      imageSrc.value = thumbnailSrc(props.src)
    } else {
      imageSrc.value = defaultImageSrc(props.src)
    }
  },
  { immediate: true }
)
</script>
<style lang="scss" scoped>
.Image {
  @keyframes fade-in {
    from {
      filter: blur(5px);
    }

    to {
      filter: blur(0);
    }
  }

  .thumbnail-image {
    filter: blur(5px);
  }

  .image-fade-in {
    filter: blur(0);
    animation: fade-in 0.3s ease-in;
  }
}
</style>
