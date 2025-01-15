<script setup lang="ts">
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import 'monaco-editor/esm/vs/editor/editor.main.js'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { toggleFullScreen } from '@/utils/FullScreen'
import { defaultDiffOptions, THEME } from './data'

const props = defineProps({
  originValue: { type: String, required: false, default: '' },
  modifiedValue: { type: String, required: false, default: '' },
  showTool: { type: Boolean, required: false, default: false },
  language: { type: String, required: false, default: 'json' },
  theme: { type: String, required: false, default: THEME.VS }
})
const emits = defineEmits(['update:originValue', 'update:modifiedValue', 'originDblClick', 'modifiedDblClick'])

const editorRef = ref()
let editor: monaco.editor.IStandaloneDiffEditor
let originModel: monaco.editor.ITextModel
let modifiedModel: monaco.editor.ITextModel
const originValue = ref<string>(props.originValue)
const modifiedValue = ref<string>(props.modifiedValue)
const showDiff = ref<boolean>(false)
const side = ref<boolean>(true)
const wordWrap = ref<boolean>(false)

// 初始化编辑器
onMounted(() => initDiffEditor())
// 销毁编辑器
onBeforeUnmount(() => editor?.dispose())

watch(() => props.originValue, value => {
  if (originValue.value != value) {
    originModel?.setValue(value)
  }
})
watch(() => props.modifiedValue, value => {
  if (modifiedValue.value != value) {
    modifiedModel?.setValue(value)
  }
})
watch(() => showDiff.value, value => editor?.updateOptions({ hideUnchangedRegions: { enabled: value } }))
watch(() => side.value, value => editor?.updateOptions({ renderSideBySide: value }))
watch(() => wordWrap.value, value => editor?.updateOptions({
  diffWordWrap: value ? 'on' : 'off',
  wordWrap: value ? 'on' : 'off'
}))

const initDiffEditor = () => {
  // 初始化环境
  self.MonacoEnvironment = {
    getWorker(_, label) {
      if (label === 'json') {
        return new jsonWorker()
      }
      if (label === 'css' || label === 'scss' || label === 'less') {
        return new cssWorker()
      }
      if (label === 'html' || label === 'handlebars' || label === 'razor') {
        return new htmlWorker()
      }
      if (label === 'typescript' || label === 'javascript') {
        return new tsWorker()
      }
      return new editorWorker()
    }
  }

  editor = monaco.editor.createDiffEditor(editorRef.value, {
    ...defaultDiffOptions,
    theme: props.theme, // 主题
    renderSideBySide: side.value, // 是否side模式
    hideUnchangedRegions: { // 隐藏未变更区域
      enabled: showDiff.value,
      revealLineCount: 1,
      minimumLineCount: 1,
      contextLineCount: 1
    }
  })

  originModel = monaco.editor.createModel(props.originValue, props.language)
  modifiedModel = monaco.editor.createModel(props.modifiedValue, props.language)

  editor.setModel({
    original: originModel,
    modified: modifiedModel
  })

  // 更新文本
  originModel.onDidChangeContent(() => {
    originValue.value = originModel.getValue()
    emits('update:originValue', originModel.getValue())
  })
  modifiedModel.onDidChangeContent(() => {
    modifiedValue.value = modifiedModel.getValue()
    emits('update:modifiedValue', modifiedModel.getValue())
  })
  // 双击事件
  editor.getOriginalEditor().onMouseDown(e => {
    if (e.event.detail === 2) {
      emits('originDblClick', originModel.getValue())
    }
  })
  editor.getModifiedEditor().onMouseDown(e => {
    if (e.event.detail === 2) {
      emits('modifiedDblClick', modifiedModel.getValue())
    }
  })
}
// editor刚初始化时第一次点击不会收缩相同的行，模拟点击两次按钮
let showDiffClickNum = 0
const showDiffHandler = () => {
  if (showDiff.value && showDiffClickNum == 0) {
    setTimeout(() => {
      showDiff.value = false
      setTimeout(() => showDiff.value = true, 100)
    }, 100)
    showDiffClickNum++
  }
}
</script>

<template>
  <div style="float: left">
    <slot name="toolTip" />
  </div>
  <a-flex justify="flex-end" align="center" v-if="showTool">
    <a-space>
      <a-button type="link" @click="toggleFullScreen(editorRef)">全屏</a-button>
      <a-switch v-model:checked="showDiff" checked-children="Diff" un-checked-children="All"
                @change="showDiffHandler" />
      <a-switch v-model:checked="side" checked-children="Side" un-checked-children="UnSide" />
      <a-switch v-model:checked="wordWrap" checked-children="Wrap" un-checked-children="UnWrap" />
    </a-space>
  </a-flex>
  <a-divider style="margin: 10px 0" />
  <div ref="editorRef" v-bind="$attrs" style="height: calc(100vh - 200px)" />
</template>

<style scoped></style>