import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import { handleReadDragFileEvent } from '@/utils/Event'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import { handleToggleFullScreen } from '@/utils/FullScreen'

export type Theme = 'vs' | 'vs-dark' | 'hs-light' | 'hs-black'
export type Language =
  'plaintext'
  | 'abap'
  | 'apex'
  | 'azcli'
  | 'bat'
  | 'bicep'
  | 'cameligo'
  | 'clojure'
  | 'coffee'
  | 'cpp'
  | 'csharp'
  | 'csp'
  | 'css'
  | 'cypher'
  | 'dart'
  | 'dockerfile'
  | 'ecl'
  | 'elixir'
  | 'flow9'
  | 'freemarker2'
  | 'fsharp'
  | 'go'
  | 'graphql'
  | 'handlebars'
  | 'hcl'
  | 'html'
  | 'ini'
  | 'java'
  | 'javascript'
  | 'julia'
  | 'kotlin'
  | 'less'
  | 'lexon'
  | 'liquid'
  | 'lua'
  | 'm3'
  | 'markdown'
  | 'mdx'
  | 'mips'
  | 'msdax'
  | 'mysql'
  | 'objective-c'
  | 'pascal'
  | 'pascaligo'
  | 'perl'
  | 'pgsql'
  | 'php'
  | 'pla'
  | 'postiats'
  | 'powerquery'
  | 'powershell'
  | 'protobuf'
  | 'pug'
  | 'python'
  | 'qsharp'
  | 'r'
  | 'razor'
  | 'redis'
  | 'redshift'
  | 'restructuredtext'
  | 'ruby'
  | 'rust'
  | 'sb'
  | 'scala'
  | 'scheme'
  | 'scss'
  | 'shell'
  | 'solidity'
  | 'sophia'
  | 'sparql'
  | 'sql'
  | 'st'
  | 'swift'
  | 'systemverilog'
  | 'tcl'
  | 'twig'
  | 'typescript'
  | 'typespec'
  | 'vb'
  | 'wgsl'
  | 'xml'
  | 'yaml'
  | 'json'
export const defaultDiffOptions: monaco.editor.IStandaloneDiffEditorConstructionOptions = {
  theme: 'vs', // 主题，'vs','vs-dark','hc-black','hc-light'
  renderSideBySide: true, // 是否side模式
  originalEditable: true, // 是否允许修改原始文本
  enableSplitViewResizing: true, // 允许调整“差异编辑器”拆分视图的大小Defaults to true.
  ignoreTrimWhitespace: false, // 忽略空白
  renderIndicators: true, // 为添加/删除的更改呈现+/-指示器.Defaults to true.
  hideUnchangedRegions: { // 隐藏未变更区域
    enabled: false,
    revealLineCount: 1,
    minimumLineCount: 1,
    contextLineCount: 1
  },
  onlyShowAccessibleDiffViewer: false, //只显示差异审查模式。
  columnSelection: false, // 列选择模式，是否启用列编辑
  find: {
    cursorMoveOnType: true
  },

  autoIndent: 'keep', // 自动缩进
  readOnly: false, // 是否只读  只影响右侧
  diffWordWrap: 'off', // 自动换行
  wordWrap: 'off', // 自动换行
  fontSize: 14, // 字体大小
  roundedSelection: true, // 圆角文本选择
  colorDecorators: true, // 颜色装饰器
  dropIntoEditor: {
    enabled: true // 能否把文字拖拽进编辑器
  },
  minimap: {
    enabled: true // 是否启用代码缩略图
  },
  automaticLayout: true, // 控制编辑器是否自动调整布局以适应容器大小的变化
  overviewRulerBorder: false, // 滚动是否有边框
  cursorBlinking: 'phase', // 光标动画样式
  cursorSmoothCaretAnimation: 'explicit', // 控制光标平滑动画的开启与关闭。当开启时，光标移动会有平滑的动画效果。
  mouseWheelZoom: true, //设置是否开启鼠标滚轮缩放功能
  folding: true, // 是否折叠
  foldingHighlight: true, // 折叠等高线
  foldingStrategy: 'auto', // 折叠方式
  showFoldingControls: 'always', // 是否一直显示折叠
  diffCodeLens: true,
  scrollbar: {
    verticalScrollbarSize: 5, // 垂直滚动条宽度，默认px
    horizontalScrollbarSize: 5, // 水平滚动条高度
    alwaysConsumeMouseWheel: false // 始终使用鼠标滚轮事件（始终在浏览器事件上调用preventDefault（）和stopPropagation()）
  },
  scrollBeyondLastLine: false, // 启用该功能，滚动可以在最后一行之后增加一个屏幕大小，默认值为 true
  stickyScroll: {
    enabled: false // 取消顶部吸附
  },
  renderLineHighlight: 'all', // 启用当前行高亮显示的呈现
  contextmenu: false, // 右键菜单
  copyWithSyntaxHighlighting: true, // 是否应将语法突出显示复制到剪贴板中 即 当你复制到word中是否保持文字高亮颜色
  links: true, // 是否点击链接
  selectionHighlight: true,
  lineNumbers: 'on', //显示行号
  autoClosingBrackets: 'never', // 禁用自动闭合括号功能
  suggestOnTriggerCharacters: false, // 用于控制是否在输入触发字符时显示建议
  glyphMargin: false, // 设置是否显示装饰符号边距
  unicodeHighlight: {
    ambiguousCharacters: false // 禁用 unicode 字符的高亮显示
  }
}
export const defaultHeight = 200

