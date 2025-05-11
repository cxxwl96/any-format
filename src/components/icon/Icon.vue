<template>
  <span
    ref="iconRef"
    :class="[$attrs.class, 'app-iconify anticon', spin && 'app-iconify-spin']"
    :style="getIconStyle"
  />
</template>

<script setup lang="ts">
import { computed, type CSSProperties, onMounted, type PropType, ref, unref } from 'vue'
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
  // icon spin
  spin: { type: Boolean, default: false },
})

const iconRef = ref()
const getIconStyle = computed((): CSSProperties => {
  const { size, color } = props
  let fs = size
  if (isString(size)) {
    fs = parseInt(size, 10)
  }
  return {
    fontSize: `${fs}px`,
    color: color,
    display: 'inline-flex'
  }
})
const getIcon = computed(() => `${props.prefix ? props.prefix + ':' : ''}${props.icon}`)

onMounted(() => {
  const el = unref(iconRef)
  if (!el) return

  const icon = unref(getIcon)
  if (!icon) return

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
})
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

.app-iconify-spin {
  animation: loadingCircle 1s infinite linear;
}

span.iconify {
  display: block;
  min-width: 1em;
  min-height: 1em;
  background-color: #5551;
  border-radius: 100%;
}
</style>
