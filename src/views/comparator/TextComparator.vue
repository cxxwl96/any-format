<script setup lang="ts">
import { MonacoDiffEditor } from '@/components/monaco'
import { ref } from 'vue'
import { getTextFromClipboard } from '@/utils/useCopyToClipboard'

const originValue = ref('')
const modifiedValue = ref('')
</script>

<template>
  <div class="content-top-blank">
    <MonacoDiffEditor v-model:origin-value="originValue" v-model:modified-value="modifiedValue" show-tool>
      <template #toolTip>
        <div class="tip-font">
          Tip：<a @click="async () => {originValue = await getTextFromClipboard()}">粘贴左边</a>，<a
          @click="async () => {modifiedValue = await getTextFromClipboard()}">粘贴右边</a>
        </div>
      </template>
    </MonacoDiffEditor>
  </div>
</template>

<style scoped></style>