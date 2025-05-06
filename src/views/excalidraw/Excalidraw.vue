<template>
  <div ref="excalidrawRef" />
</template>

<script setup lang="ts">
import { Excalidraw } from '@excalidraw/excalidraw'
import React from 'react'
import ReactDOM from 'react-dom/client'

import '@excalidraw/excalidraw/index.css'
import { onMounted, ref } from 'vue'
import type {OrderedExcalidrawElement} from '@excalidraw/excalidraw/element/types'
import type {AppState, BinaryFiles, LibraryItems} from '@excalidraw/excalidraw/types'
import {useLocal} from '@/utils/CacheData'

interface ExcalidrawProps {
  elements?: readonly OrderedExcalidrawElement[];
  appState?: AppState;
  files?: BinaryFiles;
  libraryItems?: LibraryItems;
}

const localCache = useLocal('excalidraw', 'data');
const excalidrawRef = ref()
const excalidrawApi = ref()
const initialData = ref<ExcalidrawProps>(localCache.load() as ExcalidrawProps || {})

const processTypeError = () => {
  if (initialData.value.appState?.collaborators) {
    // @ts-ignore
    initialData.value.appState.collaborators = Array.from(initialData.value.appState.collaborators)
  }
}
onMounted(() => {
  processTypeError()
  // @ts-ignore
  let root = ReactDOM.createRoot(excalidrawRef.value)
  root.render(React.createElement(
    'div',
    {
      style: { height: '100vh' }
    },
    React.createElement(Excalidraw, {
      initialData: {
        elements: initialData.value.elements,
        appState: initialData.value.appState,
        files: initialData.value.files,
        libraryItems: initialData.value.libraryItems,
      },
      langCode: "zh-CN",
      onChange: (elements, appState, files) => {
        initialData.value.elements = elements
        initialData.value.appState = appState
        initialData.value.files = files
        localCache.cache(initialData.value)
      },
      onLibraryChange: (libraryItems) => {
        initialData.value.libraryItems = libraryItems
        localCache.cache(initialData.value)
      },
      excalidrawAPI: (api) => {
        excalidrawApi.value = api;
      },
    })
  ))
})
</script>
<style scoped lang="scss"></style>