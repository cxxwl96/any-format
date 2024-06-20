<script setup lang="ts">
import { defineAsyncComponent, h, ref, unref, watch } from 'vue'
import { menus } from '@/router/menu'

const activeKey = ref(sessionStorage.getItem('activeKey') as string || unref(menus[0].value))
const menuBoxStyle = ref({})

function handleChange(val: string) {
  activeKey.value = val
  sessionStorage.setItem('activeKey', activeKey.value)
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
            <a-segmented v-model:value="activeKey" :options="menus" @change="handleChange" />
          </div>
        </a-affix>
      </template>

      <a-tab-pane v-for="menu in menus" :key="menu.value">
        <div class="content">
          <div style="font-size: 14px; color: #00000059; margin: 10px">Tip：粘贴文本，双击格式化</div>
          <component :is="defineAsyncComponent(() => import(/* @vite-ignore */menu.component))" />
        </div>
      </a-tab-pane>

    </a-tabs>
    <div class="footer">
      CopyRight © 2023 引导页 All Rights Reserved. 黔ICP备2023015771号-1
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
  min-height: calc(100vh - 100px);
}

.menu-box {
  display: inline-flex;
  border-radius: 6px;
}

.footer {
  text-align: center;
  color: rgb(157 157 157 / 40%);
  font-size: 0.8rem;
}
</style>
