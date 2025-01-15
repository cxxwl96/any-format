import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'

export const THEME = {
  VS: 'vs',
  VS_DARK: 'vs-dark',
  HC_LIGHT: 'hs-light',
  HC_BLACK: 'hs-black'
}
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
    horizontalScrollbarSize: 5 // 水平滚动条高度
  },
  scrollBeyondLastLine: false, // 启用该功能，滚动可以在最后一行之后增加一个屏幕大小，默认值为 true
  stickyScroll: {
    enabled: false // 取消顶部吸附
  },
  renderLineHighlight: 'all', // 启用当前行高亮显示的呈现
  contextmenu: false, // 右键菜单
  columnSelection: true, // 启用列编辑 按下shift键位然后按↑↓键位可以实现列选择 然后实现列编辑
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