<template>
  <div
    ref="iconRef"
    class="draggable-icon"
    :style="{ left: left + 'px', top: top + 'px'}"
    @mousedown="startDrag"
    @mouseup="endDrag"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @click="toggleMenu"
  >
    <img src="/favicon.png" alt="Menu Icon" class="icon-img">
  </div>
  <div
    ref="menuRef"
    :class="{ 'menu': true, 'menu-left': isMenuLeft, 'menu-open': isMenuOpen }"
    :style="{ top: menuTop + 'px', left: menuLeftPos + 'px' }"
    @mousedown="startDrag"
    @mouseup="endDrag"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div class="menu-caret menu-caret-left">
      <a @click="toggleAffix">
        <Icon icon="ant-design:pushpin-outlined" :class="[isAffix && 'pushpin-rotate']"/>
      </a>
      <a v-if="isScrollbar" @mousedown="startRepeating(-1)" @mouseup="stopRepeating">
        <Icon icon="ant-design:caret-left-filled"/>
      </a>
    </div>
    <div ref="menuItemContentRef" class="menu-item-content">
      <a
        v-for="item in menus"
        :key="item.key"
        :class="{ active: activeMenuItem?.key === item.key }"
        @click="selectMenuItem(item)"
        v-show="!item.hide"
        :href="`#/${item.key}`"
      >
        {{ item.label }}
      </a>
    </div>
    <div class="menu-caret menu-caret-right">
      <a v-if="isScrollbar" @mousedown="startRepeating(1)" @mouseup="stopRepeating">
        <Icon icon="ant-design:caret-right-filled"/>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, type PropType, watch } from 'vue'
import type { MenuItem } from './index.js'
import { useSessionCache } from '@/utils/CacheData'
import { Icon } from '@/components/icon'

const affixMenuCache = useSessionCache('affixMenu')

// 接收菜单列表属性
const props = defineProps({
  menuItems: {
    type: Array as PropType<MenuItem[]>,
    default: () => []
  },
  activeKey: String
})
const emits = defineEmits(['change'])

// 有效菜单
const menus = props.menuItems.filter(menu => !menu.hide)
// 当前激活的菜单项索引
const activeMenuItem = ref<MenuItem | undefined>(menus.find(item => item.key === props.activeKey))
watch(() => props.activeKey, (value) => {
  const menuItem = menus.find(item => item.key === value)
  if (menuItem) {
    selectMenuItem(menuItem)
  }
})

// 初始化图标和菜单的引用
const iconRef = ref()
const menuRef = ref()
// 图标位置
const left = ref(0)
const top = ref(10)
// 菜单位置
const menuLeftPos = ref(0)
const menuTop = ref(0)
// 拖拽起始位置
const startX = ref(0)
const startY = ref(0)
// 拖拽前的初始位置
const initialLeft = ref(0)
const initialTop = ref(0)
// 点击阈值，用于区分点击和拖拽
const clickThreshold = 5
// 吸附距离
const snapDistance = 10
// 吸附动画时长
const snapDuration = 800
// 鼠标松开后延迟吸附的时间
const delayBeforeSnap = 1000
// 吸附后隐藏一半的延迟时间
const hideDelay = 1000
// 定时器引用
let snapTimer: NodeJS.Timeout
let hideTimer: NodeJS.Timeout
// 拖拽状态
const isDragging = ref(false)
// 图标是否隐藏一半的状态
const isIconHidden = ref(false)
// 鼠标是否悬停在图标或菜单上的状态
const isMouseOver = ref(false)
// 是否钉住菜单
const loadAffix = () => {
  let affix = affixMenuCache.load() as boolean
  if (affix === undefined || affix === null) {
    affix = true
    affixMenuCache.cache(affix)
  }
  return affix
}
const isAffix = ref(loadAffix())
// 菜单是否打开的状态
const isMenuOpen = ref(isAffix.value)

