<script setup lang="ts">
import { CodeMirror, JsonEditor, MODE } from '@/components/CodeEditor'
import { type Ref, ref, unref } from 'vue'
import { validateJson } from '@/utils/jsonUtil'
import { message, notification } from 'ant-design-vue'
import { SwapOutlined } from '@ant-design/icons-vue'
import { isArray, isJsonString, isObject } from '@/utils/is'
import { getTextFromClipboard } from '@/utils/useCopyToClipboard'
import { useSessionCache } from '@/utils/CacheData'
import { XML2JSON } from '@/data'
import vkbeautify from 'vkbeautify'
import { MonacoEditor } from '@/components/monaco'

const sessionCache = useSessionCache('JsonFormat')

const result = ref<{
  value: string;
  error: boolean;
  message: string;
  xmlValue?: string;
}>({ value: sessionCache.load(), error: false, message: '' })
const openModal = ref<boolean>(false)

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

// JSON转XML
const handleJson2Xml = () => {
  const value = formatValidate(false)
  if (value) {
    try {
      const xml = XML2JSON.js2xml(JSON.parse(value)).replace(/&quot;/g, '"')
      result.value.xmlValue = vkbeautify.xml(xml)
      notification['success']({
        message: '转换成功',
        placement: 'topRight'
      })
      openModal.value = true
    } catch (e: any) {
      notification['error']({
        message: '转换失败',
        description: e?.message,
        placement: 'topRight'
      })
    }
  }
}

// 切换视图
const codemirrorView = ref(true)

function toggleView() {
  codemirrorView.value = !codemirrorView.value
}
</script>

<template>
  <MonacoEditor v-if="codemirrorView" :language="'json'" v-model="result.value" @change="sessionCache.cache" @dblClick="formatValidate" style="height: calc(100vh - 200px)">
    <template #toolTip>
      <div class="tip-font">
        Tip：<a @click="async () => {result.value = await getTextFromClipboard()}">粘贴文本</a>，双击格式化
      </div>
    </template>
  </MonacoEditor>
  <JsonEditor v-else v-model="result.value" mode="tree" />
  <a-divider />
  <a-affix :offset-bottom="50">
    <div class="bottom-button-group">
      <div v-if="codemirrorView" class="codemirror-button">
        <a-button type="primary" @click="formatValidate">格式化校验</a-button>
        <a-button @click="compress">压缩</a-button>
        <a-dropdown-button @click="deepDelEscape(true)">
          深度去除转义
          <template #overlay>
            <a-button @click="deepDelEscape(false)"> 不加 [@String]</a-button>
          </template>
        </a-dropdown-button>
        <a-button @click="delEscape">去除转义</a-button>
        <a-button @click="escape">转义</a-button>
        <a-dropdown-button @click="fieldSort(true)">
          字段升序
          <template #overlay>
            <a-button @click="fieldSort(false)">字段降序</a-button>
          </template>
        </a-dropdown-button>
        <a-divider type="vertical"/>
        <a-button type="primary" @click="handleJson2Xml">JSON转XML</a-button>
        <a-divider type="vertical"/>
      </div>
      <a-button type="primary" @click="toggleView">
        <template #icon>
          <SwapOutlined />
        </template>
        切换视图
      </a-button>
    </div>
  </a-affix>
  <a-modal v-model:open="openModal" @ok="openModal=false" width="80%" centered>
    <MonacoEditor v-model="result.xmlValue" :language="'xml'" style="height: 70vh"/>
  </a-modal>
</template>

<style scoped>
.bottom-button-group {
  display: inline-block;
  .codemirror-button {
    display: inline-block;
    margin-right: 5px;
    * {
      margin: 5px;
    }
  }
}
</style>