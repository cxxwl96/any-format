<script setup lang="ts">
import { CodeMirror } from '@/components/CodeEditor'
import { ref } from 'vue'
import { validateJson } from '@/utils/jsonUtil'
import { message } from 'ant-design-vue'

const el = ref()
const result = ref<{
  value: string;
  error: boolean;
  message: string;
}>({ value: sessionStorage.getItem('JsonFormatData') as string || '', error: false, message: '' })

function handleChange(value: string) {
  sessionStorage.setItem('JsonFormatData', value)
}

function formatValidate() {
  const value = el.value.getValue()
  if (!value || value === '') {
    message.info('请输入内容')
    result.value.value = ''
    result.value.error = false
    result.value.message = ''
    return
  }
  result.value = { ...validateJson(value) }
  if (!result.value.error && value !== result.value.value) {
    el.value.setValue(result.value.value)
  }
}

function compress() {
  formatValidate()
  if (result.value.value) {
    el.value.setValue(JSON.stringify(JSON.parse(result.value.value)))
  }
}

function delEscape() {
  // TODO
  message.info('开发中')
}
</script>

<template>
  <CodeMirror class="editor" ref="el" v-model:value="result.value" @change="handleChange" @dblclick="formatValidate"
              lineWrapping />
  <a-space :size="[8, 16]" wrap style="margin: 20px 0">
    <a-button type="primary" @click="formatValidate">格式化校验</a-button>
    <a-button @click="compress">压缩</a-button>
    <a-button @click="delEscape">去除转义</a-button>
  </a-space>
  <a-alert
    :message="result.error?'JSON格式错误':'正确的JSON'"
    :description="result.message"
    :type="result.error?'error': 'success'"
    v-if="result.message"
  />
</template>

<style scoped>
.editor {
  height: 60vh !important;
  max-height: 60vh !important;
  overflow: scroll;
  border: 1px solid #DDDDDD;
  padding: 10px 0;
}
</style>