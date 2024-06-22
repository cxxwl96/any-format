<script setup lang="ts">
import JsonEditor, { type Color, type SelectionPosition, type SerializableNode } from 'jsoneditor'
import 'jsoneditor/dist/jsoneditor.min.css'
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import type { Nullable } from '@/data'
import { isJsonString } from '@/utils/is'

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
      emits('update:modelValue', JSON.stringify(val)) // 双重绑定
      emits('change', val)
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
  const finalOptions = {
    indentation: props.indentation,
    mode: props.mode,
    modes: props.modes,
    language: props.language,
    ...props.options,
    onChange,
    onFocus,
    onBlur,
    onEvent,
    onModeChange,
    onTextSelectionChange,
    onSelectionChange,
    onColorPicker,
    onValidationError
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
  return isJsonString(value) ? JSON.parse(value as string) : value
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
</style>
