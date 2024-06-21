<script setup lang="ts">
import { SettingOutlined } from '@ant-design/icons-vue'
import { onMounted, reactive, ref, toRaw, unref, type UnwrapRef } from 'vue'
import useFormat, { type AnyFormatConfig } from '@/utils/Format'
import { CodeMirror } from '@/components/CodeEditor'

const data = ref<string>('')
// load cache
onMounted(() => data.value = sessionStorage.getItem('AnyFormatData') || '')
// data cache
const cacheData = (value: string) => sessionStorage.setItem('AnyFormatData', value)


let config: UnwrapRef<AnyFormatConfig> = reactive(
  {
    startChars: ['{', '[', '('],
    endChars: ['}', ']', ')'],
    breakChars: [';', ','],
    tabCount: 4
  })
if (sessionStorage.getItem('AnyFormatConfig')) {
  try {
    config = reactive(JSON.parse(sessionStorage.getItem('AnyFormatConfig') as string))
  } catch (error) {
    // ignore
  }
}
const open = ref<boolean>(false)

const onFinish = () => {
  sessionStorage.setItem('AnyFormatConfig', JSON.stringify(toRaw(config)))
  open.value = false
}

function dblclick(value: string) {
  const format = useFormat({ ...toRaw(config) }).anyFormat(unref(value))
  if (format != value) {
    data.value = ''
    setTimeout(() => {
      data.value = format
    }, 1)
  }
}
</script>

<template>
  <div>
    <CodeMirror @dblclick="dblclick" v-model:value="data" @change="cacheData" :lineWrapping="true" />
    <a-float-button :style="{bottom: '100px'}" @click="()=>{open=true}">
      <template #icon>
        <SettingOutlined />
      </template>
    </a-float-button>
    <a-modal title="LogFormat设置" v-model:open="open" :footer="null">
      <a-form
        :model="config"
        name="basic"
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 16 }"
        autocomplete="off"
        @finish="onFinish"
      >
        <a-form-item label="StartChars">
          <a-checkbox-group v-model:value="config.startChars">
            <a-checkbox value="{" name="startChars">{</a-checkbox>
            <a-checkbox value="[" name="startChars">[</a-checkbox>
            <a-checkbox value="(" name="startChars">(</a-checkbox>
            <a-checkbox value="<" name="startChars">&lt;</a-checkbox>
          </a-checkbox-group>
        </a-form-item>
        <a-form-item label="EndChars">
          <a-checkbox-group v-model:value="config.endChars">
            <a-checkbox value="}" name="endChars">}</a-checkbox>
            <a-checkbox value="]" name="endChars">]</a-checkbox>
            <a-checkbox value=")" name="endChars">)</a-checkbox>
            <a-checkbox value=">" name="endChars">&gt;</a-checkbox>
          </a-checkbox-group>
        </a-form-item>
        <a-form-item label="BreakChars">
          <a-checkbox-group v-model:value="config.breakChars">
            <a-checkbox value=";" name="breakChars">;</a-checkbox>
            <a-checkbox value="," name="breakChars">,</a-checkbox>
            <a-checkbox value="}" name="breakChars">}</a-checkbox>
            <a-checkbox value="]" name="breakChars">]</a-checkbox>
            <a-checkbox value=")" name="breakChars">)</a-checkbox>
            <a-checkbox value=">" name="breakChars">&gt;</a-checkbox>
            <a-checkbox value="=" name="breakChars">=</a-checkbox>
            <a-checkbox value=";" name="breakChars">;</a-checkbox>
          </a-checkbox-group>
        </a-form-item>
        <a-form-item label="TabCount">
          <a-input-number v-model:value="config.tabCount" :min="0" :max="16" />
        </a-form-item>

        <a-form-item>
          <a-button type="primary" html-type="submit">保存</a-button>
          <a-button style="margin-left: 10px" @click="open=false">取消</a-button>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<style scoped></style>