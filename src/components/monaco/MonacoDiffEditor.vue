<script setup lang="ts">
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import 'monaco-editor/esm/vs/editor/editor.main.js'

import { onBeforeUnmount, onMounted, type PropType, ref, watch } from 'vue'
import { handleToggleFullScreen } from '@/utils/FullScreen'
import {
  defaultDiffOptions,
  dragFileInEditorHandler,
  initMonacoEnvironment,
  type Language,
  type Theme,
} from './data'
import { FullscreenOutlined, DeleteOutlined, ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons-vue'

const props = defineProps({
  originValue: { type: String, required: false, default: '' },
  modifiedValue: { type: String, required: false, default: '' },
  showTool: { type: Boolean, required: false, default: false },
  language: { type: String as PropType<Language>, required: false, default: 'kotlin' },
  theme: { type: String as PropType<Theme>, required: false, default: 'vs' }
})
const emits = defineEmits(['update:originValue', 'update:modifiedValue', 'originChange', 'modifiedChange', 'originDblClick', 'modifiedDblClick'])

const editorRef = ref()
let editor: monaco.editor.IStandaloneDiffEditor
let originModel: monaco.editor.ITextModel
let modifiedModel: monaco.editor.ITextModel
const showDiff = ref<boolean>(false) // 是否只显示差异
const side = ref<boolean>(true) // 是否分栏
const wordWrap = ref<boolean>(false) // 是否自动换行
const diffCount = ref<number>(0) // 差异个数

watch(() => props.originValue, value => {
  if (originModel?.getValue() != value) {
    originModel?.setValue(value)
  }
})
watch(() => props.modifiedValue, value => {
  if (modifiedModel?.getValue() != value) {
    modifiedModel?.setValue(value)
  }
})
watch(() => showDiff.value, value => editor?.updateOptions({ hideUnchangedRegions: { enabled: value } }))
watch(() => side.value, value => editor?.updateOptions({ renderSideBySide: value }))
watch(() => wordWrap.value, value => editor?.updateOptions({
  diffWordWrap: value ? 'on' : 'off',
  wordWrap: value ? 'on' : 'off'
}))

// 初始化编辑器
onMounted(() => {
  // 初始化环境
  initMonacoEnvironment()

  // 创建对比编辑器
  editor = monaco.editor.createDiffEditor(editorRef.value, {
    ...defaultDiffOptions,
    theme: props.theme, // 主题
    renderSideBySide: side.value, // 是否side模式
    hideUnchangedRegions: { // 隐藏未变更区域
      enabled: showDiff.value,
      revealLineCount: 1,
      minimumLineCount: 1,
      contextLineCount: 1
    },
    placeholder: '请粘贴文本或拖拽文件...'
  })

  editor.setModel({
    original: (originModel = monaco.editor.createModel(props.originValue, props.language)),
    modified: (modifiedModel = monaco.editor.createModel(props.modifiedValue, props.language))
  })

  // change事件
  originModel.onDidChangeContent(() => {
    emits('update:originValue', originModel.getValue())
    emits('originChange', originModel.getValue())
  })
  modifiedModel.onDidChangeContent(() => {
    emits('update:modifiedValue', modifiedModel.getValue())
    emits('modifiedChange', modifiedModel.getValue())
  })
  // dblclick事件
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
  // drag事件
  dragFileInEditorHandler(editor.getOriginalEditor())
  dragFileInEditorHandler(editor.getModifiedEditor())

  // 更新事件
  editor.onDidUpdateDiff(() => diffCount.value = editor.getLineChanges()?.length || 0)
})

// 销毁编辑器
onBeforeUnmount(() => editor?.dispose())

// 清空编辑器内容
const handleClearText = () => {
  originModel.setValue('')
  modifiedModel.setValue('')
}
// editor刚初始化时第一次点击不会收缩相同的行，模拟点击两次按钮
let showDiffClickNum = 0
const handleShowDiffHandler = () => {
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
      <a v-if="diffCount>0" @click="editor.goToDiff('previous')">
        <ArrowLeftOutlined />
      </a>
      <span v-if="props.originValue || props.modifiedValue"
            :style="{color: diffCount>0?'red':'green'}"
            class="un-select">{{ diffCount > 0 ? '存在' + diffCount + '处差异' : '完全相同'
        }}</span>
      <a v-if="diffCount>0" @click="editor.goToDiff('next')">
        <ArrowRightOutlined />
      </a>
      <a-divider type="vertical" />
    </a-space>
    <a-space>
      <a @click="handleToggleFullScreen(editorRef)">
        <FullscreenOutlined />
        全屏
      </a>
      <a @click="handleClearText()">
        <DeleteOutlined />
        清除
      </a>
      <a-switch v-model:checked="showDiff" checked-children="Diff" un-checked-children="All"
                @change="handleShowDiffHandler" />
      <a-switch v-model:checked="side" checked-children="Side" un-checked-children="UnSide" />
      <a-switch v-model:checked="wordWrap" checked-children="Wrap" un-checked-children="UnWrap" />
    </a-space>
  </a-flex>
  <a-divider style="margin: 10px 0" />
  <div ref="editorRef" style="height: 100px" v-bind="$attrs"/>
</template>

<style scoped></style>