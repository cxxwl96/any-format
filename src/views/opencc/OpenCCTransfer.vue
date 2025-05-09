<script setup lang="ts">
import {Converter, type Locale} from 'opencc-js'
import {ref} from "vue";
import {MonacoEditor} from "@/components/monaco";

const data = ref<{
  fromValue: string
  fromLocale: Locale
  toValue: string
  toLocale: Locale
  toTip?: string
}>({
  fromValue: '',
  fromLocale: 'twp',
  toValue: '',
  toLocale: 'cn'
})

const ConvertLocale: {
  simpleChinese: { label: string; locale: Locale; tip?: string }[]
  traditionalChinese: { label: string; locale: Locale; tip?: string }[]
} = {
  simpleChinese: [{label: '中国大陆', locale: 'cn'}],
  traditionalChinese: [
    {label: '台湾', locale: 'tw'},
    {label: '台湾（地域用词）', locale: 'twp', tip: '地域用词转换，例如：自行车->腳踏車'},
    {label: '香港', locale: 'hk'},
    {label: '日本新字体', locale: 'jp'},
    {label: 'OpenCC标准', locale: 't', tip: '除非你知道自己在做什么，否则请勿使用'},
  ]
}

const getTip = (locale: Locale): string | undefined => {
  const chinese = ConvertLocale.simpleChinese.find(chinese => chinese.locale === locale)
      || ConvertLocale.traditionalChinese.find(chinese => chinese.locale === locale)
  return chinese?.tip
}

const handleChange = () => {
  const converter = Converter({from: data.value.fromLocale, to: data.value.toLocale})
  data.value.toValue = converter(data.value.fromValue)
  data.value.toTip = getTip(data.value.toLocale)
}
</script>

<template>
  <a-flex vertical gap="middle" class="content-center">
    <MonacoEditor
        :language="'plaintext'"
        v-model="data.fromValue"
        @change="handleChange"
        height="30vh"
        :show-tool="false"
        :word-wrap="true"
        :options="{minimap:{enabled:false}}"
    >
      <template #title>
        <a-radio-group v-model:value="data.fromLocale" @change="handleChange" size="small">
          <a-flex vertical gap="small">
            <a-row align="middle">
              <span class="tip-font">简体：</span>
              <a-radio-button
                  v-for="chinese in ConvertLocale.simpleChinese"
                  :key="chinese.locale"
                  :value="chinese.locale"
              >
                {{ chinese.label }}
              </a-radio-button>
            </a-row>
            <a-row align="middle">
              <span class="tip-font">繁体：</span>
              <a-radio-button
                  v-for="chinese in ConvertLocale.traditionalChinese"
                  :key="chinese.locale"
                  :value="chinese.locale"
              >
                {{ chinese.label }}
              </a-radio-button>
            </a-row>
          </a-flex>
        </a-radio-group>
      </template>
    </MonacoEditor>
    <MonacoEditor
        :language="'plaintext'"
        v-model="data.toValue"
        height="30vh"
        :show-tool="false"
        :word-wrap="true"
        read-only
        :options="{minimap:{enabled:false}, renderLineHighlight: 'none', lineNumbers: 'off', placeholder: '',}"
    >
      <template #title>
        <a-radio-group v-model:value="data.toLocale" @change="handleChange" size="small">
          <a-flex vertical gap="small">
            <a-row align="middle">
              <span class="tip-font">简体：</span>
              <a-radio-button
                  v-for="chinese in ConvertLocale.simpleChinese"
                  :key="chinese.locale"
                  :value="chinese.locale"
              >
                {{ chinese.label }}
              </a-radio-button>
            </a-row>
            <a-row align="middle">
              <span class="tip-font">繁体：</span>
              <a-radio-button
                  v-for="chinese in ConvertLocale.traditionalChinese"
                  :key="chinese.locale"
                  :value="chinese.locale"
              >
                {{ chinese.label }}
              </a-radio-button>
              <a-divider type="vertical" class="divider-border-none" />
              <a-alert v-if="data.toTip" :message="data.toTip" type="info" show-icon closable style="padding: 0 10px; border-radius: 3px"/>
            </a-row>
          </a-flex>
        </a-radio-group>
      </template>
    </MonacoEditor>
  </a-flex>
</template>

<style scoped></style>