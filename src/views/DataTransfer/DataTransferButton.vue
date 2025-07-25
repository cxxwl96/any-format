<script setup lang="ts">

import { type PropType, ref } from 'vue'
import { DataTransfer, type Type, useDataTransfer } from '@/views/DataTransfer/DataTransfer'
import { message, notification } from 'ant-design-vue'
import { MonacoEditor } from '@/components/monaco'
import type { Language } from '@/components/monaco/data'
import { useClipboard } from '@/utils/Clipboard'


const props = defineProps({
  value: { type: String },
  type: { type: String as PropType<Type>, required: true },
  toTypes: { type: Object as PropType<Array<Type>>, required: true },
  dropdownButton: { type: Boolean, default: true }
})

const data = ref<{
  toValue: string
  toLang?: Language
  openModel: boolean
}>({
  toValue: '',
  toLang: 'kotlin',
  openModel: false
})

const handleDataTransfer = (toType: Type) => {
  if (!props.value) {
    message.info('请输入内容')
    return
  }
  try {
    data.value.toValue = useDataTransfer(props.value, props.type).to(toType, true)
    data.value.toLang = DataTransfer.getLang(toType)
    data.value.openModel = true
    message.success('转换成功')
  } catch (e: any) {
    notification.error({
      message: '转换失败',
      description: e?.message,
      placement: 'topRight'
    })
  }
}
const handleFinish = (value: string, lang: Language) => {
  try {
    data.value.toValue = value
    data.value.toLang = lang
    data.value.openModel = true
    message.success('转换成功')
  } catch (e: any) {
    notification.error({
      message: '转换失败',
      description: e?.message,
      placement: 'topRight'
    })
  }
}
const handleOk = async () => {
  useClipboard().copyText(data.value.toValue)
}
</script>

<template>
  <a-dropdown-button v-if="dropdownButton && toTypes.length > 1"
                     @click="handleDataTransfer(toTypes[0])"
                     size="small"
                     placement="topRight"
  >
    {{ `转${toTypes[0]}` }}
    <template #overlay>
      <a-menu>
        <a-menu-item v-for="toType in toTypes.slice(1)" :key="toType" @click="handleDataTransfer(toType)">
          {{ `转${toType}` }}
        </a-menu-item>
        <slot name="button" :finish="handleFinish"/>
      </a-menu>
    </template>
  </a-dropdown-button>
  <a-space v-else :size="[8, 16]">
    <a-button
      v-for="toType in toTypes"
      :key="toType"
      @click="handleDataTransfer(toType)"
      size="small"
    >
      {{ `转${toType}` }}
    </a-button>
    <slot name="button" :finish="handleFinish"/>
  </a-space>
  <a-modal v-model:open="data.openModel"
           @ok="handleOk"
           :closable="false"
           width="65%"
           :cancel-text="'关闭'"
           :ok-text="'复制'"
           :cancel-button-props="{size: 'small'}"
           :ok-button-props="{size: 'small'}"
  >
    <MonacoEditor :language="data.toLang" v-model="data.toValue" height="65vh" />
  </a-modal>
</template>

<style scoped></style>