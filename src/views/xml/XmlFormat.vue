<script setup lang="ts">
import { CodeMirror, MODE } from '@/components/CodeEditor'
import { ref, unref } from 'vue'
import vkbeautify from 'vkbeautify'

const data = ref<string>(sessionStorage.getItem('XmlFormatData') as string || '')

function handleChange(value: string) {
  data.value = value
  sessionStorage.setItem('XmlFormatData', value)
}

function formatValidate() {
  data.value = vkbeautify.xml(unref(data.value))
}
</script>

<template>
  <div>
    <div style="font-size: 14px; color: #00000059; margin: 10px">Tip：粘贴文本，双击格式化</div>
    <CodeMirror ref="el" v-model:value="data" @change="handleChange" @dblclick="formatValidate" :mode="MODE.XML" :theme="'base16-light'" />
  </div>
</template>

<style scoped>

</style>