// 初始化环境
export const initMonacoEnvironment = () => {
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
}

// 拖拽文件到编辑器内
export const dragFileInEditorHandler = (codeEditor: monaco.editor.IStandaloneCodeEditor) => {
  const node = codeEditor.getDomNode()
  node?.addEventListener('dragover', e => {
    e.preventDefault() // 阻止默认行为
    e.stopPropagation() // 阻止事件冒泡
  })
  node?.addEventListener('drop', e => {
    e.preventDefault() // 阻止默认行为
    e.stopPropagation() // 阻止事件冒泡
    // 读取文件内容
    handleReadDragFileEvent(e, value => codeEditor.setValue(value as string))
  })
}

export const bindKey = (editor: monaco.editor.IStandaloneCodeEditor, node: HTMLElement) => {
  // 1、Ctrl/Cmd + Shift + F: 查找
  // 2、Ctrl/Cmd + Shift + R: 替换
  node.addEventListener('keydown', e => {
    // 在 Windows 系统中，metaKey 通常对应 Windows 键（徽标键）。在 Mac 系统中，metaKey 对应 Command 键（⌘）。
    // 查找
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'f') {
      editor?.getAction('actions.find')?.run()
      e.preventDefault()
      e.stopPropagation()
    }
    // 替换
    else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'r') {
      editor?.getAction('editor.action.startFindReplaceAction')?.run()
      e.preventDefault()
      e.stopPropagation()
    }
  })
  editor.onKeyDown((e) => {
    // 阻止 Monaco 编辑器默认的按键处理
    // 查找
    if ((e.ctrlKey || e.metaKey) && e.keyCode === monaco.KeyCode.KeyF && !e.shiftKey && !e.altKey) {
      e.stopPropagation()
    }
    // 替换
    if (e.altKey && (e.ctrlKey || e.metaKey) && e.keyCode === monaco.KeyCode.KeyF) {
      e.stopPropagation()
    }
  })

  // 3、Ctrl/Cmd + Shift + S: 全屏
  editor.addCommand(
    monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyS,
    () => {
      handleToggleFullScreen(node || undefined)
    }
  )

  // 4、Ctrl/Cmd + Shift + D: 列选择模式切换
  editor.addCommand(
    monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyD,
    () => {
      editor.updateOptions({
        columnSelection: !editor.getRawOptions().columnSelection
      })
    }
  )
}