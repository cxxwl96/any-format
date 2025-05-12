<template>
  <span
    ref="iconRef"
    :class="[
      $attrs.class,
      'app-iconify anticon',
      spin && 'app-iconify-spin',
      cursorPointer && 'cursor-pointer',
    ]"
    :style="getIconStyle"
  />
</template>

<script setup lang="ts">
import { computed, type CSSProperties, onMounted, type PropType, ref, unref, watchEffect } from 'vue'
import { isString } from '@/utils/is'
import Iconify from '@purge-icons/generated'

const props = defineProps({
  // icon prefix
  prefix: { type: String, default: '' },
  // icon name
  icon: { type: String, required: true },
  // icon size
  size: { type: [String, Number] as PropType<string | number>, default: 16 },
  // icon color
  color: String,
  // icon border
  border: { type: Boolean, default: false },
  // icon size
  space: { type: [String, Number] as PropType<string | number>, default: 0 },
  // icon cursor
  cursorPointer: { type: Boolean, default: false },
  // icon spin
  spin: { type: Boolean, default: false },
})

const iconRef = ref()
const getIconStyle = computed((): CSSProperties => {
  const { size, color, border, space, } = props
  let fs = size
  if (isString(size)) {
    fs = parseInt(size, 10)
  }
  let s = space
  if (isString(size)) {
    s = parseInt(space as string, 10)
  }
  return {
    fontSize: `${fs}px`,
    color: color,
    display: 'inline-flex',
    padding: `${s}px`,
    border: border ? '1px solid #ddd' : 'none',
    borderRadius: border ? '4px' : 0,
  }
})
const getIcon = computed(() => `${props.prefix ? props.prefix + ':' : ''}${props.icon}`)

const updateIcon = () => {
  const el = unref(iconRef)
  if (!el) {
    return
  }

  const icon = unref(getIcon)

  const svg = Iconify.renderSVG(icon, {})
  if (svg) {
    el.textContent = ''
    el.appendChild(svg)
  } else {
    const span = document.createElement('span')
    span.className = 'iconify'
    span.dataset.icon = icon
    el.textContent = ''
    el.appendChild(span)
  }
}
watchEffect(() => updateIcon())
onMounted(() => updateIcon())
</script>

<style scoped lang="scss">
@keyframes loadingCircle {
  100% {
    transform: rotate(360deg);
  }
}

.app-iconify {
  display: inline-block;
}

.app-iconify > :first-child {
  min-width: 1em;
  min-height: 1em;
  background-color: #5551;
  border-radius: 100%;
}

.app-iconify-spin {
  animation: loadingCircle 1s infinite linear;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
