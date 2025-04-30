<script setup lang="ts">
import { onMounted, ref, unref } from 'vue'
import { menus } from '@/router/menu'
import { useLocal, useSessionCache } from '@/utils/CacheData'
import DragableMenu from '@/components/DragableMenu/DragableMenu.vue'
import type { MenuItem } from '@/components/DragableMenu'
import PackageJson from '../package.json'

const sessionCache = useSessionCache('activeKey')

const activeMenu = ref(menus.filter(menu=>menu.key===(sessionCache.load() as string)).pop() || unref(menus[0]))

function handleChange(menu: MenuItem) {
  if (menu.key === activeMenu.value?.key) {
    return
  }
  activeMenu.value = menu
  sessionCache.cache(menu.key)
}

onMounted(() => {
  const localCache = useLocal('app', 'version')
  if (localCache.load() !== PackageJson.version) {
    sessionCache.clear()
    localCache.cache(PackageJson.version)
    window.location.reload()
  }
})
</script>

<template>
  <div class="header" v-if="!activeMenu.hideHeader">
    <div class="glitch text-3D neon">
      {{activeMenu.label}}
    </div>
    <div class="bottom-border-line"/>
  </div>
  <DragableMenu :menuItems="menus" :activeKey="activeMenu.key" @change="handleChange" />
  <div :class="{content: true, 'content-padding': !activeMenu.fullContent}">
    <component :is="activeMenu.component" />
  </div>
  <div class="footer" v-if="!activeMenu.hideFooter">
    <p>CopyRight © 2023 - {{new Date().getFullYear()}} By cxxwl96 All Rights Reserved. 黔ICP备2023015771号-1</p>
    <p>PowerBy cxxwl96@sina.com</p>
  </div>
  <a-back-top />
</template>

<style scoped></style>
