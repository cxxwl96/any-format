<template>
  <div id="excalidraw" />
</template>

<script setup lang="ts">
import { Excalidraw } from '@excalidraw/excalidraw'
import React from 'react'
import ReactDOM from 'react-dom/client'

import '@excalidraw/excalidraw/index.css'
import { onMounted } from 'vue'

let excalidrawApp;
onMounted(() => {
  let root = ReactDOM.createRoot(document.getElementById('excalidraw'))
  root.render(React.createElement(
    'div',
    {
      style: { height: '100vh' }
    },
    React.createElement(Excalidraw, {
      initialData: {
        // elements: elements,
        // libraryItems: libs,
        appState: {
          // theme,
          // activeTool,
          // name,
          // scrollX,
          // scrollY,
          // zoom,
          // offsetLeftm,
          // offsetTop,
        },
      },
      langCode: "zh-CN",
      // onChange: this.onChange,
      // onLibraryChange: this.onLibraryChange,
      excalidrawAPI: (e: any) => {
        excalidrawApp = e;
      },
    })
  ))
})
</script>

<style scoped lang="scss">

</style>
