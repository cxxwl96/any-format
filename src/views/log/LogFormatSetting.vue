<script setup lang="ts">
import { reactive, ref, toRaw, type UnwrapRef, watch } from 'vue'
import type { AnyFormatConfig } from './Format'
import { useLocalCache } from '@/utils/CacheData'

const sessionCache = useLocalCache('AnyFormatConfig')

const props = defineProps({
  show: Boolean
})
const open = ref<boolean>(props.show)
watch(() => props.show, (value: boolean) => {
  open.value = value
})
const emits = defineEmits(['update:show'])
watch(() => open.value, (value: boolean) => {
  emits('update:show', value)
  initForm()
})

// LogFormat设置
let form: UnwrapRef<AnyFormatConfig> = reactive({
  startChars: ['{', '[', '(', '<\\w+>'],
  endChars: ['}', ']', ')', '</\\w+>'],
  breakChars: [';', ',', '</\\w+>'],
  tabCount: 4
})
const initForm = () => {
  if (sessionCache.load()) {
    try {
      form = reactive(sessionCache.load())
    } catch (error) {
      // ignore
    }
  }
}
initForm()
// 保存设置
const onFinish = () => {
  sessionCache.cache(toRaw(form))
  open.value = false
}
// 暴露方法
defineExpose({
  getConfig: () => form
})
</script>

<template>
  <a-modal title="LogFormat设置" v-model:open="open" :footer="null">
    <a-alert message="支持正则匹配哦~" type="info" closable style="margin-bottom: 10px; padding: 0 7px; font-size: 12px; border-radius: 3px; color: #1677ff" />
    <a-form
      :model="form"
      name="basic"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
      @finish="onFinish"
    >
      <a-form-item label="StartChars">
        <a-select v-model:value="form.startChars" mode="tags" :token-separators="[' ']" style="width: 100%" />
      </a-form-item>
      <a-form-item label="EndChars">
        <a-select v-model:value="form.endChars" mode="tags" :token-separators="[' ']" style="width: 100%" />
      </a-form-item>
      <a-form-item label="BreakChars">
        <a-select v-model:value="form.breakChars" mode="tags" :token-separators="[' ']" style="width: 100%" />
      </a-form-item>
      <a-form-item label="TabCount">
        <a-input-number v-model:value="form.tabCount" :min="0" :max="16" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">保存</a-button>
        <a-button style="margin-left: 10px" @click="open=false">取消</a-button>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<style scoped></style>