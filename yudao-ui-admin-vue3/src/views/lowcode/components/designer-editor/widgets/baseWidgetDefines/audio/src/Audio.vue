<template>
  <AudioPlayer
    ref="player"
    :option="option"
    @loadedmetadata="onLoadedmetadata"
    @playing="onPlaying"
    @play="onPlay"
    @play-error="onPlayError"
    @timeupdate="onTimeupdate"
    @pause="onPause"
    @ended="onEnded"
    @progress-start="onProgressStart"
    @progress-end="onProgressEnd"
    @progress-move="onProgressMove"
    @progress-click="onProgressClick"
  />
</template>

<script setup lang="ts">
import 'vue3-audio-player/dist/style.css'
import { computed, ref } from 'vue'
import AudioPlayer from 'vue3-audio-player'
import { type AudioPlayerOption } from 'vue3-audio-player'
import { isEmpty } from '@/utils/is'

export interface AudioProps {
  src?: string
  title?: string
  coverImage?: string
  coverRotate?: boolean
  autoPlay?: boolean
  progressBarColor?: string
  indicatorColor?: string
}

export type AudioEmits = {
  loadedmetadata: [e: any]
  playing: [e: any]
  play: [e: any]
  playError: [e: any]
  timeupdate: [e: any]
  pause: [e: any]
  ended: [e: any]
  progressStart: [e: any]
  progressEnd: [e: any]
  progressMove: [e: any]
  progressClick: [e: any]
}

const props = defineProps<AudioProps>()

const emits = defineEmits<AudioEmits>()

const option = computed<AudioPlayerOption>(() => {
  return {
    src: props.src ?? '',
    title: props.title,
    coverImage: props.coverImage,
    coverRotate: props.coverRotate,
    progressBarColor: props.progressBarColor,
    indicatorColor: props.indicatorColor
  }
})

const player = ref()

const autoPlayTimerValue = ref<any>()

const startAutoPlayTimer = () => {
  clearInterval(autoPlayTimerValue.value)
  if (props.autoPlay && !isEmpty(props.src)) {
    autoPlayTimerValue.value = setInterval(() => {
      player.value.play()
    }, 1000)
  }
}

const stopAutoPlayTimer = () => {
  clearInterval(autoPlayTimerValue.value)
}

watch(
  () => props.src,
  () => {
    startAutoPlayTimer()
  },
  { immediate: true }
)

onUnmounted(() => {
  stopAutoPlayTimer()
})

const onLoadedmetadata = (e: any) => {
  emits('loadedmetadata', e)
}
const onPlaying = (e: any) => {
  emits('playing', e)
}
const onPlay = (e: any) => {
  stopAutoPlayTimer()
  emits('play', e)
}
const onPlayError = (e: any) => {
  emits('playError', e)
}
const onTimeupdate = (e: any) => {
  emits('timeupdate', e)
}
const onPause = (e: any) => {
  emits('pause', e)
}
const onEnded = (e: any) => {
  emits('ended', e)
}
const onProgressStart = (e: any) => {
  emits('progressStart', e)
}
const onProgressEnd = (e: any) => {
  emits('progressEnd', e)
}
const onProgressMove = (e: any) => {
  emits('progressMove', e)
}
const onProgressClick = (e: any) => {
  emits('progressClick', e)
}

const play = () => {
  player.value.play()
}

const pause = () => {
  player.value.pause()
}
const togglePlayer = () => {
  player.value.togglePlayer()
}

defineExpose({
  play,
  pause,
  togglePlayer
})
</script>
