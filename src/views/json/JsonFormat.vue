<script setup lang="ts">
import { JsonEditor } from '@/components/CodeEditor'
import { type Ref, ref, unref } from 'vue'
import { validateJson } from '@/utils/jsonUtil'
import { message, notification } from 'ant-design-vue'
import { SwapOutlined } from '@ant-design/icons-vue'
import { isArray, isBoolean, isJsonString, isObject, isString } from '@/utils/is'
import { useClipboard } from '@/utils/Clipboard'
import { useSessionCache } from '@/utils/CacheData'
import { MonacoEditor } from '@/components/monaco'
import DataTransferButton from '@/views/DataTransfer/DataTransferButton.vue'
import AffixButtonGroup from "@/components/AffixButtonGroup.vue";
import { StrUtil } from '@/utils/StrUtil'

const sessionCache = useSessionCache('JsonFormat')

const result = ref<{
  value: string;
  error: boolean;
  message: string;
}>({ value: sessionCache.load(), error: false, message: '' })
// 切换视图
const monacoView = ref(true)
// JSON清理
type ClearType = 'null' | 'string' | 'boolean' | 'object' | 'array'
const clearData = ref<{
  open: boolean,
  options: {
    title: string, key: ClearType, value: boolean, case: string[]
  }[]
}>({
  open: false,
  options: [
    {title: '清理null', key: 'null', value: true, case: ['"name": null']},
    {title: '清理空字符串', key: 'string', value: true, case: ['"name": ""', '"name": " "']},
    {title: '清理false', key: 'boolean', value: true, case: ['"isBlank": false']},
    {title: '清理空对象', key: 'object', value: true, case: ['"person": {}']},
    {title: '清理空数组', key: 'array', value: true, case: ['addresses: []']}
  ]
})

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
      notification.error({
        message: 'JSON格式错误',
        description: result.value.message,
        placement: 'topRight'
      })
    } else {
      message.success('正确的JSON')
    }
  }
  return result.value.error ? null : unref(result.value.value)
}

// 压缩
function compress() {
  const value = formatValidate()
  if (value) {
    result.value.value = JSON.stringify(JSON.parse(value))
  }
}

// 深度去除转义
function deepJsonForDelEscape(json: Ref<any>, suffix: boolean) {
  if (isArray(json.value)) {
    for (const obj of json.value) {
      deepJsonForDelEscape(ref(obj), suffix)
    }
  } else if (isObject(json.value)) {
    const suffixStr = ' [@String]'
    for (let key in json.value) {
      const value = json.value[key]
      if (isJsonString(value)) {
        delete json.value[key]
        key = suffix ? key + suffixStr : key
        json.value[key] = JSON.parse(value)
        deepJsonForDelEscape(ref(json.value[key]), suffix)
      } else {
        if (!suffix && key.endsWith(suffixStr)) {
          deepJsonForDelEscape(ref(value), suffix)
          delete json.value[key]
          json.value[key.substring(0, key.length - suffixStr.length)] = value
        } else {
          deepJsonForDelEscape(ref(value), suffix)
        }
      }
    }
  }
}

function deepDelEscape(suffix: boolean) {
  const value = formatValidate()
  if (value) {
    const json = ref(JSON.parse(value))
    deepJsonForDelEscape(json, suffix)
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

// JSON清理
function deepClearJson(json: any) {
  if (isArray(json)) {
    for (const item of json) {
      deepClearJson(item)
      if (toDelete(item)) {
        delete json[item]
      }
    }
  } else if (isObject(json)) {
    for (const key in json) {
      deepClearJson(json[key])
      if(toDelete(json[key])) {
        delete json[key]
      }
    }
  }
  if (toDelete(json)) {
    return ''
  }
  return json
}
function clearChecked(key: ClearType):boolean {
  return (clearData.value.options.find(op => op.key === key)?.value || false)
}
function toDelete(value: any): boolean {
  if (value === null || value === undefined) {
    return clearChecked('null')
  } else if (isString(value)) {
    return clearChecked('string') && value.trim().length === 0
  } else if (isBoolean(value)) {
    return clearChecked('boolean') && !value
  } else if (isObject(value)) {
    return clearChecked('object') && Object.keys(value).length === 0
  } else if (isArray(value)) {
    return clearChecked('array') && value.length === 0
  }
  return false
}

function clearJson() {
  const value = formatValidate()
  if (value) {
    const json = JSON.parse(value)
    result.value.value = JSON.stringify(deepClearJson(json))
  }
  clearData.value.open = false
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
  <AffixButtonGroup>
    <a-button  type="primary" @click="formatValidate" size="small">格式化校验</a-button>
    <a-dropdown-button  @click="compress" size="small" placement="topRight">
      压缩
      <template #overlay>
        <a-menu>
          <a-menu-item key="1" @click="result.value = StrUtil.compress(result.value)">
            文本压缩
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown-button>
    <a-dropdown-button  @click="deepDelEscape(true)" size="small" placement="topRight">
      深度去除转义
      <template #overlay>
        <a-menu>
          <a-menu-item key="1" @click="deepDelEscape(false)">
            不加 [@String]
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown-button>
    <a-button  @click="delEscape" size="small">去除转义</a-button>
    <a-button  @click="escape" size="small">转义</a-button>
    <a-dropdown-button  @click="fieldSort(true)" size="small" placement="topRight">
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
    <a-button @click="clearData.open=true" size="small">JSON清理</a-button>
    <a-divider type="vertical" />
    <a-button type="primary" @click="monacoView = !monacoView" size="small">
      <template #icon>
        <SwapOutlined />
      </template>
      切换视图
    </a-button>
  </AffixButtonGroup>
  <a-modal title="清理设置" v-model:open="clearData.open" ok-text="清理" @ok="clearJson">
    <a-flex v-for="option in clearData.options" :key="option.title" style="margin: 5px 0">
      <a-checkbox v-model:checked="option.value">{{option.title}}</a-checkbox>
      <a-tag v-for="ca in option.case" :key="ca" color="geekblue" >
        {{ca}}
      </a-tag>
    </a-flex>
  </a-modal>
</template>

<style scoped></style>