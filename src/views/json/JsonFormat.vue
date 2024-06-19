<script setup lang="ts">
import { CodeMirror } from '@/components/CodeEditor'
</script>

<template>
  <CodeMirror class="editor"/>
</template>

<style scoped>
.editor {
  height: 70vh !important;
  max-height: 70vh !important;
  overflow: scroll;
  border: 1px solid #DDDDDD;
  padding: 10px 0;
}
</style>