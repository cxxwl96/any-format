<script setup lang="ts">
import { ref, unref } from 'vue'
import { message } from 'ant-design-vue'
import { Base64 } from 'js-base64'
import { useCopyToClipboard } from '@/utils/useCopyToClipboard';
const { clipboardRef, copiedRef } = useCopyToClipboard();

const data = ref('')
const resultData = ref('')

const copyResult = (e: MouseEvent) => {
  if (resultData.value) {
    e.preventDefault()
    if (window.getSelection) {
      window.getSelection()?.removeAllRanges()
    } else {
      document.getSelection()?.empty()
    }
    clipboardRef.value = resultData.value
    if (unref(copiedRef)) {
      message.success('复制成功')
    }
  }
}

type OperateType = 'encode' | 'decode'

const encoderOperation = (type: OperateType, call: (val: string) => string) => {
  if (data.value) {
    const prefix = type === 'encode' ? '编码' : '解码'
    resultData.value = ''
    try {
      resultData.value = call(data.value)
    } catch (e) {
      message.error(prefix + '失败')
      return
    }
    if (resultData.value) {
      message.success(prefix + '成功')
    } else {
      message.error(prefix + '失败')
    }
  }
}

const base64Encode = () => {
  encoderOperation('encode', (val) => Base64.encode(val))
}
const base64Decode = () => {
  encoderOperation('decode', (val) => Base64.decode(val))
}
const urlEncode = () => {
  encoderOperation('encode', (val) => encodeURIComponent(val))
}
const urlDecode = () => {
  encoderOperation('decode', (val) => decodeURIComponent(val))
}
const unicodeEncode = () => {
  encoderOperation('encode', (val) => {
    const value = escape(val)
    return value.replace(/%u/g, '\\u')
  })
}
const unicodeDecode = () => {
  encoderOperation('decode', (val) => {
    return unescape(val.replace(/\\u/g, '%u'))
  })
}
const switchData = () => {
  const value = data.value
  data.value = resultData.value
  resultData.value = value
}
const dragging = ref(false)
const handleDragFile = (event: DragEvent) => {
  var files = event.dataTransfer?.files
  if (!files) {
    message.error('请拖拽有效文件')
  } else if (files.length > 1) {
    message.error('仅支持单文件拖拽')
  } else if (files[0].size > 2 * 1024 * 1024) {
    message.error('仅支持2MB大小的文件拖拽')
  } else {
    const reader = new FileReader()
    reader.onload = (e) => {
      data.value = e.target?.result as string
      base64Encode()
    }
    reader.readAsBinaryString(files[0])
  }
  dragging.value = false
}
</script>
<template>
  <div class="base64-content">
    <a-row :gutter="20">
      <a-col flex="5">
        <div style="font-size: 14px; color: #00000059; margin: 10px">Tip：输入文本或拖拽文件到此处，默认进行Base64编码
        </div>
        <a-textarea
          v-model:value="data"
          :auto-size="{ minRows: 10, maxRows: 25 }"
          allowClear
          showCount
          placeholder="输入文本或拖拽文件到此处，默认进行Base64编码"
          @dragenter.prevent="dragging=true"
          @dragleave.prevent="dragging=false"
          @dragover.prevent
          @drop.prevent="handleDragFile"
          class="drag-zone"
          :class="{'drag-over': dragging}"
        />
      </a-col>
      <a-col flex="5">
        <div style="font-size: 14px; color: #00000059; margin: 10px">Tip：双击结果栏拷贝结果</div>
        <a-textarea
          v-model:value="resultData"
          :auto-size="{ minRows: 10, maxRows: 25 }"
          allowClear
          showCount
          placeholder="结果，双击拷贝结果"
          @dblclick.prevent="copyResult"
        />
      </a-col>
    </a-row>
    <a-divider />
    <a-affix :offset-bottom="50">
      <a-space :size="[8, 16]" wrap class="bottom-button-group">
        <a-button type="primary" @click="base64Encode">Base64编码</a-button>
        <a-button @click="base64Decode">Base64解码</a-button>
        <a-button type="primary" @click="urlEncode">URL编码</a-button>
        <a-button @click="urlDecode">URL解码</a-button>
        <a-button type="primary" @click="unicodeEncode">Unicode编码</a-button>
        <a-button @click="unicodeDecode">Unicode解码</a-button>
        <a-divider type="vertical" style="background-color: #d9d9d9" />
        <a-button @click="switchData">交换内容</a-button>
      </a-space>
    </a-affix>
  </div>
</template>

<style scoped>
.base64-content {
  width: 80%;
  margin: 0 auto;
}

.drag-zone {
  transition: background-color 0.3s;
}

.drag-zone.drag-over {
  cursor: move;
  border-radius: 6px;
  border: 1px solid #4096ff;
}
</style>