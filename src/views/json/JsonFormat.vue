<script setup lang="ts">
import { CodeMirror, JsonEditor } from '@/components/CodeEditor'
import { h, type Ref, ref, unref, watch } from 'vue'
import { validateJson } from '@/utils/jsonUtil'
import { message, notification } from 'ant-design-vue'
import { isArray, isJsonString, isObject } from '@/utils/is'
import { SearchOutlined } from '@ant-design/icons-vue'

const props = defineProps({
  activeKey: { type: String }
})
watch(() => props.activeKey, () => {
  if (props.activeKey === 'JSON') {
    window.location.reload()
  }
})

const el = ref()
const result = ref<{
  value: string;
  error: boolean;
  message: string;
}>({ value: sessionStorage.getItem('JsonFormatData') as string || '', error: false, message: '' })

function handleChange(value: string) {
  sessionStorage.setItem('JsonFormatData', value)
}

// 格式化校验
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
    formatValidate()
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

const codemirrorView = ref(true)
function toggleView() {
  codemirrorView.value = !codemirrorView.value
}
</script>

<template>
  <div>
    <div v-if="codemirrorView">
      <div style="font-size: 14px; color: #00000059; margin: 10px">Tip：粘贴文本，双击格式化</div>
      <CodeMirror ref="el" v-model="result.value" @change="handleChange" @dblclick="formatValidate" lineWrapping/>
    </div>
    <JsonEditor v-else v-model="result.value" mode="tree" />
    <a-divider />
    <a-affix :offset-bottom="30">
      <div class="button-group">
        <a-space :size="[8, 16]" wrap>
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
          <a-divider type="vertical" v-if="codemirrorView" style="background-color: #d9d9d9"/>
          <a-button @click="toggleView">切换视图</a-button>
        </a-space>
      </div>
    </a-affix>
  </div>
</template>

<style scoped>
.button-group {
  padding: 8px 8px 13px 8px;
  border-radius: 6px;
  border: 1px solid #d9d9d9;
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(2px);
  display: inline-block;
}
</style>