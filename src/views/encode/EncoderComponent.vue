<script setup lang="ts">
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { Base64 } from 'js-base64'

const data = ref('')
const resultData = ref('')

const copyResult = () => {
  if (resultData.value) {
    navigator.clipboard.writeText(resultData.value)
    message.success('复制成功')
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

</script>
<template>
  <div class="base64-content">
    <div style="font-size: 14px; color: #00000059; margin: 10px">Tip：双击结果栏拷贝结果</div>
    <a-row :gutter="20">
      <a-col flex="5">
        <a-textarea
          v-model:value="data"
          :auto-size="{ minRows: 10, maxRows: 25 }"
          allowClear
          showCount
          placeholder="Input：输入文本或拖拽文件进行编码"
        />
      </a-col>
      <a-col flex="5">
        <a-textarea
          v-model:value="resultData"
          :auto-size="{ minRows: 10, maxRows: 25 }"
          allowClear
          showCount
          placeholder="Output：结果，双击拷贝结果"
          @dblclick="copyResult"
        />
      </a-col>
    </a-row>
    <a-divider />
    <a-affix :offset-bottom="30">
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
</style>