<script setup lang="ts">
import { ref, unref } from 'vue'
import { message } from 'ant-design-vue'
import { Base64 } from 'js-base64'
import CryptoJS from 'crypto-js'
import { getTextFromClipboard, useCopyToClipboard } from '@/utils/useCopyToClipboard'
import { handleReadDragFileEvent } from '@/utils/Event'

const { clipboardRef, copiedRef } = useCopyToClipboard()

const data = ref('')
const resultData = ref('')

type OperateType = 'encode' | 'decode'

// 编解码操作
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
  } else {
    message.error('请输入编解码文本')
  }
}

// 编解码菜单
const encoderButtons = ref<{
  title: string,
  handleEncode: () => void,
  handleDecode?: () => void,
}[]>([
  {
    title: 'Base64',
    handleEncode: () => encoderOperation('encode', (val) => Base64.encode(val)),
    handleDecode: () => encoderOperation('decode', (val) => Base64.decode(val))
  },
  {
    title: 'URL',
    handleEncode: () => encoderOperation('encode', (val) => encodeURIComponent(val)),
    handleDecode: () => encoderOperation('decode', (val) => decodeURIComponent(val))
  },
  {
    title: 'Unicode',
    handleEncode: () => encoderOperation('encode', (val) => escape(val).replace(/%u/g, '\\u')),
    handleDecode: () => encoderOperation('decode', (val) => unescape(val.replace(/\\u/g, '%u')))
  },
  {
    title: 'MD5',
    handleEncode: () => encoderOperation('encode', (val) => CryptoJS.MD5(val).toString())
  }
])

// 交换内容
const switchData = () => {
  const value = data.value
  data.value = resultData.value
  resultData.value = value
}

// 拖拽文件
const dragging = ref(false)
const handleDragFile = (event: DragEvent) => {
  handleReadDragFileEvent(event, (value) => {
    data.value = value as string
    encoderButtons.value[0].handleEncode()
  })
  dragging.value = false
}

// 拷贝结果
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
</script>
<template>
  <div class="content-center">
    <a-row :gutter="20">
      <a-col flex="5">
        <div class="tip-font">
          Tip：<a @click="async () => {data = await getTextFromClipboard()}">粘贴文本</a>或拖拽文件到此处，默认进行Base64编码
        </div>
        <a-divider style="margin: 10px 0" />
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
        <div class="tip-font">Tip：双击结果栏拷贝结果</div>
        <a-divider style="margin: 10px 0" />
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
        <a-space v-for="item in encoderButtons" :key="item.title">
          <span>{{ item.title }}</span>
          <a-button-group size="small">
            <a-button @click="item.handleEncode" type="primary">编码</a-button>
            <a-button @click="item.handleDecode" v-if="item.handleDecode">解码</a-button>
          </a-button-group>
          <a-divider type="vertical" />
        </a-space>
        <a-button @click="switchData" size="small">交换内容</a-button>
      </a-space>
    </a-affix>
  </div>
</template>

<style scoped>
.drag-zone {
  transition: background-color 0.3s;
}

.drag-zone.drag-over {
  cursor: move;
  border-radius: 6px;
  border: 1px solid #4096ff;
}
</style>