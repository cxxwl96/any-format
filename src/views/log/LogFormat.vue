<script setup lang="ts">
import { SettingOutlined, SwapOutlined } from '@ant-design/icons-vue'
import { type Ref, ref, toRaw, unref, watch } from 'vue'
import useFormat from './Format'
import LogFormatSetting from '@/views/log/LogFormatSetting.vue'
import { useSessionCache } from '@/utils/CacheData'
import { MonacoDiffEditor, MonacoEditor } from '@/components/monaco'
import { useClipboard } from '@/utils/Clipboard'
import AffixButtonGroup from "@/components/AffixButtonGroup.vue";
import ToString2Json from '@/views/log/ToString2Json.vue'

const sessionCacheOrigin = useSessionCache('LogFormat_Origin')
const sessionCacheModified = useSessionCache('LogFormat_Modified')
const sessionCacheShowDiff = useSessionCache('LogFormat_ShowDiff')

const settingRef = ref()
const showToString2Json = ref<boolean>()
const showSetting = ref<boolean>()
const showDiff = ref<boolean>(sessionCacheShowDiff.load())
const originValue = ref<string>(sessionCacheOrigin.load())
const modifiedValue = ref<string>(sessionCacheModified.load())

watch(() => showDiff.value, (value) => sessionCacheShowDiff.cache(value))

// 双击格式化
function originDblClickHandler(value: string) {
  dblClickHandler(value, originValue)
}

function modifiedDblClickHandler(value: string) {
  dblClickHandler(value, modifiedValue)
}

function dblClickHandler(value: string, target: Ref<string>) {
  const format = useFormat({ ...toRaw(settingRef.value.getConfig()) }).anyFormat(unref(value))
  if (format != value) {
    target.value = ''
    setTimeout(() => {
      target.value = format
    }, 1)
  }
}
</script>

<template>
  <MonacoEditor v-if="!showDiff"
                v-model="originValue"
                @dblClick="originDblClickHandler"
                @change="sessionCacheOrigin.cache"
  >
    <template #title>
      <div class="tip-font">
        Tip：<a @click="async () => {originValue = await useClipboard().pasteText()}">粘贴文本</a>，双击格式化
      </div>
    </template>
  </MonacoEditor>
  <MonacoDiffEditor v-else
                    v-model:origin-value="originValue"
                    v-model:modified-value="modifiedValue"
                    @originChange="sessionCacheOrigin.cache"
                    @modifiedChange="sessionCacheModified.cache"
                    @originDblClick="originDblClickHandler"
                    @modifiedDblClick="modifiedDblClickHandler"
  >
    <template #title>
      <div class="tip-font">
        Tip：<a @click="async () => {originValue = await useClipboard().pasteText()}">粘贴左边</a>，双击格式化；<a
        @click="async () => {modifiedValue = await useClipboard().pasteText()}">粘贴右边</a>，双击格式化。
      </div>
    </template>
  </MonacoDiffEditor>
  <AffixButtonGroup>
    <a-button v-if="!showDiff" @click="showToString2Json=true" type="ghost" size="small">ToString转JSON</a-button>
    <a-divider v-if="!showDiff" type="vertical" />
    <a-button type="ghost" @click="showSetting=true" size="small">
      <template #icon>
        <SettingOutlined />
      </template>
      设置
    </a-button>
    <a-divider type="vertical" />
    <a-button type="primary" @click="showDiff=!showDiff" size="small">
      <template #icon>
        <SwapOutlined />
      </template>
      {{ showDiff ? '返回' : '文本对比' }}
    </a-button>
  </AffixButtonGroup>
  <LogFormatSetting ref="settingRef" v-model:show="showSetting" />
  <ToString2Json v-model:show="showToString2Json" v-model:value="originValue"/>
</template>

<style scoped></style>