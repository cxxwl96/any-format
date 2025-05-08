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
  toTypes: { type: Object as PropType<Array<Type>>, required: true }
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
    message.error('请输入内容')
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

const handleOk = async () => {
  useClipboard().copyText(data.value.toValue)
}
</script>

<template>
  <a-button v-if="toTypes.length === 1" @click="handleDataTransfer(toTypes[0])" size="small">{{ `转${toTypes[0]}` }}
  </a-button>
  <a-dropdown-button v-if="toTypes.length > 1" @click="handleDataTransfer(toTypes[0])" size="small"
                     placement="topRight">
    {{ `转${toTypes[0]}` }}
    <template #overlay>
      <a-menu>
        <a-menu-item v-for="toType in toTypes.slice(1)" :key="toType" @click="handleDataTransfer(toType)">
          {{ `转${toType}` }}
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown-button>
  <a-modal v-model:open="data.openModel"
           :cancel-text="'关闭'"
           :ok-text="'复制'"
           :cancelButtonProps="{display: 'none'}"
           :closable="false"
           mask-closable
           width="65%"
           @ok="handleOk"
  >
    <MonacoEditor :language="data.toLang" v-model="data.toValue" height="65vh" />
  </a-modal>
</template>

<style scoped>
:global(.ant-dropdown .ant-dropdown-menu) {
  padding: 0 !important;
  border-radius: 3px !important;
}

:global(.ant-dropdown .ant-dropdown-menu .ant-dropdown-menu-item) {
  padding: 0 10px !important;
}
</style>