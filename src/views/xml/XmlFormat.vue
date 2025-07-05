<script setup lang="ts">
import { ref, watch } from 'vue'
import { useClipboard } from '@/utils/Clipboard'
import { useSessionCache } from '@/utils/CacheData'
import { MonacoDiffEditor, MonacoEditor } from '@/components/monaco'
import DataTransferButton from '@/views/DataTransfer/DataTransferButton.vue'
import AffixButtonGroup from "@/components/AffixButtonGroup.vue";
import { StrUtil } from '@/utils/StrUtil'
import { useXMLUtil } from '@/views/xml/XmlFormat'
import { SwapOutlined } from '@ant-design/icons-vue'

const sessionCache = useSessionCache('XmlFormat')
const data = ref<{
  view: 'MonacoEditor' | 'MonacoDiffEditor';
  originValue: string;
  modifyValue: string;
}>(sessionCache.load() || {
  view: 'MonacoEditor',
  originValue: '',
  modifyValue: ''
})
const originValue = ref(data.value.originValue)
const modifyValue = ref(data.value.modifyValue)

const originUtil = useXMLUtil(originValue)
const modifyUtil = useXMLUtil(modifyValue)

watch(
  () => data.value,
  (value) => {
    sessionCache.cache(value)
  },
  { deep: true }
)
</script>

<template>
  <MonacoEditor v-if="data.view==='MonacoEditor'"
                language="xml"
                v-model="originValue"
                @change="(value) => data.originValue = value"
                @dblClick="originUtil.format"
  >
    <template #title>
      <div class="tip-font">
        Tip：<a @click="async () => {originValue = await useClipboard().pasteText()}">粘贴文本</a>，双击格式化
      </div>
    </template>
  </MonacoEditor>
  <MonacoDiffEditor v-if="data.view==='MonacoDiffEditor'"
                    v-model:origin-value="originValue"
                    v-model:modified-value="modifyValue"
                    @originChange="(value) => data.originValue = value"
                    @modifiedChange="(value) => data.modifyValue = value"
                    @originDblClick="originUtil.format"
                    @modifiedDblClick="modifyUtil.format"
  >
    <template #title>
      <div class="tip-font">
        Tip：<a @click="async () => {originValue = await useClipboard().pasteText()}">粘贴左边</a>，双击格式化；<a
        @click="async () => {modifyValue = await useClipboard().pasteText()}">粘贴右边</a>，双击格式化。
      </div>
    </template>
  </MonacoDiffEditor>
  <a-row>
    <a-col :span="data.view==='MonacoDiffEditor' ? 12 : 24">
      <AffixButtonGroup>
        <a-button type="primary" @click="originUtil.format" size="small">格式化</a-button>
        <a-dropdown-button @click="originUtil.compress" size="small" placement="topRight">
          压缩
          <template #overlay>
            <a-menu>
              <a-menu-item key="1" @click="originValue = StrUtil.compress(originValue)">
                文本压缩
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown-button>
        <a-dropdown-button @click="originUtil.sort(true)" size="small" placement="topRight">
          节点升序
          <template #overlay>
            <a-menu>
              <a-menu-item key="1" @click="originUtil.sort(false)">
                节点降序
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown-button>
        <DataTransferButton :value="originValue" :type="'XML'" :toTypes="['JSON', 'YAML']" />
        <a-button @click="data.view = data.view === 'MonacoEditor' ? 'MonacoDiffEditor' : 'MonacoEditor';"
                  type="primary"
                  size="small">
          <template #icon>
            <SwapOutlined />
          </template>
          {{ data.view === 'MonacoEditor' ? '文本对比' : '返回' }}
        </a-button>
      </AffixButtonGroup>
    </a-col>
    <a-col :span="data.view==='MonacoDiffEditor' ? 12 : 0" align="right">
      <AffixButtonGroup>
        <a-button type="primary" @click="modifyUtil.format" size="small">格式化</a-button>
        <a-dropdown-button @click="modifyUtil.compress" size="small" placement="topRight">
          压缩
          <template #overlay>
            <a-menu>
              <a-menu-item key="1" @click="modifyValue = StrUtil.compress(modifyValue)">
                文本压缩
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown-button>
        <a-dropdown-button @click="modifyUtil.sort(true)" size="small" placement="topRight">
          节点升序
          <template #overlay>
            <a-menu>
              <a-menu-item key="1" @click="modifyUtil.sort(false)">
                节点降序
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown-button>
        <DataTransferButton :value="modifyValue" :type="'XML'" :toTypes="['JSON', 'YAML']" />
        <a-button type="primary" @click="data.view = 'MonacoEditor'" size="small">
          <template #icon>
            <SwapOutlined />
          </template>
          返回
        </a-button>
      </AffixButtonGroup>
    </a-col>
  </a-row>
</template>

<style scoped></style>