<script setup lang="ts">
import { CodeMirror, JsonEditor } from '@/components/CodeEditor'
import { type Ref, ref, unref } from 'vue'
import { validateJson } from '@/utils/jsonUtil'
import { message, notification } from 'ant-design-vue'
import { SwapOutlined } from '@ant-design/icons-vue'
import { isArray, isJsonString, isObject } from '@/utils/is'
import { getTextFromClipboard } from '@/utils/useCopyToClipboard'
import { useCacheData } from '@/utils/CacheData'

const cacheData = useCacheData('JsonFormat')

const el = ref()
const result = ref<{
  value: string;
  error: boolean;
  message: string;
}>({ value: cacheData.load(), error: false, message: '' })

// 格式化校验
function formatValidate(tip: boolean = true) {
  const value = el.value.getValue()
  if (!value || value === '') {
    if (tip) {
      message.info('请输入内容')
    }
    result.value = { value: '', error: false, message: '' }
    return ''
  }
  result.value = { ...validateJson(value) }
  if (tip) {
    if (result.value.error) {
      notification['error']({
        message: 'JSON格式错误',
        description: result.value.message,
        placement: 'topRight'
      })
    } else {
      notification['success']({
        message: '正确的JSON',
        description: 'OK',
        placement: 'topRight'
      })
    }
  }
  if (!result.value.error && value !== result.value.value) {
    el.value.setValue(result.value.value)
  }
  return unref(result.value.value)
}

// 压缩
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
    const suffixStr = ' [@String]'
    for (let key in json.value) {
      const value = json.value[key]
      if (isJsonString(value)) {
        delete json.value[key]
        key = suffix ? key + suffixStr : key
        json.value[key] = JSON.parse(value)
        deepJson(ref(json.value[key]), suffix)
      } else {
        if (!suffix && key.endsWith(suffixStr)) {
          deepJson(ref(value), suffix)
          delete json.value[key]
          json.value[key.substring(0, key.length - suffixStr.length)] = value
        } else {
          deepJson(ref(value), suffix)
        }
      }
    }
  }
}

// 深度去除转义
function deepDelEscape(suffix: boolean) {
  const value = formatValidate()
  if (value) {
    const json = ref(JSON.parse(value))
    deepJson(json, suffix)
    el.value.setValue(JSON.stringify(json.value))
    formatValidate(false)
  }
}

// 去除转义
function delEscape() {
  const value = el.value.getValue() || ''
  el.value.setValue(value.replace(/\\"/g, '"'))
}

// 转义
function escape() {
  const value = el.value.getValue() || ''
  el.value.setValue(value.replace(/"/g, '\\"'))
}

// 字段排序
function deepFieldSort(json: any, asc: boolean): any {
  if (isArray(json)) {
    // set types: 'string' | 'number' | 'bigint' | 'boolean' | 'symbol' | 'undefined' | 'object' | 'function'
    const set = new Set(json.map(item => typeof item))
    if (set.size > 1 || set.has('symbol') || set.has('undefined') || set.has('object') || set.has('function')) {
      const arr: any[] = []
      for (let item of json) {
        arr.push(deepFieldSort(item, asc))
      }
      return arr
    } else if (set.size === 1 && (set.has('string') || set.has('number') || set.has('bigint') || set.has('boolean'))) {
      return asc ? json.sort() : json.sort().reverse()
    }
  } else if (isObject(json)) {
    const sortedKeys = asc ? Object.keys(json).sort() : Object.keys(json).sort().reverse()
    const sortedObj: { [key: string]: any } = {}
    for (let key of sortedKeys) {
      if (isObject(json[key]) || isArray(json[key])) {
        sortedObj[key] = deepFieldSort(json[key], asc)
      } else {
        sortedObj[key] = json[key]
      }
    }
    return sortedObj
  }
  return json
}

function fieldSort(asc: boolean) {
  const value = formatValidate()
  if (value) {
    const json = JSON.parse(value)
    el.value.setValue(JSON.stringify(deepFieldSort(json, asc)))
    formatValidate(false)
  }
}

// 切换视图
const codemirrorView = ref(true)

function toggleView() {
  codemirrorView.value = !codemirrorView.value
}
</script>

<template>
  <div>
    <div v-if="codemirrorView">
      <div class="tip-font">
        Tip：<a @click="async () => {result.value = await getTextFromClipboard()}">粘贴文本</a>，双击格式化
      </div>
      <CodeMirror ref="el" v-model="result.value" @change="cacheData.cache" @dblclick="formatValidate" lineWrapping />
    </div>
    <JsonEditor v-else v-model="result.value" mode="tree" />
    <a-divider />
    <a-affix :offset-bottom="50">
      <a-space :size="[8, 16]" wrap class="bottom-button-group">
        <a-button type="primary" @click="formatValidate" v-if="codemirrorView">格式化校验</a-button>
        <a-button @click="compress" v-if="codemirrorView">压缩</a-button>
        <a-dropdown-button @click="deepDelEscape(true)" v-if="codemirrorView">
          深度去除转义
          <template #overlay>
            <a-button @click="deepDelEscape(false)"> 不加 [@String]</a-button>
          </template>
        </a-dropdown-button>
        <a-button @click="delEscape" v-if="codemirrorView">去除转义</a-button>
        <a-button @click="escape" v-if="codemirrorView">转义</a-button>
        <a-dropdown-button @click="fieldSort(true)" v-if="codemirrorView">
          字段升序
          <template #overlay>
            <a-button @click="fieldSort(false)">字段降序</a-button>
          </template>
        </a-dropdown-button>
        <a-divider type="vertical" v-if="codemirrorView" style="background-color: #d9d9d9" />
        <a-button type="primary" @click="toggleView">
          <template #icon>
            <SwapOutlined />
          </template>
          切换视图
        </a-button>
      </a-space>
    </a-affix>
  </div>
</template>

<style scoped>
</style>