<script setup lang="ts">
import { ref, unref } from 'vue'
import { menus } from '@/router/menu'
import { useSessionCache } from '@/utils/CacheData'
import DragableMenu from '@/components/DragableMenu/DragableMenu.vue'
import type { MenuItem } from '@/components/DragableMenu'

const sessionCache = useSessionCache('activeKey')

const activeMenu = ref(menus.filter(menu=>menu.key===(sessionCache.load() as string)).pop() || unref(menus[0]))

function handleChange(menu: MenuItem) {
  if (menu.key === activeMenu.value?.key) {
    return
  }
  activeMenu.value = menu
  sessionCache.cache(menu.key)
}
</script>

<template>
  <DragableMenu :menuItems="menus" :activeKey="activeMenu.key" @change="handleChange" />
  <component :is="activeMenu.component" />
  <div class="footer">
    <p>CopyRight © 2024 引导页 All Rights Reserved. 黔ICP备2023015771号-1</p>
    <p>PowerBy cxxwl96@sina.com</p>
  </div>
  <a-back-top />
</template>

<style scoped>
.footer {
  margin-top: 24px;
  text-align: center;
  color: rgb(157 157 157 / 40%);
  font-size: 0.8rem;
}

</style>
