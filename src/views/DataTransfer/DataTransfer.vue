<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { DataTransfer, DataTypeArray, type Type } from '@/views/DataTransfer/DataTransfer'
import { useSessionCache } from '@/utils/CacheData'
import { message, notification } from 'ant-design-vue'
import { MonacoEditor } from '@/components/monaco'
import type { Language } from '@/components/monaco/data'

const sessionCache = useSessionCache('DataTransfer')

const data = ref<{
  value: string
  type: Type
  lang?: Language
  toValue: string
  toType: Type
  toLang?: Language
}>({
  value: '',
  type: DataTypeArray[0].type,
  lang: DataTypeArray[0].lang,
  toValue: '',
  toType: DataTypeArray[0].type,
  toLang: DataTypeArray[0].lang
})

onMounted(() => {
  if (sessionCache.load()) {
    data.value = sessionCache.load()
  }
})
watch(() => data.value.type, val => data.value.lang = DataTransfer.getLang(val))
watch(() => data.value.toType, val => data.value.toLang = DataTransfer.getLang(val))

const handleChange = () => {
  sessionCache.cache(data.value)
}

const handleTransfer = (toType: Type) => {
  try {
    data.value.toType = toType
    if (!data.value.value) {
      message.error('请输入内容')
      return
    }
    data.value.toValue = new DataTransfer(data.value.value, data.value.type || DataTypeArray[0].type).to(toType, true) || ''
    message.success('转换成功')
  } catch (e: any) {
    notification.error({
      message: '转换失败',
      description: e?.message,
      placement: 'topRight'
    })
  }
}

const handleSwitchValue = () => {
  const value = data.value.value
  data.value.value = data.value.toValue
  data.value.toValue = value

  const lang = data.value.lang
  data.value.lang = data.value.toLang
  data.value.toLang = lang

  const type = data.value.type
  data.value.type = data.value.toType
  data.value.toType = type
}
</script>

<template>
  <a-flex vertical gap="middle" class="content-center">
    <MonacoEditor
      :language="data.lang"
      v-model="data.value"
      @change="handleChange"
      height="30vh"
      :showTool="false"
      :minimap="false"
    >
      <template #title>
        <span class="tip-font">类型：</span>
        <a-radio-group v-model:value="data.type" size="small">
          <a-radio-button v-for="dataType in DataTypeArray" :key="dataType.type" :value="dataType.type">
            {{ dataType.type }}
          </a-radio-button>
        </a-radio-group>
      </template>
    </MonacoEditor>
    <MonacoEditor
      :language="data.toLang"
      v-model="data.toValue"
      @change="handleChange"
      height="30vh"
      :show-tool="false"
      :minimap="false"
      :line-numbers="false"
      read-only
    >
      <template #title>
        <span class="tip-font">转换为：</span>
        <a-button-group size="small">
          <a-button v-for="dataType in DataTypeArray" :key="dataType.type" @click="handleTransfer(dataType.type)"
                    type="primary">
            {{ dataType.type }}
          </a-button>
        </a-button-group>
        <a-divider type="vertical" />
        <a-button @click="handleSwitchValue" size="small">交换内容</a-button>
      </template>
    </MonacoEditor>
  </a-flex>
</template>

<style scoped>

</style>