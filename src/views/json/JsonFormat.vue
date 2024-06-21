<script setup lang="ts">
import { CodeMirror } from '@/components/CodeEditor'
import { type Ref, ref, unref } from 'vue'
import { validateJson } from '@/utils/jsonUtil'
import { message, notification } from 'ant-design-vue'
import { isArray, isJsonString, isObject } from '@/utils/is'

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
    result.value = { value: '', error: false, message: '' }
    return ''
  }
  result.value = { ...validateJson(value) }
  if (result.value.error) {
    notification['error']({
      message: 'JSON格式错误',
      description: result.value.message,
      placement: 'topRight'
    })
  } else {
    // message.success('正确的JSON')
    notification['success']({
      message: '正确的JSON',
      description: 'OK',
      placement: 'topRight'
    })
  }
  if (!result.value.error && value !== result.value.value) {
    el.value.setValue(result.value.value)
  }
  return unref(result.value.value)
}

function compress() {
  const value = formatValidate()
  if (value) {
    el.value.setValue(JSON.stringify(JSON.parse(value)))
  }
}

function deepJson(json: Ref<any>, suffix: boolean) {
  if (isArray(json.value)) {
    for (const obj of json.value) {
      deepJson(ref(obj), suffix)
    }
  } else if (isObject(json.value)) {
    for (let key in json.value) {
      const value = json.value[key]
      if (isJsonString(value)) {
        delete json.value[key]
        key = suffix ? key + ' [@String]' : key
        json.value[key] = JSON.parse(value)
        deepJson(ref(json.value[key]), suffix)
      } else {
        deepJson(ref(value), suffix)
      }
    }
  }
}

function deepDelEscape(suffix: boolean) {
  const value = formatValidate()
  if (value) {
    const json = ref(JSON.parse(value))
    deepJson(json, suffix)
    el.value.setValue(JSON.stringify(json.value))
    formatValidate()
  }
}

function delEscape() {
  message.info('开发中')
}

function escape() {
  message.info('开发中')
}
</script>

<template>
  <CodeMirror class="editor" ref="el" v-model:value="result.value" @change="handleChange" @dblclick="formatValidate"
              lineWrapping />
  <div class="button-group">
    <a-space :size="[8, 16]" wrap>
      <a-button type="primary" @click="formatValidate">格式化校验</a-button>
      <a-button @click="compress">压缩</a-button>
      <a-dropdown-button @click="deepDelEscape(true)">
        深度去除转义
        <template #overlay>
          <a-button @click="deepDelEscape(false)"> 不加 [@String] </a-button>
        </template>
      </a-dropdown-button>
      <a-button @click="delEscape">去除转义</a-button>
      <a-button @click="escape">转义</a-button>
    </a-space>
  </div>
</template>

<style scoped>
.editor {
  padding: 10px 0;
}

.button-group {
  position: fixed;
  right: 100px;
  bottom: 50px;
  padding: 8px 8px 13px 8px;
  border-radius: 6px;
  border: 1px solid #d9d9d9;
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}
</style>