<script setup lang="ts">
import { type Component, defineAsyncComponent, onMounted, ref } from 'vue'
import { menus } from '@/router/menu'
import { useLocal, useLocalCache, useSessionCache } from '@/utils/CacheData'
import DragableMenu from '@/components/DragableMenu/DragableMenu.vue'
import type { MenuItem } from '@/components/DragableMenu'
import PackageJson from '../package.json'
import { getEnv } from '@/data/env'

const activeMenu = ref<MenuItem>(menus[0])
let activeComponent: Component
const componentRef = ref()
const spinning = ref(false)

/**
 * 更新激活菜单
 */
const updateActiveMenu = () => {
  spinning.value = true
  const currentPath = window.location.hash?.slice(2) || menus[0].key
  activeMenu.value = menus.find(menu => menu.key.toLowerCase() === currentPath.toLowerCase()) || {
    label: 'NotFound',
    key: 'NotFound',
    component: () => import('@/components/pages/NotFound.vue')
  }
  activeComponent = defineAsyncComponent(() => {
    return activeMenu.value.component().catch(() => {
      return { template: '<div>加载组件失败</div>' }
    }).finally(() => spinning.value = false)
  })
  // 设置标题
  document.title = `${activeMenu.value.label} - ${getEnv('VITE_APP_NAME')}`
}
window.addEventListener('hashchange', () => updateActiveMenu())
updateActiveMenu()

/**
 * 标签被激活时执行组件初始化方法
 */
const handleVisibilitychange = async () => {
  if (document.visibilityState === 'visible') {
    componentRef.value?.init?.()
  }
}
document.addEventListener('visibilitychange', handleVisibilitychange)

onMounted(() => {
  // 系统更新
  const localCache = useLocal('app', 'version')
  if (localCache.load() !== PackageJson.version) {
    useSessionCache('').clear()
    useLocalCache('').clear()
    localCache.cache(PackageJson.version)
    window.location.reload()
  }
})
</script>

<template>
  <div class="header" v-if="!activeMenu.hideHeader">
    <div class="glitch text-3D neon" style="text-align: right">
      {{ activeMenu.label }}
    </div>
    <div class="bottom-border-line" />
  </div>
  <DragableMenu :menuItems="menus" :activeKey="activeMenu.key" />
  <div :class="{ content: true, 'content-padding': !activeMenu.fullContent }">
    <a-spin :spinning="spinning">
      <component ref="componentRef" :is="activeComponent" />
    </a-spin>
  </div>
  <div class="footer" v-if="!activeMenu.hideFooter">
    <p>CopyRight &copy; 2023 - {{ new Date().getFullYear() }} By cxxwl96 All Rights Reserved. 黔ICP备2023015771号</p>
    <p>PowerBy cxxwl96@sina.com</p>
  </div>
  <a-back-top />
</template>

<style scoped></style>
