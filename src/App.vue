<script setup lang="ts">
import { onMounted, ref, shallowRef } from 'vue'
import { menus } from '@/router/menu'
import { useLocal, useSessionCache } from '@/utils/CacheData'
import DragableMenu from '@/components/DragableMenu/DragableMenu.vue'
import type { MenuItem } from '@/components/DragableMenu'
import PackageJson from '../package.json'
import NotFound from '@/components/pages/NotFound.vue'
import { getEnv } from '@/data/env'

const activeMenu = ref<MenuItem>(menus[0])
const componentRef = ref()

/**
 * 更新激活菜单
 */
const updateActiveMenu = () => {
  const currentPath = window.location.hash?.slice(2) || menus[0].key
  activeMenu.value = menus.find(menu => menu.key.toLowerCase() === currentPath.toLowerCase()) || {
    label: 'NotFound',
    key: 'NotFound',
    component: shallowRef(NotFound)
  }
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
    componentRef.value.init?.()
  }
}
document.addEventListener('visibilitychange', handleVisibilitychange)

onMounted(() => {
  // 系统更新
  const localCache = useLocal('app', 'version')
  if (localCache.load() !== PackageJson.version) {
    useSessionCache('').clear()
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
    <component ref="componentRef" :is="activeMenu.component" />
  </div>
  <div class="footer" v-if="!activeMenu.hideFooter">
    <p>CopyRight © 2023 - {{ new Date().getFullYear() }} By cxxwl96 All Rights Reserved. 黔ICP备2023015771号-1</p>
    <p>PowerBy cxxwl96@sina.com</p>
  </div>
  <a-back-top />
</template>

<style scoped></style>
