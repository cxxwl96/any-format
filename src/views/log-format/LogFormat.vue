<script setup lang="ts">
import { SettingOutlined } from '@ant-design/icons-vue'
import { reactive, ref, toRaw, type UnwrapRef, watch } from 'vue'
import useFormat, { type AnyFormatConfig } from '@/utils/Format'
import {CodeMirror} from '@/components/CodeEditor'
import { message } from 'ant-design-vue';
const [messageApi, contextHolder] = message.useMessage();

messageApi.info('粘贴文本，双击格式化');

const data = ref<string>('')

let config: UnwrapRef<AnyFormatConfig> = reactive(
  {
  startChars: ['{', '[', '('],
  endChars: ['}', ']', ')'],
  breakChars: [';', ','],
  tabCount: 4
})
if (localStorage.getItem("AnyFormatConfig")) {
  try {
    config = reactive(JSON.parse(localStorage.getItem("AnyFormatConfig") as string))
  } catch (error) {
    // ignore
  }
}
const open = ref<boolean>(false)

const onFinish = () => {
  localStorage.setItem("AnyFormatConfig", JSON.stringify(toRaw(config)))
  open.value = false
}

function dblclick(value: string) {
  const formated = useFormat({ ...toRaw(config) }).anyFormat(value)
  if (formated != value) {
    data.value = ''
    setTimeout(() => {
      data.value = formated
    }, 1)
  }
}
</script>

<template>
  <div>
    <CodeMirror @dblclick="dblclick" v-model:value="data" :lineWrapping="true" :style="{fontSize: '14px'}"/>
    <span style="font-size: 14px; color: #00000059; margin: 20px">Tip：粘贴文本，双击格式化</span>
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