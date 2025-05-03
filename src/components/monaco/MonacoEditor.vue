<script setup lang="ts">
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import 'monaco-editor/esm/vs/editor/editor.main.js'
import { onBeforeUnmount, onMounted, type PropType, ref, unref, watch } from 'vue'
import {
  bindColumnSelectionKey, bindFullScreenKey,
  defaultDiffOptions, defaultHeight,
  dragFileInEditorHandler,
  initMonacoEnvironment,
  type Language,
  type Theme
} from '@/components/monaco/data'
import { handleToggleFullScreen } from '@/utils/FullScreen'
import { DeleteOutlined, FullscreenOutlined, CopyOutlined, SnippetsOutlined } from '@ant-design/icons-vue'
import { getTextFromClipboard, useCopyToClipboard } from '@/utils/useCopyToClipboard'
import { message } from 'ant-design-vue'

const { clipboardRef, copiedRef } = useCopyToClipboard()

const props = defineProps({
  modelValue: { type: String, required: false, default: '' },
  language: { type: String as PropType<Language>, required: false, default: 'kotlin' },
  theme: { type: String as PropType<Theme>, required: false, default: 'vs' },
  showTool: { type: Boolean, required: false, default: true },
  wordWrap: { type: Boolean, required: false, default: false },
  height: { type: String || 'auto', required: false, default: 'auto' },
  options: { type: Object as PropType<monaco.editor.IStandaloneEditorConstructionOptions>, required: false}
})
const emits = defineEmits(['update:modelValue', 'change', 'dblClick'])

const editorRef = ref()
let editor: monaco.editor.IStandaloneCodeEditor
let model: monaco.editor.ITextModel
const wordWrap = ref(props.wordWrap)
watch(() => props.modelValue, value => {
  if (model?.getValue() != value) {
    model?.setValue(value)
  }
})
watch(() => wordWrap.value, value => {
  editor?.updateOptions({
    wordWrap: value ? 'on' : 'off'
  })
})

// 初始化编辑器
onMounted(() => {
  // 初始化环境
  initMonacoEnvironment()

  // 创建编辑器
  editor = monaco.editor.create(editorRef.value, {
    ...props.options,
    ...defaultDiffOptions,
    theme: props.theme, // 主题
    wordWrap: wordWrap.value ? 'on' : 'off', // 自动换行

    placeholder: `请粘贴文本或拖拽文件...

      Ctrl/Cmd + F: 查找
      Alt/Opt + Ctrl/Cmd + F: 替换
      Shift + Ctrl/Cmd + F: 全屏
      Shift + Ctrl/Cmd + D: 列选择模式切换`,
  })
  editor.setModel(model = monaco.editor.createModel(props.modelValue, props.language))
  if (props.modelValue) {
    // 解决创建Model时传入的value与placeholder重叠问题
    model.setValue(props.modelValue)
  }

  // change事件
  model.onDidChangeContent(() => {
    emits('update:modelValue', model.getValue())
    emits('change', model.getValue())
  })

  // dbClick事件
  editor.onMouseDown(e => {
    if (e.event.detail === 2) {
      emits('dblClick', model.getValue())
    }
  })

  // drag事件
  dragFileInEditorHandler(editor)

  // Shift + Ctrl/Cmd + D: 列选择模式切换
  bindColumnSelectionKey(editor)
  // Shift + Ctrl/Cmd + F: 全屏
  bindFullScreenKey(editor, editorRef.value)

  // 高度设置
  if (String(props.height) === 'auto') {
    // contentSizeChange事件
    editor.onDidContentSizeChange(() => {
      editorRef.value.style.height = Math.max(editor.getContentHeight(), defaultHeight) + 'px'
    })
    // 不显示小地图
    editor.updateOptions({
      minimap: {
        enabled: false
      }
    })
  } else {
    editorRef.value.style.height = props.height
  }
})

// 销毁编辑器
onBeforeUnmount(() => editor?.dispose())

// 粘贴
const handlePaste = async () => {
  const value = await getTextFromClipboard()
  if (value) {
    model?.setValue(value)
  }
}
// 复制
const handleCopy = async () => {
  const value = model.getValue()
  if (value) {
    clipboardRef.value = value
    if (unref(copiedRef)) {
      message.success('复制成功')
    }
  }
}
// 清除
const handleClearText = () => {
  model?.setValue('')
}
</script>

<template>
  <a-row align="middle">
    <a-col>
      <slot name="title" />
    </a-col>
    <a-col v-if="showTool" flex="auto" align="right">
      <a-space>
        <a-tooltip title="粘贴">
          <a @click="handlePaste()">
            <SnippetsOutlined />
          </a>
        </a-tooltip>
        <a-tooltip title="复制">
          <a @click="handleCopy()">
            <CopyOutlined />
          </a>
        </a-tooltip>
        <a-tooltip title="清除">
          <a @click="handleClearText()">
            <DeleteOutlined />
          </a>
        </a-tooltip>
        <a-tooltip title="全屏">
          <a @click="handleToggleFullScreen(editorRef)">
            <FullscreenOutlined />
          </a>
        </a-tooltip>
        <a-switch v-model:checked="wordWrap"
                  checked-children="Wrap"
                  un-checked-children="UnWrap"
                  size="small"
        />
      </a-space>
    </a-col>
  </a-row>
  <a-divider style="margin: 10px 0" />
  <div ref="editorRef" v-bind="$attrs" class="a-monaco-editor" />
</template>

<style scoped>
.a-monaco-editor {
  border: 1px solid #DDDDDD;
}
</style>