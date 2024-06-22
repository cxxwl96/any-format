<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, unref, watch } from 'vue'
import CodeMirror from 'codemirror'
import { MODE, type Nullable, THEME } from '@/data'

// codemirror
// import 'codemirror/lib/codemirror.css'; // 会让maxHeight失效
import 'codemirror/lib/codemirror'
import './codemirror.css'

// 语言
import 'codemirror/mode/vue/vue'
import 'codemirror/mode/css/css'
import 'codemirror/mode/sql/sql'
import 'codemirror/mode/xml/xml'
import 'codemirror/mode/clike/clike'
import 'codemirror/mode/htmlmixed/htmlmixed'
import 'codemirror/mode/javascript/javascript'

// 主题
import 'codemirror/theme/3024-day.css'
import 'codemirror/theme/3024-night.css'
import 'codemirror/theme/abbott.css'
import 'codemirror/theme/abcdef.css'
import 'codemirror/theme/ambiance.css'
import 'codemirror/theme/ayu-dark.css'
import 'codemirror/theme/ayu-mirage.css'
import 'codemirror/theme/base16-dark.css'
import 'codemirror/theme/bespin.css'
import 'codemirror/theme/base16-light.css'
import 'codemirror/theme/blackboard.css'
import 'codemirror/theme/cobalt.css'
import 'codemirror/theme/colorforth.css'
import 'codemirror/theme/dracula.css'
import 'codemirror/theme/duotone-dark.css'
import 'codemirror/theme/duotone-light.css'
import 'codemirror/theme/eclipse.css'
import 'codemirror/theme/elegant.css'
import 'codemirror/theme/erlang-dark.css'
import 'codemirror/theme/gruvbox-dark.css'
import 'codemirror/theme/hopscotch.css'
import 'codemirror/theme/icecoder.css'
import 'codemirror/theme/isotope.css'
import 'codemirror/theme/juejin.css'
import 'codemirror/theme/lesser-dark.css'
import 'codemirror/theme/liquibyte.css'
import 'codemirror/theme/lucario.css'
import 'codemirror/theme/material.css'
import 'codemirror/theme/material-darker.css'
import 'codemirror/theme/material-palenight.css'
import 'codemirror/theme/material-ocean.css'
import 'codemirror/theme/mbo.css'
import 'codemirror/theme/mdn-like.css'
import 'codemirror/theme/midnight.css'
import 'codemirror/theme/monokai.css'
import 'codemirror/theme/moxer.css'
import 'codemirror/theme/neat.css'
import 'codemirror/theme/neo.css'
import 'codemirror/theme/night.css'
import 'codemirror/theme/nord.css'
import 'codemirror/theme/oceanic-next.css'
import 'codemirror/theme/panda-syntax.css'
import 'codemirror/theme/paraiso-dark.css'
import 'codemirror/theme/paraiso-light.css'
import 'codemirror/theme/pastel-on-dark.css'
import 'codemirror/theme/railscasts.css'
import 'codemirror/theme/rubyblue.css'
import 'codemirror/theme/seti.css'
import 'codemirror/theme/shadowfox.css'
import 'codemirror/theme/solarized.css'
import 'codemirror/theme/the-matrix.css'
import 'codemirror/theme/tomorrow-night-bright.css'
import 'codemirror/theme/tomorrow-night-eighties.css'
import 'codemirror/theme/ttcn.css'
import 'codemirror/theme/twilight.css'
import 'codemirror/theme/vibrant-ink.css'
import 'codemirror/theme/xq-dark.css'
import 'codemirror/theme/xq-light.css'
import 'codemirror/theme/yeti.css'
import 'codemirror/theme/idea.css'
import 'codemirror/theme/darcula.css'
import 'codemirror/theme/yonce.css'
import 'codemirror/theme/zenburn.css'

import { isMacOs, isWindowOs } from '@/utils/is'

// 插件
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
// 快捷键
import 'codemirror/keymap/sublime'

const props = defineProps({
  // 双重绑定一定要modelValue，更新时使用emit('update:modelValue')更新
  modelValue: { type: String },
  mode: { type: String, default: MODE.JSON },
  readonly: { type: Boolean, default: false },
  tabSize: { type: Number, default: 4 },
  theme: { type: String, default: THEME.light },
  lineWrapping: { type: Boolean, default: false },
  showCopyButton: { type: Boolean, default: false }, // TODO
  fontSize: { type: Number, default: 14 }
})
const emits = defineEmits(['update:modelValue', 'change', 'blur', 'dblclick'])

const el = ref()
let editor: Nullable<CodeMirror.Editor>

watch(
  () => props.modelValue,
  async (value) => {
    await nextTick()
    const oldValue = editor?.getValue()
    if (value != oldValue) {
      editor?.setValue(value ? value : '')
    }
    emits('change', editor?.getValue())
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
watch(
  () => props.mode,
  async (value) => {
    await nextTick()
    unref(editor)?.setOption('mode', value || MODE.JSON)
  },
  { flush: 'post' }
)
watch(() => props.lineWrapping,
  async (value) => {
    await nextTick()
    unref(editor)?.setOption('lineWrapping', value)
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
  editor?.setValue(props.modelValue || '')
  editor?.on('change', () => {
    emits('change', editor?.getValue())
    emits('update:modelValue', editor?.getValue())
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
  setValue: (value: string) => editor?.setValue(value)
})
</script>

<template>
  <div class="code-mirror relative !h-full w-full overflow-hidden" ref="el" v-bind="$attrs"
       :style="{fontSize: fontSize+'px'}"></div>
</template>

<style scoped>
.code-mirror {
  border: 1px solid #DDDDDD;
  padding: 10px 0;
}
</style>