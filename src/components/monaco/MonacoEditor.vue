<script setup lang="ts">
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import 'monaco-editor/esm/vs/editor/editor.main.js'
import { onBeforeUnmount, onMounted, type PropType, ref, watch } from 'vue'
import {
  defaultDiffOptions,
  dragFileInEditorHandler,
  initMonacoEnvironment,
  type Language,
  type Theme,
} from '@/components/monaco/data'
import { handleToggleFullScreen } from '@/utils/FullScreen'
import { DeleteOutlined, FullscreenOutlined } from '@ant-design/icons-vue'

const props = defineProps({
  value: { type: String, required: false, default: '' },
  showTool: { type: Boolean, required: false, default: false },
  language: { type: String as PropType<Language>, required: false, default: 'kotlin' },
  theme: { type: String as PropType<Theme>, required: false, default: 'vs' }
})
const emits = defineEmits(['update:value', 'change', 'dblClick'])

const editorRef = ref()
let editor: monaco.editor.IStandaloneCodeEditor
let model: monaco.editor.ITextModel
const wordWrap = ref<boolean>(false) // 是否自动换行
watch(() => props.value, value => {
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
    ...defaultDiffOptions,
    theme: props.theme, // 主题
    placeholder: '请粘贴文本或拖拽文件...'
  })
  editor.setModel(model = monaco.editor.createModel(props.value, props.language))

  // change事件
  model.onDidChangeContent(() => {
    emits('update:value', model.getValue())
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
})

// 销毁编辑器
onBeforeUnmount(() => editor?.dispose())

// 清空编辑器内容
const handleClearText = () => {
  model?.setValue('')
}
</script>

<template>
  <div style="float: left">
    <slot name="toolTip" />
  </div>
  <a-flex justify="flex-end" align="center" v-if="showTool">
    <a-space>
      <a @click="handleToggleFullScreen(editorRef)">
        <FullscreenOutlined />
        全屏
      </a>
      <a @click="handleClearText()">
        <DeleteOutlined />
        清除
      </a>
      <a-switch v-model:checked="wordWrap" checked-children="Wrap" un-checked-children="UnWrap" />
    </a-space>
  </a-flex>
  <div ref="editorRef" v-bind="$attrs" style="min-height: 100px" />
</template>

<style scoped>

</style>