<script setup lang="ts">
import { ref, unref } from 'vue'
import { menus } from '@/router/menu'
import { useSessionCache } from '@/utils/CacheData'

const sessionCache = useSessionCache('activeKey')

const activeKey = ref(sessionCache.load() as string || unref(menus[0].value))
const menuBoxStyle = ref({})

function handleChange(val: string) {
  const menu = menus.filter(menu => menu.value === val)[0]
  activeKey.value = val
  sessionCache.cache(val)
  // 是否需要刷新页面，为了解决affix失效问题
  if (menu.reloadOnActive) {
    window.location.reload()
  }
}

function affixChange(val?: boolean) {
  menuBoxStyle.value = val ? {
    padding: '6px',
    margin: '12px 0',
    border: '1px solid #d9d9d9',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)'
  } : {
    padding: '0px',
    margin: '0px',
    border: '0px'
  }
}
</script>

<template>
  <div class="main">
    <a-tabs v-model:activeKey="activeKey">
      <template #renderTabBar>
        <a-affix @change="affixChange">
          <div class="menu-box" :style="menuBoxStyle">
            <a-segmented v-model:value="activeKey" :options="menus" @change="handleChange">
              <template #label="{ value, disabled }">
                <span :style="{color: value===activeKey?'#1677ff': disabled ? 'rgba(0, 0, 0, 0.25)': '#000'}">
                  {{ value }}
                </span>
              </template>
            </a-segmented>
          </div>
        </a-affix>
      </template>

      <a-tab-pane v-for="menu in menus" :key="menu.value">
        <div class="content">
          <component :is="menu.component" />
        </div>
      </a-tab-pane>

    </a-tabs>
    <div class="footer">
      <p>CopyRight © 2024 引导页 All Rights Reserved. 黔ICP备2023015771号-1</p>
      <p>PowerBy cxxwl96@sina.com</p>
    </div>
    <a-back-top />
  </div>
</template>

<style scoped>
.main {
  padding: 12px;
}

.content {
  margin-top: 20px;
  min-height: calc(100vh - 154px);
}

.menu-box {
  display: inline-flex;
  border-radius: 6px;
}

.footer {
  margin-top: 24px;
  text-align: center;
  color: rgb(157 157 157 / 40%);
  font-size: 0.8rem;
}

.ant-segmented-item-selected {
  color: #1677ff;
}
</style>
