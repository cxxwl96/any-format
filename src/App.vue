<script setup lang="ts">
import { reactive, type Ref, ref, toRaw, unref } from 'vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { menus } from '@/router/menu'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()


const options: {
  payload: { path: string };
  value: string | symbol | undefined
}[] = menus.filter(menu => menu.name).map(menu => {
  return {
    value: menu.name,
    payload: {
      path: menu.path
    }
  }
})

const value = ref(options.filter(op => op.payload.path === window.location.pathname).map(op => op.value)[0] || options[0].value)

const menuBoxStyle = ref({})

function affixChange(val?: boolean) {
  menuBoxStyle.value = val ? {
    padding: '12px',
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
    <a-affix @change="affixChange">
      <div class="menu-box" :style="menuBoxStyle">
        <a-segmented v-model:value="value" :options="options"
                     @change="(val: string)=>{
                       $router.push(options.filter(op=>op.value===val)[0].payload.path)
                     }" />
      </div>
    </a-affix>
    <div class="content">
      <RouterView />
    </div>
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
  border-radius: 6px;
}

.footer {
  text-align: center;
  color: rgb(157 157 157 / 40%);
  font-size: 0.8rem;
}
</style>
