<script setup lang="ts">
import { ref, watch } from 'vue'
import type { SelectProps } from 'ant-design-vue'
import { message } from 'ant-design-vue'
import { handleReadDragFileEvent } from '@/utils/Event'

const form = ref<{
  regexp: string,
  selectValue: string | number | undefined,
  options: SelectProps['options'],
  global: boolean,
  ignoreCase: boolean,
  text: string,
  matchResult: string[]
}>({
  regexp: '',
  selectValue: undefined,
  options: [
    { label: '中文字符', value: '[\\u4e00-\\u9fa5]' },
    { label: '双字节字符（包含中文）', value: '[^\\x00-\\xff]' },
    {
      label: 'Email地址',
      value: '[\\w!#$%&\'*+/=?^_`{|}~-]+(?:\\.[\\w!#$%&\'*+/=?^_`{|}~-]+)*@(?:[\\w](?:[\\w-]*[\\w])?.)+[\\w](?:[\\w-]*[\\w])?'
    },
    { label: '网址URL', value: '[a-zA-Z]+://[^\\s]*' },
    { label: '国内电话号码', value: '\\d{3}-\\d{8}|\\d{4}-\\{7,8}' },
    { label: '中国邮政编码', value: '[1-9]\\d{5}(?!\\d)' },
    { label: '18位身份证', value: '^(\\d{6})(\\d{4})(\\d{2})(\\d{2})(\\d{3})([0-9]|X)$' },
    { label: 'IPv4', value: '^((25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$' },
    {
      label: 'IPv6',
      value: '^([\\da-fA-F]{1,4}:){6}((25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$|^::([\\da-fA-F]{1,4}:){0,4}((25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$|^([\\da-fA-F]{1,4}:):([\\da-fA-F]{1,4}:){0,3}((25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$|^([\\da-fA-F]{1,4}:){2}:([\\da-fA-F]{1,4}:){0,2}((25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$|^([\\da-fA-F]{1,4}:){3}:([\\da-fA-F]{1,4}:){0,1}((25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$|^([\\da-fA-F]{1,4}:){4}:((25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$|^([\\da-fA-F]{1,4}:){7}[\\da-fA-F]{1,4}$|^:((:[\\da-fA-F]{1,4}){1,6}|:)$|^[\\da-fA-F]{1,4}:((:[\\da-fA-F]{1,4}){1,5}|:)$|^([\\da-fA-F]{1,4}:){2}((:[\\da-fA-F]{1,4}){1,4}|:)$|^([\\da-fA-F]{1,4}:){3}((:[\\da-fA-F]{1,4}){1,3}|:)$|^([\\da-fA-F]{1,4}:){4}((:[\\da-fA-F]{1,4}){1,2}|:)$|^([\\da-fA-F]{1,4}:){5}:([\\da-fA-F]{1,4})?$|^([\\da-fA-F]{1,4}:){6}:$'
    },
    { label: '日期（YYYY-MM-DD）', value: '^\\d{4}-\\d{2}-\\d{2}$' },
    { label: 'HTML/XML标签', value: '<(\\w+)>(.*)<\\/\\1>' },
    { label: '正整数', value: '^[1-9]\\d*$' },
    { label: '负整数', value: '^-[1-9]\\d*$' },
    { label: '整数', value: '^-?[1-9]\\d*$' }
  ],
  global: true,
  ignoreCase: false,
  text: '',
  matchResult: []
})

const filterOption = (input: string, option: any) => {
  return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
}
// 为了避免select与Input双向绑定form.regexp时select只显示仅有的option，使用form.selectValue及如下handleSelectChange和watch form.regexp方案来解决此问题
const handleSelectChange = (value: string) => {
  form.value.regexp = value
  form.value.selectValue = value
}
watch(() => form.value.regexp, (val: string) => {
  const values = form.value.options?.filter(item => item.value === val).map(item => item.value)
  if (values && values.length > 0) {
    form.value.selectValue = values[0] || undefined
  } else {
    form.value.selectValue = undefined
  }
})

const handleMatchAll = () => {
  const regexp = form.value.regexp
  const text = form.value.text
  const matchResult = form.value.matchResult
  matchResult.splice(0, matchResult.length)
  if (regexp === '') {
    message.error('请输入正则表达式')
    return
  }
  if (text === '') {
    message.error('请输入需要匹配的文本')
    return
  }
  let flags = ''
  flags += form.value.global ? 'g' : ''
  flags += form.value.ignoreCase ? 'i' : ''
  const matchs = text.matchAll(new RegExp(regexp, flags))
  for (let match of matchs) {
    matchResult.push(match[0])
  }
  matchResult.length > 0 ? message.success('匹配成功') : message.error('匹配失败')
}
// 拖拽文件
const dragging = ref(false)
const handleDragFile = (event: DragEvent) => {
  handleReadDragFileEvent(event, (value) => {
    form.value.text = value as string
  })
  dragging.value = false
}
</script>

<template>
  <a-flex class="content-center" vertical gap="large">
    <a-row align="middle" :gutter="16">
      <a-col>
        <div class="tip-font" style="margin: 0">正则表达式：</div>
      </a-col>
      <a-col flex="auto">
        <a-input v-model:value="form.regexp" placeholder="输入正则表达式" allow-clear>
          <template #addonAfter>
            <a-select v-model:value="form.selectValue" :options="form.options" :filter-option="filterOption"
                      @change="handleSelectChange" placeholder="常用正则表达式" show-search style="width: 180px" />
          </template>
        </a-input>
      </a-col>
      <a-col>
        <a-checkbox v-model:checked="form.global">全局搜索</a-checkbox>
      </a-col>
      <a-col>
        <a-checkbox v-model:checked="form.ignoreCase">忽略大小写</a-checkbox>
      </a-col>
      <a-col>
        <a-button type="primary" @click="handleMatchAll">匹配</a-button>
      </a-col>
    </a-row>
    <a-textarea
      v-model:value="form.text"
      :auto-size="{minRows:10, maxRows:25}"
      allowClear
      showCount
      placeholder="输入匹配文本或拖拽文件到此处"
      @dragenter.prevent="dragging=true"
      @dragleave.prevent="dragging=false"
      @dragover.prevent
      @drop.prevent="handleDragFile"
      class="drag-zone"
      :class="{'drag-over': dragging}"
    />
    <div>
      <div class="tip-font">
        共匹配到
        <a-tag :bordered="false" color="geekblue" style="margin: 0">{{ form.matchResult.length }}</a-tag>
        个结果：
      </div>
      <a-list :data-source="form.matchResult" bordered>
        <template #renderItem="{ item }">
          <a-list-item>{{ item }}</a-list-item>
        </template>
      </a-list>
    </div>
  </a-flex>
</template>

<style scoped></style>