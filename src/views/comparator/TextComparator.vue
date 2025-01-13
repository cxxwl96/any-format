<script setup lang="ts">
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import 'monaco-editor/esm/vs/editor/editor.main.js'
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";

import { onBeforeMount, onBeforeUnmount, onMounted, ref } from 'vue'


const editorRef = ref()
let editor: monaco.editor.IStandaloneDiffEditor;
let originModel: monaco.editor.ITextModel
let modifiedModel: monaco.editor.ITextModel

onMounted(() => initDiffEditor())
onBeforeUnmount(()=> {
  editor && editor.dispose()
})

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === "json") {
      return new jsonWorker();
    }
    if (label === "css" || label === "scss" || label === "less") {
      return new cssWorker();
    }
    if (label === "html" || label === "handlebars" || label === "razor") {
      return new htmlWorker();
    }
    if (label === "typescript" || label === "javascript") {
      return new tsWorker();
    }
    return new editorWorker();
  },
};

const initDiffEditor = () => {
  editor = monaco.editor.createDiffEditor(editorRef.value, {
    theme: 'vs', // 主题，'vs','vs-dark','hc-black','hc-light'
    autoIndent: 'keep', // 自动缩进
    readOnly: false, // 是否只读  只影响右侧
    originalEditable: true, // 是否允许修改原始文本
    automaticLayout: true, // 控制编辑器是否自动调整布局以适应容器大小的变化
    renderSideBySide: true, // 是否side模式
    enableSplitViewResizing: true,
    roundedSelection: true, // 圆角文本选择
    ignoreTrimWhitespace: false, // 忽略空白
    diffWordWrap: 'off', // 自动换行
    wordWrap: 'off', // 自动换行
    fontSize: 14, // 字体大小
    dropIntoEditor: {
      enabled: true // 能否把文字拖拽进编辑器
    },
    minimap: {
      enabled: false, // 是否启用代码缩略图
    },
    cursorBlinking: 'phase', // 光标动画样式
    overviewRulerBorder: false, // 滚动是否有边框
    cursorSmoothCaretAnimation: 'explicit', // 控制光标平滑动画的开启与关闭。当开启时，光标移动会有平滑的动画效果。
    mouseWheelZoom: true, //设置是否开启鼠标滚轮缩放功能
    folding: true, //控制是否开启代码折叠功能
    diffCodeLens: true,
    scrollbar: {
      verticalScrollbarSize: 5, // 垂直滚动条宽度，默认px
      horizontalScrollbarSize: 2, // 水平滚动条高度
    },
    scrollBeyondLastLine: false, // 启用该功能，滚动可以在最后一行之后增加一个屏幕大小，默认值为 true
    renderLineHighlight: 'line', // 启用当前行高亮显示的呈现
    contextmenu: false, // 右键菜单
    columnSelection: false, // 启用列编辑 按下shift键位然后按↑↓键位可以实现列选择 然后实现列编辑
    copyWithSyntaxHighlighting: true, // 是否应将语法突出显示复制到剪贴板中 即 当你复制到word中是否保持文字高亮颜色
    links: true, // 是否点击链接
    selectionHighlight: true,
    lineNumbers: 'on', //显示行号
    autoClosingBrackets: 'never', // 禁用自动闭合括号功能
    suggestOnTriggerCharacters: false, // 用于控制是否在输入触发字符时显示建议
    glyphMargin: false, // 设置是否显示装饰符号边距
    unicodeHighlight: {
      ambiguousCharacters: false, // 禁用 unicode 字符的高亮显示
    },
    stickyScroll: {
      enabled: false, // 取消顶部吸附
    },
  })

  let originValue = '{\n' +
    '    "theme": "vs",\n' +
    '    "readOnly": false,\n' +
    '    "originalEditable": true,\n' +
    '    "automaticLayout": true,\n' +
    '    "renderSideBySide": true,\n' +
    '    "renderSideBySiderenderSideBySiderenderSideBySiderenderSideBySiderenderSideBySiderenderSideBySide": true,\n' +
    '    "roundedSelection": true,\n' +
    '    "autoDetectHighContrast": true\n' +
    '}';

  let modifiedValue = '{\n' +
    '    "theme": "vs",\n' +
    '    "readOnly": false,\n' +
    '    "originalEditable": true,\n' +
    '    "automaticLayout": true,\n' +
    '    "renderSideBySide": true,,,,\n' +
    '    "renderSideBySiderenderSideBySiderenderSideBySiderenderSideBySiderenderSideBySiderenderSideBySide": true,\n' +
    '    "roundedSelection": true,\n' +
    '    "autoDetectHighContrast": true\n' +
    '}';
  originModel = monaco.editor.createModel(originValue, 'json')
  modifiedModel = monaco.editor.createModel(modifiedValue, 'json')

  editor.setModel({
    original: originModel,
    modified: modifiedModel,
  })
}

</script>

<template>
<div>
  <div ref="editorRef" style="height: 1000px"></div>
</div>
</template>

<style scoped>

</style>