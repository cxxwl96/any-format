<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { DataTypeArray, type Type, DataTransfer } from '@/views/DataTransfer/DataTransfer'
import { useSessionCache } from '@/utils/CacheData'
import { message, notification } from 'ant-design-vue'
import { MonacoEditor } from '@/components/monaco'
const sessionCache = useSessionCache('DataTransfer')

const data = ref<{
  value: string
  type: Type
  resultValue: string
}>({
  value: '',
  type: DataTypeArray[0].type,
  resultValue: '',
})

onMounted(() => {
  if (sessionCache.load()) {
    data.value = sessionCache.load()
  }
})

const handleChange = () => {
  sessionCache.cache(data.value)
}

const handleTransfer = (toType: Type) => {
  try {
    if (!data.value.value) {
      message.error('请输入内容')
      return
    }
    data.value.resultValue = new DataTransfer(data.value.value, data.value.type).to(toType, true) || ''
    message.success('转换成功')
  } catch (e: any) {
    notification.error({
      message: '转换失败',
      description: e?.message,
      placement: 'topRight',
    })
  }
}
</script>

<template>
  <a-row :gutter="20">
    <a-col :span="12">
      <MonacoEditor v-model="data.value" @change="handleChange" height="75vh" :showTool="false">
        <template #title>
          <span class="tip-font">类型：</span>
          <a-radio-group v-model:value="data.type" size="small">
            <a-radio-button v-for="dataType in DataTypeArray" :key="dataType.type" :value="dataType.type">
              {{ dataType.type }}
            </a-radio-button>
          </a-radio-group>
        </template>
      </MonacoEditor>
      <a-divider style="margin: 10px 0"/>
    </a-col>
    <a-col :span="12">
      <MonacoEditor v-model="data.resultValue" @change="handleChange" height="75vh" :showTool="false">
        <template #title>
          <span class="tip-font">转换为：</span>
          <a-button-group size="small">
            <a-button v-for="dataType in DataTypeArray" :key="dataType.type" @click="handleTransfer(dataType.type)" type="primary">
              {{ dataType.type }}
            </a-button>
          </a-button-group>
        </template>
      </MonacoEditor>
      <a-divider style="margin: 10px 0"/>
    </a-col>
  </a-row>
</template>

<style scoped>

</style>