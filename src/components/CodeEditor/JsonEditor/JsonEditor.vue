<script setup lang="ts">
import JsonEditor, {
  type Color,
  type MenuItem,
  type MenuItemNode,
  type SelectionPosition,
  type SerializableNode
} from 'jsoneditor'
import 'jsoneditor/dist/jsoneditor.min.css'
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import type { Nullable } from '@/data'

const props = defineProps({
  // 双重绑定一定要modelValue，更新时使用emit('update:modelValue')更新
  modelValue: {
    type: [Object, Number, Array, String]
  },
  options: Object,
  // https://github.com/josdejong/jsoneditor/blob/master/docs/api.md#configuration-options
  indentation: {
    type: Number,
    default: 4
  },
  mode: {
    type: String,
    default: 'tree'
  },
  modes: {
    type: Array,
    default: () => ['tree', 'form', 'view', 'code', 'text']
  },
  // en, es zh-CN, pt-BR, tr, ja, fr-FR, de, ru, ko
  language: {
    type: String,
    default: 'en'
  }
})
const emits = defineEmits(['change', 'focus', 'blur', 'event', 'update:modelValue', 'textSelectionChange', 'selectionChange', 'colorPicker', 'validationError'])

const jsonEditorRef = ref()
let editor: Nullable<JsonEditor>

let internalChange = false
let json = parseValue(props.modelValue)
const expandedModes = ['tree', 'form', 'view']

function init() {
  const onChange = () => {
    const setJson = (val: any) => {
      json = val
      emits('update:modelValue', setValue(val)) // 双重绑定
      emits('change', setValue(val))
      internalChange = true
      nextTick(() => {
        internalChange = false
      })
    }

    // 兼容一次性删除所有内容
    const text = editor?.getText()
    if (!text) {
      setJson('')
      return
    }

    try {
      const json = editor?.get()
      setJson(json)
    } catch (error) {
      // console.log(error);
    }
  }
  const onFocus = (event: Event) => {
    emits('focus', editor, event)
  }
  const onBlur = (event: Event) => {
    emits('blur', editor, event)
  }
  const onEvent = (event: Event) => {
    emits('event', editor, event)
  }
  const onModeChange = () => {
    expandAll()
  }
  const onTextSelectionChange = (start: SelectionPosition, end: SelectionPosition, text: string) => {
    emits('textSelectionChange', editor, start, end, text)
  }
  const onSelectionChange = (start: SerializableNode, end: SerializableNode) => {
    emits('selectionChange', editor, start, end)
  }
  const onColorPicker = (parent: HTMLElement, color: string, onChange: (color: Color) => void) => {
    emits('colorPicker', editor, parent, color, onChange)
  }
  const onValidationError = (errors: any) => {
    emits('validationError', editor, errors)
  }
  const onCreateMenu = (menuItems: MenuItem[], node: MenuItemNode): MenuItem[] => {
    const menus: MenuItem[] = [...menuItems]
    // 添加复制JSONPath菜单
    if (node && node.type === 'single') {
      const menu: MenuItem = {
        text: 'CopyPath',
        title: 'Copy the json path',
        className: 'jsoneditor-duplicate',
        click: () => {
          if (node.path) {
            let path = '$'
            for (let p of node.path) {
              if (typeof p === 'number') {
                path += '[' + p + ']'
              } else {
                path += '.' + p
              }
            }
            navigator.clipboard.writeText(path)
          }
        }
      }
      menus.splice(Math.max(menus.length - 1, 0), 0, menu)
    }
    return menus
  }
  const finalOptions = {
    indentation: props.indentation,
    mode: props.mode,
    modes: props.modes,
    language: props.language,
    colorPicker: true,
    ...props.options,
    onChange,
    onFocus,
    onBlur,
    onEvent,
    onModeChange,
    onTextSelectionChange,
    onSelectionChange,
    onColorPicker,
    onValidationError,
    onCreateMenu
  }
  editor = new JsonEditor(
    jsonEditorRef.value,
    // @ts-ignore
    finalOptions,
    json
  )
}

function expandAll() {
  if (editor?.getMode() && expandedModes.includes(editor?.getMode())) {
    editor?.expandAll()
  }
}

function setEditorContent(value: any) {
  editor?.set(value)
}

function parseValue(value: any) {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value as string)
    } catch (e) {
      return value
    }
  }
  return value
}

function setValue(value: any) {
  if (typeof props.modelValue === 'string') {
    return typeof value === 'object' ? JSON.stringify(value) : value
  }
  return typeof value === 'string' ? JSON.parse(value) : value
}

watch(() => props.modelValue, (val) => {
  // 内容变化赋值
  if (!internalChange) {
    setEditorContent(parseValue(val))
    nextTick(() => expandAll())
  }
}, {
  immediate: true,
  deep: true
})
onMounted(() => {
  init()
})
onUnmounted(() => {
  editor?.destroy()
  editor = null
})
</script>

<template>
  <div ref="jsonEditorRef" class="json-editor-vue" />
</template>

<style scoped>
.json-editor-vue {
  width: 100%;
  height: 100%;
}

code {
  background-color: #f5f5f5;
}

div.json-editor-vue > div > div.jsoneditor-menu {
  background-color: #ff0000;
  border-bottom: 1px solid #3883fa;
}
</style>
