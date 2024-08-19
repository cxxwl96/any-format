<script setup lang="ts">
import { SettingOutlined } from '@ant-design/icons-vue'
import { onMounted, ref, toRaw, unref } from 'vue'
import useFormat from '@/utils/Format'
import { CodeMirror } from '@/components/CodeEditor'
import { getTextFromClipboard } from '@/utils/useCopyToClipboard'
import LogFormatSetting from '@/views/log/LogFormatSetting.vue'

const settingRef = ref()
const showSetting = ref<boolean>()
const data = ref<string>('')
// load cache
onMounted(() => data.value = sessionStorage.getItem('LogFormatData') || '')
// data cache
const cacheData = (value: string | undefined) => {
  if (value != undefined) {
    sessionStorage.setItem('LogFormatData', value)
  }
}


// 双击格式化
function dblclick(value: string) {
  const format = useFormat({ ...toRaw(settingRef.value.getConfig()) }).anyFormat(unref(value))
  if (format != value) {
    data.value = ''
    setTimeout(() => {
      data.value = format
    }, 1)
  }
}
</script>

<template>
  <div>
    <div class="tip-font">
      Tip：<a @click="async () => {data = await getTextFromClipboard()}">粘贴文本</a>，双击格式化
    </div>
    <CodeMirror @dblclick="dblclick" v-model="data" @change="cacheData" :lineWrapping="true" />
    <a-float-button :style="{bottom: '100px'}" @click="()=>{showSetting=true}">
      <template #icon>
        <SettingOutlined />
      </template>
    </a-float-button>
    <LogFormatSetting ref="settingRef" v-model:show="showSetting" />
  </div>
</template>

<style scoped></style>