// 切换是否固定菜单
const toggleAffix = () => {
  isAffix.value = !isAffix.value
  affixMenuCache.cache(isAffix.value)
}

// 选择菜单项的函数
const selectMenuItem = (item: MenuItem) => {
  activeMenuItem.value = item
  emits('change', item)
}

// 关闭菜单
const closeMenu = () => {
  if (isAffix.value) {
    return
  }
  isMenuOpen.value = false
}

// 计算菜单应从左侧还是右侧展开
const isMenuLeft = computed(() => {
  const iconRect = iconRef.value?.getBoundingClientRect()
  if (!iconRect) return false
  const screenWidth = window.innerWidth
  return iconRect.left < screenWidth / 2
})

// 开始拖拽事件处理函数
const startDrag = (e: MouseEvent) => {
  isDragging.value = true
  startX.value = e.clientX
  startY.value = e.clientY
  initialLeft.value = left.value
  initialTop.value = top.value
  // 清除定时器，避免不必要的延迟操作
  clearTimeout(snapTimer)
  clearTimeout(hideTimer)
  document.addEventListener('mousemove', drag)
  document.addEventListener('mouseup', endDrag)
  e.preventDefault()
}

// 拖拽过程中的事件处理函数
const drag = (e: MouseEvent) => {
  if (isDragging.value) {
    const dx = e.clientX - startX.value
    const dy = e.clientY - startY.value
    const distance = Math.sqrt(dx * dx + dy * dy)
    if (distance > clickThreshold) {
      // 超过阈值，认为是拖拽操作
    }
    left.value = initialLeft.value + dx
    top.value = initialTop.value + dy

    const { clientWidth, clientHeight } = document.documentElement
    const iconWidth = iconRef.value.offsetWidth
    const iconHeight = iconRef.value.offsetHeight

    let isOutOfBounds = false
    // 处理超出浏览器边缘的情况
    if (e.clientX < 0) {
      left.value = 0
      isOutOfBounds = true
    } else if (e.clientX > clientWidth) {
      left.value = clientWidth - iconWidth
      isOutOfBounds = true
    }

    if (e.clientY < 0) {
      top.value = 0
      isOutOfBounds = true
    } else if (e.clientY > clientHeight) {
      top.value = clientHeight - iconHeight
      isOutOfBounds = true
    }

    if (isOutOfBounds) {
      endDrag()
    }

    // 减少过渡时间，让移动更灵敏
    iconRef.value.style.transition = 'none'

    // 若菜单打开，更新菜单位置
    if (isMenuOpen.value) {
      updateMenuPosition()
    }
  }
}

// 结束拖拽事件处理函数
const endDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', drag)
  document.removeEventListener('mouseup', endDrag)
  const { clientWidth, clientHeight } = document.documentElement
  const iconWidth = iconRef.value.offsetWidth
  const iconHeight = iconRef.value.offsetHeight

  let shouldSnap = false
  // 检查是否需要吸附到边缘
  if (left.value < snapDistance) {
    shouldSnap = true
    left.value = 0
  } else if (left.value > clientWidth - iconWidth - snapDistance) {
    shouldSnap = true
    left.value = clientWidth - iconWidth
  }

  if (top.value < snapDistance) {
    shouldSnap = true
    top.value = 0
  } else if (top.value > clientHeight - iconHeight - snapDistance) {
    shouldSnap = true
    top.value = clientHeight - iconHeight
  }

  if (shouldSnap) {
    clearTimeout(snapTimer)
    snapTimer = setTimeout(() => {
      iconRef.value.style.transition = `left ${snapDuration}ms, top ${snapDuration}ms`
      // 当鼠标不在图标或菜单上时才关闭菜单
      if (!isMouseOver.value) {
        closeMenu()
      }
      if (!isDragging.value && !isMouseOver.value) {
        hideTimer = setTimeout(() => {
          hideHalfIcon()
        }, hideDelay)
      }
    }, delayBeforeSnap)
  } else {
    iconRef.value.style.transition = `left ${snapDuration}ms, top ${snapDuration}ms`
  }

  // 处理吸附超出边缘的情况
  if (left.value < 0) {
    left.value = 0
  } else if (left.value > clientWidth - iconWidth) {
    left.value = clientWidth - iconWidth
  }

  if (top.value < 0) {
    top.value = 0
  } else if (top.value > clientHeight - iconHeight) {
    top.value = clientHeight - iconHeight
  }
  // 避免图标拖出浏览器后菜单位置超出
  setTimeout(updateMenuPosition, 0)
}

