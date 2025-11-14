<template>
  <videoPlay
    :width="width"
    :height="height"
    :color="color"
    :src="src"
    :title="title"
    :type="type"
    :poster="poster"
    :webFullScreen="webFullScreen"
    :speed="speed"
    :currentTime="currentTime"
    :playsinline="playsinline"
    :muted="muted"
    :speedRate="speedRate"
    :autoPlay="autoPlay"
    :loop="loop"
    :mirror="mirror"
    :ligthOff="ligthOff"
    :volume="volume"
    :control="control"
    :controlBtns="controlBtns"
    :preload="preload"
    @mirror-change="onMirrorChange"
    @loop-change="onLoopChange"
    @light-off-change="onLightOffChange"
    @loadstart="onLoadstart"
    @progress="onProgress"
    @error="onError"
    @stalled="onStalled"
    @play="onPlay"
    @pause="onPause"
    @loadedmetadata="onLoadedmetadata"
    @loadeddata="onLoadeddata"
    @waiting="onWaiting"
    @playing="onPlaying"
    @canplay="onCanplay"
    @canplaythrough="onCanplaythrough"
    @timeupdate="onTimeupdate"
    @ended="onEnded"
    @ratechange="onRatechange"
    @durationchange="onDurationchange"
    @volumechange="onVolumechange"
  />
</template>

<script setup lang="ts">
import 'vue3-video-play/dist/style.css'
import { videoPlay } from 'vue3-video-play/dist/index.mjs'

export interface VideoProps {
  src: string
  width?: string
  height?: string
  color?: string
  title?: string
  type?: string
  poster?: string
  webFullScreen?: boolean
  speed?: boolean
  currentTime?: number
  playsinline?: boolean
  muted?: boolean
  speedRate?: string[]
  autoPlay?: boolean
  loop?: boolean
  mirror?: boolean
  ligthOff?: boolean
  volume?: number
  control?: boolean
  controlBtns?: string[]
  preload?: string
}

export type VideoEmits = {
  mirrorChange: [e: any]
  loopChange: [e: any]
  lightOffChange: [e: any]
  loadstart: [e: any]
  progress: [e: any]
  error: [e: any]
  stalled: [e: any]
  play: [e: any]
  pause: [e: any]
  loadedmetadata: [e: any]
  loadeddata: [e: any]
  waiting: [e: any]
  playing: [e: any]
  canplay: [e: any]
  canplaythrough: [e: any]
  timeupdate: [e: any]
  ended: [e: any]
  ratechange: [e: any]
  durationchange: [e: any]
  volumechange: [e: any]
}

withDefaults(defineProps<VideoProps>(), {
  width: '100%',
  height: 'auto',
  color: '#409eff',
  type: 'video/mp4',
  webFullScreen: false,
  speed: true,
  currentTime: 0,
  playsinline: false,
  muted: false,
  speedRate: () => ['0.75', '1.0', '1.25', '1.5', '2.0'],
  autoPlay: false,
  loop: false,
  mirror: false,
  ligthOff: false,
  volume: 1,
  control: true,
  controlBtns: () => [
    'audioTrack',
    'quality',
    'speedRate',
    'volume',
    'setting',
    'pip',
    'pageFullScreen',
    'fullScreen'
  ],
  preload: 'auto'
})

const emits = defineEmits<VideoEmits>()

const onMirrorChange = (e: any) => {
  emits('mirrorChange', e)
}
const onLoopChange = (e: any) => {
  emits('loopChange', e)
}
const onLightOffChange = (e: any) => {
  emits('lightOffChange', e)
}
const onLoadstart = (e: any) => {
  emits('loadstart', e)
}
const onProgress = (e: any) => {
  emits('progress', e)
}
const onError = (e: any) => {
  emits('error', e)
}
const onStalled = (e: any) => {
  emits('stalled', e)
}
const onPlay = (e: any) => {
  emits('play', e)
}
const onPause = (e: any) => {
  emits('pause', e)
}
const onLoadedmetadata = (e: any) => {
  emits('loadedmetadata', e)
}
const onLoadeddata = (e: any) => {
  emits('loadeddata', e)
}
const onWaiting = (e: any) => {
  emits('waiting', e)
}
const onPlaying = (e: any) => {
  emits('playing', e)
}
const onCanplay = (e: any) => {
  emits('canplay', e)
}
const onCanplaythrough = (e: any) => {
  emits('canplaythrough', e)
}
const onTimeupdate = (e: any) => {
  emits('timeupdate', e)
}
const onEnded = (e: any) => {
  emits('ended', e)
}
const onRatechange = (e: any) => {
  emits('ratechange', e)
}
const onDurationchange = (e: any) => {
  emits('durationchange', e)
}
const onVolumechange = (e: any) => {
  emits('volumechange', e)
}
</script>
