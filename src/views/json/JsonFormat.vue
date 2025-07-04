<script setup lang="ts">
import { JsonEditor } from '@/components/CodeEditor'
import { ref } from 'vue'
import { SwapOutlined } from '@ant-design/icons-vue'
import { useClipboard } from '@/utils/Clipboard'
import { useSessionCache } from '@/utils/CacheData'
import { MonacoEditor } from '@/components/monaco'
import DataTransferButton from '@/views/DataTransfer/DataTransferButton.vue'
import AffixButtonGroup from '@/components/AffixButtonGroup.vue'
import { StrUtil } from '@/utils/StrUtil'
import { clearData, useJSONUtil } from '@/views/json/JsonFormat'

const sessionCache = useSessionCache('JsonFormat')

const data = ref({
  monacoView: true, // 切换视图
  diffView: false, // 比较视图
  originValue: '',
  modifyValue: ''
})
const originValue = ref('')
const modifyValue = ref('')

const originUtil = useJSONUtil(originValue)
const modifyUtil = useJSONUtil(modifyValue)

const clearJson = () => {
  originUtil.clearJson(clearData.value.options);
  clearData.value.open = false;
}

</script>

<template>
  <MonacoEditor v-if="data.monacoView" language="json" v-model="originValue" @change="sessionCache.cache"
                @dblClick="originUtil.formatValidate">
    <template #title>
      <div class="tip-font">
        Tip：<a @click="async () => {originValue = await useClipboard().pasteText()}">粘贴文本</a>，双击格式化
      </div>
    </template>
  </MonacoEditor>
  <JsonEditor v-else v-model="originValue" mode="tree" />
  <AffixButtonGroup>
    <a-button type="primary" @click="originUtil.formatValidate" size="small">格式化校验</a-button>
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
    <a-dropdown-button @click="originUtil.deepDelEscape(true)" size="small" placement="topRight">
      深度去除转义
      <template #overlay>
        <a-menu>
          <a-menu-item key="1" @click="originUtil.deepDelEscape(false)">
            不加 [@String]
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown-button>
    <a-button @click="originUtil.delEscape" size="small">去除转义</a-button>
    <a-button @click="originUtil.escape" size="small">转义</a-button>
    <a-dropdown-button @click="originUtil.fieldSort(true)" size="small" placement="topRight">
      字段升序
      <template #overlay>
        <a-menu>
          <a-menu-item key="1" @click="originUtil.fieldSort(false)">
            字段降序
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown-button>
    <DataTransferButton :value="originValue" :type="'JSON'" :toTypes="['XML', 'YAML', 'TypeScript']">
      <template #button="{finish}">
        <a-menu-item @click="() => {
          const result = originUtil.toGetParams();
          if(!result.error) {
            finish(result.value, 'plaintext');
          }
        }">转GET请求字符串</a-menu-item>
      </template>
    </DataTransferButton>
    <a-button @click="clearData.open=true" size="small">JSON清理</a-button>
    <a-divider type="vertical" />
    <a-button type="primary" @click="data.monacoView = !data.monacoView" size="small">
      <template #icon>
        <SwapOutlined />
      </template>
      切换视图
    </a-button>
  </AffixButtonGroup>
  <a-modal title="清理设置"
           v-model:open="clearData.open"
           @ok="clearJson"
           cancel-text="关闭"
           ok-text="开始清理"
           :cancel-button-props="{size: 'small'}"
           :ok-button-props="{size: 'small'}"
           width="650px"
  >
    <div v-for="option in clearData.options" :key="option.title">
      <a-flex style="margin: 5px 0">
        <a-checkbox v-model:checked="option.checked">{{ option.title }}</a-checkbox>
        <a-tag v-for="ca in option.case" :key="ca" color="geekblue">
          {{ ca }}
        </a-tag>
      </a-flex>
      <a-input v-if="option.key === 'regexp' && option.checked" v-model:value="option.value" size="small" placeholder="例如abc开头的字段值：^abc.+"/>
    </div>
  </a-modal>
</template>

<style scoped></style>