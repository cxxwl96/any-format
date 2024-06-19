<script setup lang="ts">
import { ref, unref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import CodeMirror from 'codemirror'
import { MODE, type Nullable, THEME } from '@/data'

import './codemirror.css'
// modes
import 'codemirror/addon/comment/comment'
import 'codemirror/addon/dialog/dialog.css'
import 'codemirror/addon/dialog/dialog'
import 'codemirror/addon/display/autorefresh'
import 'codemirror/addon/edit/closebrackets'
import 'codemirror/addon/edit/closetag'
import 'codemirror/addon/edit/matchbrackets'
import 'codemirror/addon/fold/brace-fold'
import 'codemirror/addon/fold/comment-fold'
import 'codemirror/addon/fold/foldcode'
import 'codemirror/addon/fold/foldgutter.css'
import 'codemirror/addon/fold/foldgutter'
import 'codemirror/addon/fold/indent-fold'
import 'codemirror/addon/fold/markdown-fold'
import 'codemirror/addon/fold/xml-fold'
import 'codemirror/addon/lint/coffeescript-lint'
import 'codemirror/addon/lint/css-lint'
// import 'codemirror/addon/lint/html-lint';
// import 'codemirror/addon/lint/javascript-lint';
// import 'codemirror/addon/lint/json-lint';
import 'codemirror/addon/lint/lint.css'
import 'codemirror/addon/lint/lint'
import 'codemirror/addon/lint/yaml-lint'
import 'codemirror/addon/scroll/annotatescrollbar'
// 关闭搜索功能
// import 'codemirror/addon/search/search'
// import 'codemirror/addon/search/searchcursor'
// import 'codemirror/addon/search/jump-to-line'
// import 'codemirror/addon/search/matchesonscrollbar.css'
// import 'codemirror/addon/search/matchesonscrollbar'
import 'codemirror/addon/selection/active-line' //光标行背景高亮，配置里面也需要styleActiveLine设置为true
import 'codemirror/keymap/sublime'
// import 'codemirror/lib/codemirror.css'; // 会让maxHeight失效
import 'codemirror/mode/vue/vue'
import 'codemirror/mode/css/css'
import 'codemirror/mode/sql/sql'
import 'codemirror/mode/xml/xml'
import 'codemirror/mode/clike/clike'
import 'codemirror/mode/htmlmixed/htmlmixed'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/theme/idea.css'
import 'codemirror/theme/material-palenight.css'
import { isMacOs, isWindowOs } from '@/utils/is'

const props = defineProps({
  value: { type: String },
  mode: { type: String, default: MODE.JSON },
  readonly: { type: Boolean, default: false },
  tabSize: { type: Number, default: 4 },
  theme: { type: String, default: THEME.light },
  lineWrapping: { type: Boolean, default: false },
  showCopyButton: { type: Boolean, default: false }, // TODO
  fontSize: { type: Number, default: 14 }
})
const emits = defineEmits(['change', 'blur', 'dblclick'])

const el = ref()
let editor: Nullable<CodeMirror.Editor>

watch(
  () => props.value,
  async (value) => {
    await nextTick()
    const oldValue = editor?.getValue()
    if (value != oldValue) {
      editor?.setValue(value ? value : '')
    }
  },
  { flush: 'post' }
)
watch(
  () => props.theme,
  async (value) => {
    await nextTick()
    unref(editor)?.setOption('theme', value || THEME.light)
  },
  { flush: 'post' }
)


async function init() {
  editor = CodeMirror(el.value!, {
    value: '',
    mode: props.mode,
    readOnly: props.readonly,
    tabSize: props.tabSize,
    theme: props.theme,
    lineWrapping: props.lineWrapping,
    lineNumbers: true,
    spellcheck: true,
    autocorrect: true,
    styleActiveLine: true,
    autoRefresh: true,
    autoCloseBrackets: true,
    autoCloseTags: true,
    foldGutter: true,
    lint: true,
    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter', 'CodeMirror-lint-markers']
  })
  editor?.setValue(props.value || '')
  editor?.on('change', () => {
    emits('change', editor?.getValue())
    refresh()
  })
  editor?.on('blur', () => {
    emits('blur', editor?.getValue())
    refresh()
  })
  editor?.on('dblclick', () => {
    emits('dblclick', editor?.getValue())
    refresh()
  })
}

function refresh() {
  editor?.refresh()
}

const fontSize = ref(props.fontSize)

const changeFontSizeListener = (e: WheelEvent) => {
  let keyDown = (isMacOs() && e.metaKey) || (isWindowOs() && e.ctrlKey)
  if (keyDown) {
    if (e.deltaY < 0) {
      fontSize.value = Math.max(fontSize.value - 1, 8)
    } else if (e.deltaY > 0) {
      fontSize.value = Math.min(fontSize.value + 1, 25)
    }
  }
}

function registerFontSize() {
  document.addEventListener('wheel', changeFontSizeListener)
}

function unregisterFontSize() {
  document.removeEventListener('wheel', changeFontSizeListener)
}

onMounted(async () => {
  await nextTick()
  await init()
  registerFontSize()
})

onUnmounted(() => {
  editor = null
  unregisterFontSize()
})

// 暴露方法
defineExpose({
  getValue: () => editor?.getValue(),
  setValue: (value: string) => editor?.setValue(value),
})
</script>

<template>
  <div class="code-mirror relative !h-full w-full overflow-hidden" ref="el" v-bind="$attrs"
       :style="{fontSize: fontSize+'px'}"></div>
</template>

<style scoped>

</style>