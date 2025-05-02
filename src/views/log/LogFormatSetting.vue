<script setup lang="ts">
import { onMounted, reactive, ref, toRaw, type UnwrapRef, watch } from 'vue'
import { type AnyFormatConfig, config } from './Format'
import { useLocal, useLocalCache } from '@/utils/CacheData'
import PackageJson from '@/../package.json'

const localCache = useLocalCache('AnyFormatConfig')

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
let form: UnwrapRef<AnyFormatConfig> = reactive(config)
const initForm = () => {
  if (localCache.load()) {
    try {
      form = reactive(localCache.load())
    } catch (error) {
      // ignore
    }
  }
}
// 保存设置
const handleSave = () => {
  localCache.cache(toRaw(form))
  open.value = false
}
// 暴露方法
defineExpose({
  getConfig: () => form
})
onMounted(() => {
  // 版本升级合并form
  const appVersion = useLocal('app', 'version').load()
  if (appVersion !== PackageJson.version && localCache.load()) {
    const localConfig = localCache.load() as AnyFormatConfig
    const mergeChars = (key: keyof AnyFormatConfig) => {
      const configChars = config[key] as Array<string>;
      const localChars = localConfig[key] as Array<string>;
      configChars.forEach((char: string) => {
        if (localChars.indexOf(char) > -1) {
          localChars.push(char)
        }
      })
    }
    mergeChars('startChars')
    mergeChars('endChars')
    mergeChars('breakChars')
    handleSave()
  }
  initForm()
})
</script>

<template>
  <a-modal title="LogFormat设置" v-model:open="open" :footer="null">
    <a-alert message="支持正则匹配哦~" type="info" closable
             style="margin-bottom: 10px; padding: 0 7px; font-size: 12px; border-radius: 3px; color: #1677ff" />
    <a-form
      :model="form"
      name="basic"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
      @finish="handleSave"
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