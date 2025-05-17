<script setup lang="ts">
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import 'monaco-editor/esm/vs/editor/editor.main.js'
import { onBeforeUnmount, onMounted, type PropType, ref, watch } from 'vue'
import {
  bindKey,
  defaultDiffOptions,
  defaultHeight,
  dragFileInEditorHandler,
  initMonacoEnvironment,
  type Language,
  type Theme
} from '@/components/monaco/data'
import { handleToggleFullScreen } from '@/utils/FullScreen'
import { DeleteOutlined, FullscreenOutlined, CopyOutlined, SnippetsOutlined } from '@ant-design/icons-vue'
import { useClipboard } from '@/utils/Clipboard'

const props = defineProps({
  modelValue: { type: String, required: false, default: '' },
  language: { type: String as PropType<Language>, required: false, default: 'kotlin' },
  theme: { type: String as PropType<Theme>, required: false, default: 'vs' },
  readOnly: { type: Boolean, required: false, default: false },
  showTool: { type: Boolean, required: false, default: true },
  wordWrap: { type: Boolean, required: false, default: false },
  minimap: { type: Boolean, required: false, default: true },
  lineNumbers: { type: Boolean, required: false, default: true },
  height: { type: String || 'auto', required: false, default: 'auto' },
  placeholder: { type: String, required: false },
  options: { type: Object as PropType<monaco.editor.IStandaloneEditorConstructionOptions>, required: false }
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
watch(() => props.language, value => {
  if (model) {
    monaco.editor.setModelLanguage(model, value)
  }
})
watch(() => props.theme, value => {
  editor?.updateOptions({
    theme: value
  })
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
    ...defaultDiffOptions,
    theme: props.theme, // 主题
    readOnly: props.readOnly,
    wordWrap: wordWrap.value ? 'on' : 'off', // 自动换行
    minimap: {
      enabled: props.minimap
    },
    renderLineHighlight: props.readOnly ? 'none' : 'all', // 启用当前行高亮显示的呈现
    lineNumbers: props.lineNumbers ? 'on' : 'off', // 显示行号
    placeholder: props.readOnly ? '' : props.placeholder || defaultDiffOptions.placeholder,
    ...props.options
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

  if (!props.readOnly) {
    // drag事件
    dragFileInEditorHandler(editor)
  }

  // 绑定键盘事件
  bindKey(editor, editorRef.value)

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
  const value = await useClipboard().pasteText()
  if (value) {
    model?.setValue(value)
  }
}
// 复制
const handleCopy = async () => {
  const value = model.getValue()
  if (value) {
    useClipboard().copyText(value)
  }
}
// 清除
const handleClearText = () => {
  model?.setValue('')
}
</script>

<template>
  <a-flex vertical gap="small">
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
    <div ref="editorRef" v-bind="$attrs" class="a-monaco-editor" />
  </a-flex>
</template>

<style scoped>
.a-monaco-editor {
  border: 1px solid #DDDDDD;
}
</style>