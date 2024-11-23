<script setup lang="ts">
import { CodeMirror } from '@/components/CodeEditor'
import { ref, watch } from 'vue'
import './Context'
import { getTextFromClipboard } from '@/utils/useCopyToClipboard'
import { useCacheData } from '@/utils/CacheData'

const cacheData = useCacheData('JSRunner')

const props = defineProps({ modelValue: String })
const script = ref<string>(props.modelValue || cacheData.load())
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
  <div class="js-runner">
    <div class="tip-font">脚本：<a @click="async () => {script = await getTextFromClipboard()}">粘贴脚本</a></div>
    <AButton type="primary" @click="handleRunner" class="run-btn">运行脚本</AButton>
    <CodeMirror v-model="script" @change="cacheData.cache" theme="darcula" mode="javascript" />
    <div class="tip-font">运行结果：</div>
    <ATextarea v-model:value="result.data" :style="{color: result.success ? 'black' : 'red'}" />
  </div>
</template>

<style scoped>
.js-runner {
  .tip-font {
    display: inline-block;
  }
  .run-btn {
    float: right;
  }
  :global(.CodeMirror) {
    min-height: 300px;
    max-height: calc(100vh - 350px);
  }
  :global(.CodeMirror-scroll) {
    min-height: 300px;
    max-height: calc(100vh - 350px);
  }
}
</style>