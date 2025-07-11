<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import './Context'
import { useClipboard } from '@/utils/Clipboard'
import { useSessionCache } from '@/utils/CacheData'
import { MonacoEditor } from '@/components/monaco'
import { Icon } from '@/components/icon'
import * as prettier from 'prettier/standalone'
import * as parserBabel from 'prettier/parser-babel'
import * as prettierPluginEstree from 'prettier/plugins/estree'
// @ts-ignore
import contextText from './Context.ts?raw'
import { StrUtil } from '@/utils/StrUtil'

const sessionCache = useSessionCache('JSRunner')

const props = defineProps({ modelValue: String })
const pageData = ref({
  help: {
    open: false,
    value: computed(() => {
      const s = '/*------------------------------------------------------------------------------------------------------------------------------------------*/'
      return contextText.substring(contextText.indexOf(s) + s.length + 1)
    })
  }
})
const script = ref<string>(props.modelValue || sessionCache.load() || '')
const result = ref<{ data: any; success: boolean; }>({ data: '', success: true })
watch(() => props.modelValue, (value) => script.value = value || '')

const formatCode = async (code: string): Promise<string> => {
  if (!code) {
    return ''
  }
  return await prettier.format(code, {
    parser: 'babel',
    plugins: [parserBabel, prettierPluginEstree],
    arrowParens: 'always',
    bracketSameLine: false,
    bracketSpacing: true,
    semi: true,
    experimentalTernaries: false,
    singleQuote: true,
    jsxSingleQuote: false,
    quoteProps: 'as-needed',
    trailingComma: 'all',
    singleAttributePerLine: false,
    htmlWhitespaceSensitivity: 'css',
    vueIndentScriptAndStyle: false,
    proseWrap: 'preserve',
    insertPragma: false,
    printWidth: 80,
    requirePragma: false,
    tabWidth: 2,
    useTabs: false,
    embeddedLanguageFormatting: 'auto'
  })
}

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
    <MonacoEditor v-model="script" @change="sessionCache.cache" theme="vs-dark" language="javascript"
                  height="calc(100vh - 400px)">
      <template #title>
        <a-flex align="center" gap="middle">
          <div class="tip-font">
            脚本：
            <a-flex gap="small" style="display: inline-flex">
              <a @click="async () => {script = await useClipboard().pasteText()}">粘贴脚本</a>
              <a @click="async () => {script = await formatCode(script)}">格式化</a>
              <a @click="async () => {script = StrUtil.compress(script)}">压缩</a>
            </a-flex>
          </div>
          <a-button type="primary" @click="handleRunner" size="small">运行脚本</a-button>
          <a-tooltip title="Help">
            <a>
              <Icon icon="material-symbols:help-outline" @click="pageData.help.open = true" />
            </a>
          </a-tooltip>
        </a-flex>
      </template>
    </MonacoEditor>
    <div class="tip-font">运行结果：</div>
    <a-textarea v-model:value="result.data" :style="{color: result.success ? 'black' : 'red'}" readonly />
    <a-modal title="Help" v-model:open="pageData.help.open" :footer="null" width="80vw">
      <MonacoEditor v-model="pageData.help.value" read-only :show-tool="false" theme="vs-dark" language="typescript" />
    </a-modal>
  </a-space>
</template>

<style scoped></style>