<script setup lang="ts">
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import QrCode from 'qrcode-decoder'
import { useClipboard } from '@/utils/Clipboard'
import { handleReadDragFileEvent } from '@/utils/Event'

const qrCodeRef = ref()

const pageData = ref({
  data: '',
  segmentedData: ['L', 'M', 'Q', 'H'],
  level: 'M',
  showIcon: true,
  dragging: false,
  img: ''
})


const downloadImage = async () => {
  const url = await qrCodeRef.value.toDataURL()
  const a = document.createElement('a')
  a.download = 'QRCode.png'
  a.href = url
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

// 粘贴文本、二维码图片
const handlePaste = async (e: ClipboardEvent) => {
  const clipboard = useClipboard()
  const img = await clipboard.pasteImage()
  if (img) {
    e.preventDefault()
    pageData.value.img = img
    decodeQR(null, img)
  }
}

const decodeQR = (file: File | null, img: string | null) => {
  let url: string = ''
  if (file) {
    url = window.URL.createObjectURL(file) || window.webkitURL.createObjectURL(file)
  } else if (img) {
    url = img
  }
  new QrCode().decodeFromImage(url).then(res => {
    console.log(res)
    if (res?.data) {
      message.success('识别成功')
      pageData.value.data = res.data
    } else {
      message.error('识别失败')
      pageData.value.data = ''
    }
  })
}

// 拖拽文件
const handleDragFile = (event: DragEvent) => {
  const file = event.dataTransfer?.files[0]
  if (file && file.type.startsWith('image')) {
    decodeQR(file, null)
  } else {
    handleReadDragFileEvent(event, (value) => {
      const text = value as string
      if (text.length >= 26799) {
        message.error('数据太大了')
      } else {
        pageData.value.data = text
      }
    })
  }
  pageData.value.dragging = false
}
</script>

<template>
  <div class="content-center">
    <div class="tip-font">
      Tip：在此处 <a @click="async () => {pageData.data = await useClipboard().pasteText()}">粘贴文本</a>、<a
      @click="async () => {pageData.data = await useClipboard().pasteText()}">粘贴二维码图片</a>、拖拽文本文件、拖拽二维码图片
      进行<span style="color: #1677ff">解析</span>或<span style="color: #1677ff">生成</span>二维码
    </div>
    <a-divider class="divider-border-none divider-10" />
    <a-row :gutter="20" justify="center">
      <a-col flex="7">
        <a-textarea
          v-model:value="pageData.data"
          :auto-size="{ minRows: 10, maxRows: 30 }"
          allowClear
          showCount
          placeholder="在此处 粘贴文本、粘贴二维码图片、拖拽文本文件、拖拽二维码图片 进行解析或生成二维码"
          @dragenter.prevent="pageData.dragging=true"
          @dragleave.prevent="pageData.dragging=false"
          @dragover.prevent
          @drop.prevent="handleDragFile"
          @paste="handlePaste"
          @change="pageData.img=''"
          class="drag-zone"
          :class="{'drag-over': pageData.dragging}"
        />
      </a-col>
      <a-col flex="5">
        <a-flex v-if="pageData.img" vertical gap="middle" align="center">
          <a-image :width="200" :src="pageData.img" />
        </a-flex>
        <a-flex v-else vertical gap="middle" align="center">
          <a-qrcode ref="qrCodeRef" :value="pageData.data" :error-level="pageData.level" :size="200"
                    @click="downloadImage"
                    bgColor="rgba(255, 255, 255, 0.8)" :icon="pageData.showIcon? 'favicon.png' : undefined"
                    style="cursor: pointer" />
          <a-tag color="green">点击图片即可下载</a-tag>
          <a-flex gap="middle" align="center">
            <p>容错率：
              <a-segmented v-model:value="pageData.level" :options="pageData.segmentedData" />
            </p>
            <p>ICON：
              <a-switch v-model:checked="pageData.showIcon" />
            </p>
          </a-flex>
        </a-flex>
      </a-col>
    </a-row>
  </div>
</template>

<style scoped></style>