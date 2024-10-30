<script setup lang="ts">
import { CodeMirror } from '@/components/CodeEditor'
import { ref } from 'vue'
import './Context'

const script = ref<string>()
const result = ref<{ data: any; success: boolean; }>({data: '', success: true})

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
<div>
  <AButton @click="handleRunner">运行脚本</AButton>
  <ARow :gutter="16" style="height: calc(100vh - 300px)">
    <ACol :span="12">
      <div class="tip-font">脚本：</div>
      <CodeMirror v-model="script" theme="darcula" mode="javascript" style="height: 100%" />
    </ACol>
    <ACol :span="12">
      <div class="tip-font">脚本：</div>
      <ATextarea v-model:value="result.data" :style="{height: '100%', color: result.success ? 'black' : 'red'}" />
    </ACol>
  </ARow>
</div>
</template>

<style scoped>

</style>