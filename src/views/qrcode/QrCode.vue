<script setup lang="ts">
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import QrCode from 'qrcode-decoder'


const data = ref('')
const qrCodeRef = ref()
const segmentedData = ['L', 'M', 'Q', 'H']
const level = ref(segmentedData[1])
const showIcon = ref(true)

const downloadImage = async () => {
  const url = await qrCodeRef.value.toDataURL()
  const a = document.createElement('a')
  a.download = 'QRCode.png'
  a.href = url
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

const handleDrop = ({ file }: { file: any }) => {
  if (!file || !file.originFileObj) {
    message.error('请上传有效图片')
    return
  }
  decodeQR(file.originFileObj).then(res => {
    if (res.data) {
      message.success('识别成功')
      data.value = res.data
    } else {
      message.error('识别失败')
    }
  })
}
const decodeQR = (file: File) => {
  const url = window.URL.createObjectURL(file) || window.webkitURL.createObjectURL(file)
  const qr = new QrCode()
  return qr.decodeFromImage(url)
}
</script>

<template>
  <div class="qrcode-content">
    <a-row :gutter="20" justify="center">
      <a-col flex="7">
        <a-textarea
          v-model:value="data"
          :auto-size="{ minRows: 10, maxRows: 30 }"
        />
      </a-col>
      <a-col flex="3">
        <a-flex vertical gap="middle" align="center">
          <a-qrcode ref="qrCodeRef" :value="data" :error-level="level" :size="200" @click="downloadImage"
                    bgColor="rgba(255, 255, 255, 0.8)" :icon="showIcon? 'favicon.png' : undefined"
                    style="cursor: pointer" />
          <a-tag color="green">点击图片即可下载</a-tag>
          <a-flex gap="middle" align="center">
            <p>容错率：
              <a-segmented v-model:value="level" :options="segmentedData" />
            </p>
            <p>ICON：
              <a-switch v-model:checked="showIcon" />
            </p>
          </a-flex>
          <a-divider vertical />
          <a-upload-dragger accept="image/*" :showUploadList="false" :action="undefined" @change="handleDrop"
                            @reject="console.log('文件类型不符')" :customRequest="()=>{}">
            <p class="ant-upload-drag-icon"><span role="img" aria-label="inbox" class="anticon anticon-inbox"><svg
              focusable="false" data-icon="inbox" width="1em" height="1em" fill="currentColor" aria-hidden="true"
              viewBox="0 0 1024 1024"><path
              d="M885.2 446.3l-.2-.8-112.2-285.1c-5-16.1-19.9-27.2-36.8-27.2H281.2c-17 0-32.1 11.3-36.9 27.6L139.4 443l-.3.7-.2.8c-1.3 4.9-1.7 9.9-1 14.8-.1 1.6-.2 3.2-.2 4.8V830a60.9 60.9 0 0060.8 60.8h627.2c33.5 0 60.8-27.3 60.9-60.8V464.1c0-1.3 0-2.6-.1-3.7.4-4.9 0-9.6-1.3-14.1zm-295.8-43l-.3 15.7c-.8 44.9-31.8 75.1-77.1 75.1-22.1 0-41.1-7.1-54.8-20.6S436 441.2 435.6 419l-.3-15.7H229.5L309 210h399.2l81.7 193.3H589.4zm-375 76.8h157.3c24.3 57.1 76 90.8 140.4 90.8 33.7 0 65-9.4 90.3-27.2 22.2-15.6 39.5-37.4 50.7-63.6h156.5V814H214.4V480.1z"></path></svg>
              <!----></span></p>
            <p class="ant-upload-text">Click or drag file to this area to upload</p>
            <p class="ant-upload-hint">
              Support for a single or bulk upload. Strictly prohibit from uploading company data or other
              band files
            </p>
          </a-upload-dragger>
          <a-tag color="green">拖拽图片文件到上方即可解析</a-tag>
        </a-flex>
      </a-col>
    </a-row>
  </div>
</template>

<style scoped>
.qrcode-content {
  width: 80%;
  margin: 0 auto;
}
</style>