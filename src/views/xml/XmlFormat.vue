<script setup lang="ts">
import { CodeMirror, MODE } from '@/components/CodeEditor'
import { ref, unref } from 'vue'
import vkbeautify from 'vkbeautify'

const data = ref<string>(sessionStorage.getItem('XmlFormatData') as string || '')

function handleChange(value: string) {
  data.value = value
  sessionStorage.setItem('XmlFormatData', value)
}

// 格式化
function handleFormat() {
  data.value = vkbeautify.xml(unref(data.value))
}

// 压缩
function compress() {
  data.value = vkbeautify.xmlmin(unref(data.value))
}
</script>

<template>
  <div>
    <div style="font-size: 14px; color: #00000059; margin: 10px">Tip：粘贴文本，双击格式化</div>
    <CodeMirror ref="el" v-model="data" @change="handleChange" @dblclick="handleFormat" :mode="MODE.XML"
                :theme="'eclipse'" />
    <a-divider />
    <a-affix :offset-bottom="30">
      <div class="bottom-button-group">
        <a-space :size="[8, 16]" wrap>
          <a-button type="primary" @click="handleFormat">格式化</a-button>
          <a-button @click="compress">压缩</a-button>
        </a-space>
      </div>
    </a-affix>
  </div>
</template>

<style scoped>
</style>