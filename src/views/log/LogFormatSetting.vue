<script setup lang="ts">
import { onMounted, reactive, ref, toRaw, type UnwrapRef, watch } from 'vue'
import { type AnyFormatConfig, config } from './Format'
import { useLocalCache } from '@/utils/CacheData'
import { Icon } from '@/components/icon'

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
  initForm()
})
// 删除开合字符
const handleDeleteOpenClose = (i: number) => {
  if (i < form.openCloseChars.length) {
    form.openCloseChars.splice(i, 1)
  }
}
// 添加开合字符
const handleAddOpenClose = () => {
  form.openCloseChars.push({ open: '', close: '' })
}
</script>

<template>
  <a-modal title="LogFormat设置" v-model:open="open" :footer="null" width="700px">
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
      <a-form-item label="开合字符"
                   tooltip="● 开始字符：匹配到开始字符则进行并增加缩进（1个单元的Tab数量）● 结束字符：匹配到结束字符则进行减少缩进（1个单元的Tab数量）">
        <a-input-group compact style="width: 90%">
          <a-input style="width: 50%; text-align: center; border: none; border-radius: 0; pointer-events: none"
                   placeholder="开始字符" disabled />
          <a-input style="width: 50%; text-align: center; border: none; border-radius: 0; pointer-events: none"
                   placeholder="结束字符" disabled />
        </a-input-group>
        <a-input-group compact style="width: 100%" v-for="(openClose, i) in form.openCloseChars"
                       :key="`OPEN_CLOSE_${i}`">
          <a-input style="width: 45%; border-radius: 0;" v-model:value="openClose.open" required/>
          <a-input style="width: 45%; border-radius: 0;" v-model:value="openClose.close" required/>
          <a-button type="link" style="padding: 0" @click="handleDeleteOpenClose(i)">
            <Icon icon="ant-design:delete-outlined" />
          </a-button>
        </a-input-group>
        <a-button type="dashed" size="small" style="width: 90%; margin-top: 10px" @click="handleAddOpenClose">
          <Icon icon="ant-design:plus-outlined" />
          添加
        </a-button>
      </a-form-item>
      <a-form-item label="换行字符" tooltip="匹配到换行字符则按照上一个缩进位置进行换行">
        <a-select v-model:value="form.breakChars" mode="tags" :token-separators="[' ']" style="width: 100%" />
      </a-form-item>
      <a-form-item label="Tab数量" tooltip="缩进空格数">
        <a-input-number v-model:value="form.tabCount" :min="0" :max="16" />
      </a-form-item>
      <a-flex justify="flex-end" gap="small">
        <a-button type="primary" html-type="submit" size="small">保存</a-button>
        <a-button @click="open = false" size="small">取消</a-button>
      </a-flex>
    </a-form>
  </a-modal>
</template>

<style scoped></style>