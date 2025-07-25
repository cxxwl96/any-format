<script setup lang="ts">
import { Icon } from '@/components/icon'
import { onMounted, type PropType, ref, unref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { useLocalCache } from '@/utils/CacheData'
import { MonacoEditor } from '@/components/monaco'
import type { Column } from '@/data'
import type { RegexOption } from '@/components/RegexReplace/data'
import type { Language } from '@/components/monaco/data'

const props = defineProps({
  title: { type: String, required: true },
  show: { type: Boolean, default: false },
  value: { type: String, required: true, default: '' },
  cacheKey: { type: String, required: true },
  options: { type: Object as PropType<RegexOption[]> },
  alert: String,
  toLang: String as PropType<Language>,
  toTip: String
})
const emits = defineEmits(['update:show', 'toDblClick'])

const localCache = useLocalCache(props.cacheKey)
const toString2JsonData = ref<{
  openToString2Json: boolean;
  openJsonFormat: boolean;
  columns: Column[];
  regOptions: RegexOption[];
  value: string;
}>({
  openToString2Json: props.show,
  openJsonFormat: false,
  columns: [
    { title: '启用', dataIndex: 'enable', key: 'enable' },
    { title: '查找', dataIndex: 'originReg', key: 'originReg' },
    { title: '替换', dataIndex: 'targetReg', key: 'targetReg' },
    { title: '备注', dataIndex: 'comment', key: 'comment' },
    { title: '操作', key: 'action' }
  ],
  regOptions: props.options || [],
  value: props.value
})
watch(() => props.show, (value) => toString2JsonData.value.openToString2Json = value)
watch(() => toString2JsonData.value.openToString2Json, (value) => emits('update:show', value))
onMounted(() => {
  const value = localCache.load()
  if (value) {
    toString2JsonData.value.regOptions = value
  }
})

function handleChange() {
  localCache.cache(toString2JsonData.value.regOptions)
}

function handleAdd(index?: number | undefined) {
  if (index != undefined) {
    toString2JsonData.value.regOptions.splice(index, 0, { enable: true, originReg: '', targetReg: '', comment: '' })
  } else {
    toString2JsonData.value.regOptions.push({ enable: true, originReg: '', targetReg: '', comment: '' })
  }
  handleChange()
  message.success('添加成功')
}

function handleDel(index: number) {
  toString2JsonData.value.regOptions.splice(index, 1)
  handleChange()
  message.success('删除成功')
}

// toString转Json
function toString2Json() {
  if (!props.value) {
    message.info('请输入内容')
    return
  }
  let value = unref(props.value)
  toString2JsonData.value.regOptions.filter(opt => opt.enable).forEach((opt) => {
    value = value.replace(new RegExp(opt.originReg, 'g'), opt.targetReg)
  })
  toString2JsonData.value.value = value
  toString2JsonData.value.openJsonFormat = true
  message.info('转换完成')
}

// 双击
function handleToDblClick() {
  emits('toDblClick', toString2JsonData.value.value)
}
</script>

<template>
  <a-modal :title="props.title"
           v-model:open="toString2JsonData.openToString2Json"
           @ok="toString2Json"
           width="60vw"
           cancel-text="关闭"
           ok-text="开始转换"
           :cancel-button-props="{size: 'small'}"
           :ok-button-props="{size: 'small'}"
  >

    <a-alert v-if="props.alert" :message="props.alert" type="info" closable
             style="margin-bottom: 10px; padding: 0 7px; font-size: 12px; border-radius: 3px; color: #1677ff" />
    <div style="max-height: 60vh; overflow-y: auto; margin: 20px 0">
      <a-table :columns="toString2JsonData.columns" :data-source="toString2JsonData.regOptions" :pagination="false"
               size="small">
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'enable'">
            <a-checkbox v-model:checked="record.enable" @change="handleChange" />
          </template>
          <template v-if="column.key === 'originReg'">
            <a-input v-model:value="record.originReg" @change="handleChange" size="small"></a-input>
          </template>
          <template v-if="column.key === 'targetReg'">
            <a-input v-model:value="record.targetReg" @change="handleChange" size="small"></a-input>
          </template>
          <template v-if="column.key === 'comment'">
            <a-input v-model:value="record.comment" @change="handleChange" size="small"></a-input>
          </template>
          <template v-if="column.key === 'action'">
            <a-flex>
              <a-tooltip title="向上插入">
                <a-button type="link" size="small" @click="handleAdd(index)" @change="handleChange">
                  <Icon icon="ant-design:plus-outline" />
                </a-button>
              </a-tooltip>
              <a-tooltip title="删除">
                <a-button type="link" size="small" @click="handleDel(index)" @change="handleChange">
                  <Icon icon="ant-design:delete-outlined" />
                </a-button>
              </a-tooltip>
            </a-flex>
          </template>
        </template>
      </a-table>
    </div>
    <a-button size="small" block @click="handleAdd(undefined)" @change="handleChange">
      <Icon icon="ant-design:plus-outline" />
      添加
    </a-button>
  </a-modal>
  <a-modal title="转换结果" v-model:open="toString2JsonData.openJsonFormat" width="60vw" :footer="null">
    <MonacoEditor :language="props.toLang || 'plaintext'" v-model="toString2JsonData.value" @dblClick="handleToDblClick"
                  height="60vh" word-wrap>
      <template v-if="props.toTip" #title>
        <div class="tip-font">
          {{ props.toTip }}
        </div>
      </template>
    </MonacoEditor>
  </a-modal>
</template>

<style scoped>

</style>