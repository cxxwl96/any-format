<script setup lang="ts">
import { MonacoDiffEditor } from '@/components/monaco'
import { ref } from 'vue'
import { useClipboard } from '@/utils/Clipboard'
import { useSession } from '@/utils/CacheData'

const originSessionCache = useSession('TextComparator', 'origin')
const modifySessionCache = useSession('TextComparator', 'modify')

const data = ref({
  originValue: originSessionCache.load() || '',
  modifiedValue: modifySessionCache.load() || ''
})
</script>

<template>
  <MonacoDiffEditor v-model:origin-value="data.originValue"
                    v-model:modified-value="data.modifiedValue"
                    @originChange="originSessionCache.cache(data.originValue)"
                    @modifiedChange="modifySessionCache.cache(data.modifiedValue)"
                    height="calc(100vh - 250px)"
  >
    <template #title>
      <div class="tip-font">
        Tip：<a @click="async () => {data.originValue = await useClipboard().pasteText()}">粘贴左边</a>，<a
        @click="async () => {data.modifiedValue = await useClipboard().pasteText()}">粘贴右边</a>
      </div>
    </template>
  </MonacoDiffEditor>
</template>

<style scoped></style>