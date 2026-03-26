<script setup lang="ts">
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { useJSONUtil } from '@/views/json/JsonFormat'
import jsonpath from 'jsonpath'
import { MonacoEditor } from '@/components/monaco'
import { isArray } from '@/utils/is'
import { Assert } from '@/utils/Assert'
import { Icon } from '@/components/icon'

const props = defineProps({
  data: { type: String }
})
const path = ref('')
const showForm = ref(false)
const showResult = ref(false)
const showHelp = ref(false)
const result = ref('')
const resultJsonUtil = useJSONUtil(result)

const handleOk = () => {
  try {
    const jsonText = props.data as string
    Assert.notBlank(jsonText, '请输入JSON')
    Assert.notBlank(path.value, '请输入JSONPath')

    const jsonUtil = useJSONUtil(ref(jsonText))
    const validateResult = jsonUtil.formatValidate(false, false)
    Assert.isFalse(validateResult.error, 'JSON格式错误')

    const value = jsonpath.query(JSON.parse(jsonText), path.value)
    const msg = `根据${path.value}没有找到对应的值`
    Assert.notNullOrUndefined(value, msg)

    if (isArray(value)) {
      Assert.notEmpty(value, msg)
      if (value.length === 1 && typeof value[0] === 'string') {
        result.value = value[0]
      } else {
        result.value = JSON.stringify(value[0])
      }
    } else {
      result.value = JSON.stringify(value)
    }
    showResult.value = true
    showForm.value = false
  } catch (e: any) {
    result.value = ''
    message.error('取值失败：' + e?.message)
  }
}
</script>

<template>
  <a-badge :offset="[-10]">
    <template #count>
      <span style="color: #f50; font-size: 10px; font-weight: bold">New</span>
    </template>
    <a-popconfirm
      ok-text="确定"
      cancel-text="关闭"
      @confirm="handleOk"
      @cancel="showForm = false"
      :open="showForm"
      :icon="null"
    >
      <template #title>
        <span>请输入JSONPath </span>
        <a
        ><Icon
          icon="material-symbols:help-outline"
          @click="
            () => {
              showHelp = true
              showForm = false
            }
          "
        /></a>
      </template>
      <template #description>
        <a-input style="width: 400px" v-model:value="path" />
      </template>
      <a-button size="small" @click="showForm = !showForm">JSONPath</a-button>
    </a-popconfirm>
  </a-badge>

  <a-modal
    title="取值结果"
    v-model:open="showResult"
    :cancel-button-props="{ size: 'small' }"
    :ok-button-props="{ size: 'small' }"
    cancel-text="关闭"
    ok-text="格式化校验"
    @ok="resultJsonUtil.formatValidate"
    width="50%"
  >
    <MonacoEditor language="json" v-model="result" @dblClick="resultJsonUtil.formatValidate" />
  </a-modal>
  <a-modal title="Help" v-model:open="showHelp" :footer="null" width="80vw">
    <a-table
      :pagination="false"
      :columns="[
        {
          title: 'JSONPath',
          dataIndex: 'jsonPath',
          key: 'jsonPath',
          scopedSlots: { customRender: 'jsonPath' }
        },
        {
          title: '说明',
          dataIndex: 'description',
          key: 'description'
        }
      ]"
      :data-source="[
        {
          key: 1,
          jsonPath: '$',
          description: '根对象'
        },
        {
          key: 2,
          jsonPath: '. 或 []',
          description: '子属性访问'
        },
        {
          key: 3,
          jsonPath: '..',
          description: '递归查找'
        },
        {
          key: 4,
          jsonPath: '*',
          description: '通配符，匹配所有属性'
        },
        {
          key: 5,
          jsonPath: '[index]',
          description: '数组索引访问'
        },
        {
          key: 6,
          jsonPath: '[start:end]',
          description: '数组切片'
        },
        {
          key: 7,
          jsonPath: '[?(expression)]',
          description: '过滤表达式（如 price > 10）'
        },
        {
          key: 8,
          jsonPath: '@',
          description: '当前对象属性值（用于过滤表达式中）'
        }
      ]"
    />
  </a-modal>
</template>

<style scoped></style>