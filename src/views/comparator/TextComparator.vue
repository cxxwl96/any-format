<script setup lang="ts">
import { MonacoDiffEditor } from '@/components/monaco'
import { ref } from 'vue'
import { getTextFromClipboard } from '@/utils/useCopyToClipboard'

const originValue = ref('')
const modifiedValue = ref('')
</script>

<template>
  <MonacoDiffEditor v-model:origin-value="originValue" v-model:modified-value="modifiedValue">
    <template #title>
      <div class="tip-font">
        Tip：<a @click="async () => {originValue = await getTextFromClipboard()}">粘贴左边</a>，<a
        @click="async () => {modifiedValue = await getTextFromClipboard()}">粘贴右边</a>
      </div>
    </template>
  </MonacoDiffEditor>
</template>

<style scoped></style>