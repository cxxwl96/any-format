<script setup lang="ts">
import { ref, watch } from 'vue'
import './Context'
import { getTextFromClipboard } from '@/utils/useCopyToClipboard'
import { useSessionCache } from '@/utils/CacheData'
import { MonacoEditor } from '@/components/monaco'

const sessionCache = useSessionCache('JSRunner')

const props = defineProps({ modelValue: String })
const script = ref<string>(props.modelValue || sessionCache.load())
const result = ref<{ data: any; success: boolean; }>({ data: '', success: true })
watch(() => props.modelValue, (value) => script.value = value || '')

const handleRunner = () => {
  if (script.value) {
    try {
      result.value.data = eval(script.value)?.toString()
      result.value.success = true
    } catch (e) {
      result.value.data = e?.toString()
      result.value.success = false
    }
  } else {
    result.value.data = '请编辑脚本后运行'
    result.value.success = false
  }
}
</script>

<template>
  <a-space direction="vertical" :size="20" style="width: 100%">
    <MonacoEditor v-model="script" @change="sessionCache.cache" theme="vs-dark" language="javascript" height="calc(100vh - 400px)">
      <template #title>
        <a-flex align="center" gap="middle">
          <div class="tip-font">脚本：<a @click="async () => {script = await getTextFromClipboard()}">粘贴脚本</a></div>
          <a-button type="primary" @click="handleRunner" class="run-btn" size="small">运行脚本</a-button>
        </a-flex>
      </template>
    </MonacoEditor>
    <div class="tip-font">运行结果：</div>
    <a-textarea v-model:value="result.data" :style="{color: result.success ? 'black' : 'red'}" readonly/>
  </a-space>
</template>

<style scoped></style>