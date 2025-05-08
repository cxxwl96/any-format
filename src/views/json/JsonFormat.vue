<script setup lang="ts">
import { JsonEditor } from '@/components/CodeEditor'
import { type Ref, ref, unref } from 'vue'
import { validateJson } from '@/utils/jsonUtil'
import { message, notification } from 'ant-design-vue'
import { SwapOutlined } from '@ant-design/icons-vue'
import { isArray, isJsonString, isObject } from '@/utils/is'
import { useClipboard } from '@/utils/Clipboard'
import { useSessionCache } from '@/utils/CacheData'
import { MonacoEditor } from '@/components/monaco'
import DataTransferButton from '@/views/DataTransfer/DataTransferButton.vue'

const sessionCache = useSessionCache('JsonFormat')

const result = ref<{
  value: string;
  error: boolean;
  message: string;
}>({ value: sessionCache.load(), error: false, message: '' })
// 切换视图
const monacoView = ref(true)

// 格式化校验
function formatValidate(tip: boolean = true) {
  const value = result.value.value
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
  return unref(result.value.value)
}

// 压缩
function compress() {
  const value = formatValidate()
  if (value) {
    result.value.value = JSON.stringify(JSON.parse(value))
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
    result.value.value = JSON.stringify(json.value)
    formatValidate(false)
  }
}

// 去除转义
function delEscape() {
  const value = result.value.value || ''
  result.value.value = value.replace(/\\"/g, '"')
}

// 转义
function escape() {
  const value = result.value.value || ''
  result.value.value = value.replace(/"/g, '\\"')
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
    result.value.value = JSON.stringify(deepFieldSort(json, asc))
    formatValidate(false)
  }
}
</script>

<template>
  <MonacoEditor v-if="monacoView" language="json" v-model="result.value" @change="sessionCache.cache"
                @dblClick="formatValidate">
    <template #title>
      <div class="tip-font">
        Tip：<a @click="async () => {result.value = await useClipboard().pasteText()}">粘贴文本</a>，双击格式化
      </div>
    </template>
  </MonacoEditor>
  <JsonEditor v-else v-model="result.value" mode="tree" />
  <a-divider />
  <a-affix :offset-bottom="50">
    <a-space :size="[8, 16]" wrap class="bottom-button-group">
      <a-button v-if="monacoView" type="primary" @click="formatValidate" size="small">格式化校验</a-button>
      <a-button v-if="monacoView" @click="compress" size="small">压缩</a-button>
      <a-dropdown-button v-if="monacoView" @click="deepDelEscape(true)" size="small" placement="topRight">
        深度去除转义
        <template #overlay>
          <a-menu>
            <a-menu-item key="1" @click="deepDelEscape(false)">
              不加 [@String]
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown-button>
      <a-button v-if="monacoView" @click="delEscape" size="small">去除转义</a-button>
      <a-button v-if="monacoView" @click="escape" size="small">转义</a-button>
      <a-dropdown-button v-if="monacoView" @click="fieldSort(true)" size="small" placement="topRight">
        字段升序
        <template #overlay>
          <a-menu>
            <a-menu-item key="1" @click="fieldSort(false)">
              字段降序
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown-button>
      <DataTransferButton :value="result.value" :type="'JSON'" :toTypes="['XML', 'YAML']"/>
      <a-divider v-if="monacoView" type="vertical" />
      <a-button type="primary" @click="monacoView = !monacoView" size="small">
        <template #icon>
          <SwapOutlined />
        </template>
        切换视图
      </a-button>
    </a-space>
  </a-affix>
</template>

<style scoped>
:global(.ant-dropdown .ant-dropdown-menu) {
  padding: 0 !important;
  border-radius: 3px !important;
}
:global(.ant-dropdown .ant-dropdown-menu .ant-dropdown-menu-item) {
  padding: 3px 10px !important;
}
</style>