<script setup lang="ts">
import { JsonEditor } from '@/components/CodeEditor'
import { ref, watch } from 'vue'
import { SwapOutlined } from '@ant-design/icons-vue'
import { useClipboard } from '@/utils/Clipboard'
import { useSessionCache } from '@/utils/CacheData'
import { MonacoDiffEditor, MonacoEditor } from '@/components/monaco'
import DataTransferButton from '@/views/DataTransfer/DataTransferButton.vue'
import AffixButtonGroup from '@/components/AffixButtonGroup.vue'
import { StrUtil } from '@/utils/StrUtil'
import { type ClearOption, useJSONUtil } from '@/views/json/JsonFormat'

const sessionCache = useSessionCache('JsonFormat')

type ViewType = 'MonacoEditor' | 'MonacoDiffEditor' | 'JsonEditor'
type OperateType = 'origin' | 'modify'
const data = ref<{
  view: ViewType;
  originValue: string;
  modifyValue: string;
}>(sessionCache.load() || {
  view: 'MonacoEditor',
  originValue: '',
  modifyValue: ''
})
const clearData = ref<{
  open: boolean;
  operateType: OperateType | null
  options: ClearOption[];
}>({
  open: false,
  operateType: null,
  options: [
    { title: '清理null', key: 'null', checked: true, case: ['"name": null'] },
    { title: '清理空字符串', key: 'string', checked: false, case: ['"name": ""', '"name": " "'] },
    { title: '清理false', key: 'boolean', checked: false, case: ['"isBlank": false'] },
    { title: '清理空对象', key: 'object', checked: false, case: ['"person": {}'] },
    { title: '清理空数组', key: 'array', checked: false, case: ['addresses: []'] },
    { title: '清理指定字段名（正则匹配）', key: 'keyRegExp', checked: false, case: ['AnyFormat: "abcxxx" // 例如Any开头的字段名：^Any.+'], value: '' },
    { title: '清理指定字段值（正则匹配）', key: 'valueRegExp', checked: false, case: ['AnyFormat: "abcxxx" // 例如abc开头的字段值：^abc.+'], value: '' },
  ]
})
const originValue = ref(data.value.originValue)
const modifyValue = ref(data.value.modifyValue)

const originUtil = useJSONUtil(originValue)
const modifyUtil = useJSONUtil(modifyValue)

const clearJson = () => {
  const operateType = clearData.value.operateType
  if (operateType === 'origin') {
    originUtil.clearJson(clearData.value.options)
  } else if (operateType === 'modify') {
    modifyUtil.clearJson(clearData.value.options)
  }
  clearData.value.open = false
  clearData.value.operateType = null
}
watch(() => clearData.value.open, (value) => {
  if (!value) {
    clearData.value.operateType = null
  }
})
watch(() => clearData.value.operateType, (value) => {
  if (value != null) {
    clearData.value.open = true
  }
})

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
                language="json"
                v-model="originValue"
                @change="(value) => data.originValue = value"
                @dblClick="originUtil.formatValidate"
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
                    @originDblClick="originUtil.formatValidate"
                    @modifiedDblClick="modifyUtil.formatValidate"
  >
    <template #title>
      <div class="tip-font">
        Tip：<a @click="async () => {originValue = await useClipboard().pasteText()}">粘贴左边</a>，双击格式化；<a
        @click="async () => {modifyValue = await useClipboard().pasteText()}">粘贴右边</a>，双击格式化。
      </div>
    </template>
  </MonacoDiffEditor>
  <JsonEditor v-if="data.view==='JsonEditor'" v-model="originValue" mode="tree" />
  <a-row>
    <a-col :span="data.view==='MonacoDiffEditor' ? 12 : 24">
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
            }">转GET请求字符串
            </a-menu-item>
          </template>
        </DataTransferButton>
        <a-button @click="clearData.operateType='origin'" size="small">JSON清理</a-button>
        <a-button v-if="data.view === 'MonacoEditor' || data.view === 'MonacoDiffEditor'"
                  @click="data.view = data.view === 'MonacoEditor' ? 'MonacoDiffEditor' : 'MonacoEditor';"
                  type="primary"
                  size="small">
          <template #icon>
            <SwapOutlined />
          </template>
          {{ data.view === 'MonacoEditor' ? '文本对比' : '返回' }}
        </a-button>
        <a-divider type="vertical" v-if="data.view === 'MonacoEditor' || data.view === 'JsonEditor'" />
        <a-button v-if="data.view === 'MonacoEditor' || data.view === 'JsonEditor'"
                  @click="data.view = data.view === 'MonacoEditor' ? 'JsonEditor' : 'MonacoEditor';"
                  type="primary"
                  ghost
                  size="small">
          切换视图
        </a-button>
      </AffixButtonGroup>
    </a-col>
    <a-col :span="data.view==='MonacoDiffEditor' ? 12 : 0" align="right">
      <AffixButtonGroup>
        <a-button type="primary" @click="modifyUtil.formatValidate" size="small">格式化校验</a-button>
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
        <a-dropdown-button @click="modifyUtil.deepDelEscape(true)" size="small" placement="topRight">
          深度去除转义
          <template #overlay>
            <a-menu>
              <a-menu-item key="1" @click="modifyUtil.deepDelEscape(false)">
                不加 [@String]
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown-button>
        <a-button @click="modifyUtil.delEscape" size="small">去除转义</a-button>
        <a-button @click="modifyUtil.escape" size="small">转义</a-button>
        <a-dropdown-button @click="modifyUtil.fieldSort(true)" size="small" placement="topRight">
          字段升序
          <template #overlay>
            <a-menu>
              <a-menu-item key="1" @click="modifyUtil.fieldSort(false)">
                字段降序
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown-button>
        <DataTransferButton :value="modifyValue" :type="'JSON'" :toTypes="['XML', 'YAML', 'TypeScript']">
          <template #button="{finish}">
            <a-menu-item @click="() => {
          const result = modifyUtil.toGetParams();
          if(!result.error) {
            finish(result.value, 'plaintext');
          }
        }">转GET请求字符串
            </a-menu-item>
          </template>
        </DataTransferButton>
        <a-button @click="clearData.operateType='modify'" size="small">JSON清理</a-button>
        <a-button type="primary" @click="data.view = 'MonacoEditor'" size="small">
          <template #icon>
            <SwapOutlined />
          </template>
          返回
        </a-button>
      </AffixButtonGroup>
    </a-col>
  </a-row>
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
      <a-input v-if="option.key === 'keyRegExp' && option.checked"
               v-model:value="option.value"
               size="small"
               placeholder="输入需要匹配的字段名，支持正则，例如Any开头的字段名：^Any.+"
      />
      <a-input v-if="option.key === 'valueRegExp' && option.checked"
               v-model:value="option.value"
               size="small"
               placeholder="输入需要匹配的字段值，支持正则，例如abc开头的字段值：^abc.+"
      />
    </div>
  </a-modal>
</template>

<style scoped></style>