// 更新菜单位置的函数
const updateMenuPosition = () => {
  const iconRect = iconRef.value.getBoundingClientRect()
  menuTop.value = iconRect.top
  if (isMenuLeft.value) {
    menuLeftPos.value = iconRect.right + 5
  } else {
    menuLeftPos.value = iconRect.left - menuRef.value.offsetWidth
  }
}

// 点击外部关闭菜单的函数
const closeMenuOnOutsideClick = (e: MouseEvent) => {
  if (
    isMenuOpen.value &&
    iconRef.value &&
    menuRef.value &&
    !iconRef.value.contains(e.target) &&
    !menuRef.value.contains(e.target)
  ) {
    closeMenu()
  }
}

// 鼠标移入显示完整图标的函数
const showFullIcon = () => {
  clearTimeout(hideTimer)
  isIconHidden.value = false
  const iconWidth = iconRef.value.offsetWidth
  const iconHeight = iconRef.value.offsetHeight
  const { clientWidth, clientHeight } = document.documentElement
  if (left.value < 0) {
    left.value = 0
  } else if (left.value > clientWidth - iconWidth) {
    left.value = clientWidth - iconWidth
  }
  if (top.value < 0) {
    top.value = 0
  } else if (top.value > clientHeight - iconHeight) {
    top.value = clientHeight - iconHeight
  }
  iconRef.value.style.transition = `left ${snapDuration}ms, top ${snapDuration}ms`
}

// 隐藏图标一半的函数
const hideHalfIcon = () => {
  if (isDragging.value || isAffix.value) return
  isIconHidden.value = true
  const iconWidth = iconRef.value.offsetWidth
  const iconHeight = iconRef.value.offsetHeight
  const { clientWidth, clientHeight } = document.documentElement
  if (left.value === 0) {
    left.value = -iconWidth / 2
  } else if (left.value === clientWidth - iconWidth) {
    left.value = clientWidth - iconWidth / 2
  }
  if (top.value === 0) {
    top.value = -iconHeight / 2
  } else if (top.value === clientHeight - iconHeight) {
    top.value = clientHeight - iconHeight / 2
  }
  iconRef.value.style.transition = `left ${snapDuration}ms, top ${snapDuration}ms`
  // 当图标隐藏时关闭菜单
  closeMenu()
}

// 鼠标移入图标或菜单时的处理函数
const handleMouseEnter = () => {
  isMouseOver.value = true
  clearTimeout(hideTimer)
  showFullIcon()
}

// 鼠标移出图标或菜单时的处理函数
const handleMouseLeave = () => {
  isMouseOver.value = false
  if (!isDragging.value) {
    hideTimer = setTimeout(() => {
      hideHalfIcon()
    }, hideDelay)
  }
}

// 切换菜单显示状态的函数
const toggleMenu = (e: MouseEvent) => {
  if (!isDragging.value) {
    const dx = e.clientX - startX.value
    const dy = e.clientY - startY.value
    const distance = Math.sqrt(dx * dx + dy * dy)
    if (distance <= clickThreshold) {
      isMenuOpen.value = !isMenuOpen.value
      if (isMenuOpen.value) {
        updateMenuPosition()
      }
    }
  }
}

