<script setup lang="ts">
import { CodeMirror } from '@/components/CodeEditor'
import { ref } from 'vue'
import { useSessionCache } from '@/utils/CacheData'

const sessionCache = useSessionCache('Code')

const data = ref(sessionCache.load())
const themes = ['default', '3024-day', '3024-night', 'abbott', 'abcdef', 'ambiance', 'ayu-dark', 'ayu-mirage', 'base16-dark', 'base16-light', 'bespin', 'blackboard', 'cobalt', 'colorforth', 'darcula', 'dracula', 'duotone-dark', 'duotone-light', 'eclipse', 'elegant', 'erlang-dark', 'gruvbox-dark', 'hopscotch', 'icecoder', 'idea', 'isotope', 'juejin', 'lesser-dark', 'liquibyte', 'lucario', 'material', 'material-darker', 'material-palenight', 'material-ocean', 'mbo', 'mdn-like', 'midnight', 'monokai', 'moxer', 'neat', 'neo', 'night', 'nord', 'oceanic-next', 'panda-syntax', 'paraiso-dark', 'paraiso-light', 'pastel-on-dark', 'railscasts', 'rubyblue', 'seti', 'shadowfox', 'solarized dark', 'solarized light', 'the-matrix', 'tomorrow-night-bright', 'tomorrow-night-eighties', 'ttcn', 'twilight', 'vibrant-ink', 'xq-dark', 'xq-light', 'yeti', 'yonce', 'zenburn']
const modes = ['application/json', 'htmlmixed', 'javascript', 'text/x-mysql', 'text/x-java', 'text/html', 'text/typescript', 'text/x-vue']
const form = ref({
  theme: themes[0],
  mode: modes[0],
  lineWrapper: false
})

function lastTheme() {
  form.value.theme = themes[Math.max(themes.indexOf(form.value.theme) - 1, 0)]
}

function nextTheme() {
  form.value.theme = themes[Math.min(themes.indexOf(form.value.theme) + 1, themes.length - 1)]
}

function lastMode() {
  form.value.mode = modes[Math.max(modes.indexOf(form.value.mode) - 1, 0)]
}

function nextMode() {
  form.value.mode = modes[Math.min(modes.indexOf(form.value.mode) + 1, modes.length - 1)]
}
</script>

<template>
  <div>
    <a-form :model="form" layout="inline">
      <a-form-item label="主题" class="button-select-group">
        <a-button @click="lastTheme">Last</a-button>
        <a-select v-model:value="form.theme" style="width: 200px">
          <a-select-option v-for="theme in themes" :key="theme" :value="theme">{{ theme }}</a-select-option>
        </a-select>
        <a-button @click="nextTheme">Next</a-button>
      </a-form-item>
      <a-form-item label="模式" class="button-select-group">
        <a-button @click="lastMode">Last</a-button>
        <a-select v-model:value="form.mode" style="width: 200px">
          <a-select-option v-for="mode in modes" :key="mode" :value="mode">{{ mode }}</a-select-option>
        </a-select>
        <a-button @click="nextMode">Next</a-button>
      </a-form-item>
      <a-form-item label="自动换行">
        <a-switch v-model:checked="form.lineWrapper" />
      </a-form-item>
    </a-form>
    <CodeMirror ref="el" v-model="data" @change="sessionCache.cache" :theme="form.theme" :mode="form.mode"
                :line-wrapping="form.lineWrapper"
                style="margin-top: 20px" />
  </div>
</template>

<style scoped>
.button-select-group {
  button:first-child {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  button:last-child {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  :global(.ant-select-selector) {
    border-radius: 0;
  }
}
</style>