// 菜单滚动
const scrollNum = 10
const menuItemContentRef = ref<HTMLDivElement | null>()
const isScrollbar = ref(false)
const handleResizeScrollbar = () => {
  if (menuItemContentRef.value) {
    isScrollbar.value = menuItemContentRef.value.scrollWidth > menuItemContentRef.value.clientWidth
  } else {
    isScrollbar.value = false
  }
}
const scrollTo = (num: number) => {
  if (menuItemContentRef.value) {
    menuItemContentRef.value.scrollTo({left: menuItemContentRef.value.scrollLeft + num * scrollNum})
  }
}
let repeatingTimer: NodeJS.Timeout
const startRepeating = (num: number) => {
  repeatingTimer = setInterval(() => {
    scrollTo(num)
  }, 10)
}
const stopRepeating = () => {
  clearInterval(repeatingTimer)
}


onMounted(() => {
  updateMenuPosition()
  handleMouseLeave()
  handleResizeScrollbar()
  document.addEventListener('click', closeMenuOnOutsideClick)
  window.addEventListener('resize', handleResizeScrollbar)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousemove', drag)
  document.removeEventListener('mouseup', endDrag)
  document.removeEventListener('click', closeMenuOnOutsideClick)
  window.removeEventListener('resize', handleResizeScrollbar)
  clearTimeout(snapTimer)
  clearTimeout(hideTimer)
  clearInterval(repeatingTimer)
})
</script>

<style scoped lang="scss">
$icon-size: 35px;
$button-size: 25px;
$ZIndex: 999;
$menu-bg: #f4f4f4;

.draggable-icon {
  position: fixed;
  width: $icon-size;
  height: $icon-size;
  background-color: $menu-bg;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.24);
  border-radius: 50%;
  z-index: $ZIndex;
}

.icon-img {
  height: 60%;
  object-fit: cover; /* 确保图标填满容器 */
}

.menu {
  display: inline-flex;
  position: fixed;
  max-width: 70vw;
  background-color: $menu-bg;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  gap: 0; /* 去除间隙 */
  transition: transform 500ms ease;
  transform: scaleX(0);
  transform-origin: left;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.24);
  z-index: $ZIndex;

  .menu-item-content {
    display: inline-flex;
    overflow: hidden;
    overflow-x: auto;
    padding-bottom: 1px;

    /* 滚动条整体容器 */
    &::-webkit-scrollbar {
      width: 3px;
      height: 3px;
    }

    /* 滚动条轨道（背景区域） */
    &::-webkit-scrollbar-track {
      background: #f0f0f0;
      border-radius: 3px; /* 轨道圆角 */
    }

    /* 滚动条滑块 */
    &::-webkit-scrollbar-thumb {
      background: rgb(182, 182, 182);
      border-radius: 3px; /* 滑块圆角 */
      transition: background 0.3s ease; /* 鼠标悬停时的过渡动画 */
    }

    /* 鼠标悬停在滑块上时的样式 */
    &::-webkit-scrollbar-thumb:hover {
      background: #4096ff;
      cursor: pointer;
    }

  }

  &:not(.menu-left) {
    right: 30px;
    transform-origin: right;
  }

  a {
    display: inline-flex;
    background-color: transparent;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s;
    height: $button-size; /* 让按钮高度固定 */
    padding: 0 11px;
    align-items: center;
    border-radius: 3px;
    font-size: 14px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
    text-decoration: none;
    white-space: nowrap;
    color: #000;

    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    &.active {
      background-color: #ffffff;
      color: rgb(22, 119, 255);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.24);
    }
  }
}

.menu-left {
  left: 30px;
}

.menu-open {
  transform: scaleX(1);
}

.pushpin-rotate {
  transform: rotate(-45deg);
}

.menu-caret {
  position: sticky;
  white-space: nowrap;
  background-color: $menu-bg;
  display: flex;
  gap: 10px;
  & a {
    border: none;
    padding: 0;
  }
}
.menu-caret-left {
  left: 0;
  padding-right: 10px;
}
.menu-caret-right {
  right: 0;
  padding-left: 10px;
}
</style>