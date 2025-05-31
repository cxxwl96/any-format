<script setup lang="ts">
import { Icon } from '@/components/icon'
import { onMounted, ref, unref, watch } from 'vue'
import { message, notification } from 'ant-design-vue'
import { useLocalCache } from '@/utils/CacheData'
import { useClipboard } from '@/utils/Clipboard'
import { MonacoEditor } from '@/components/monaco'
import { validateJson } from '@/utils/jsonUtil'
const localCache = useLocalCache('AnyFormatToJson')

const props = defineProps({
  show: Boolean,
  value: String
})
const emits = defineEmits(['update:show'])

const toString2JsonData = ref({
  openToString2Json: props.show,
  openJsonFormat: false,
  columns: [
    { title: '启用', dataIndex: 'enable', key: 'enable' },
    { title: '查找', dataIndex: 'originReg', key: 'originReg' },
    { title: '替换', dataIndex: 'targetReg', key: 'targetReg' },
    { title: '备注', dataIndex: 'comment', key: 'comment' },
    { title: '操作', key: 'action' }
  ],
  regOptions: [
    { enable: true, originReg: '.*="?null"?;\n?', targetReg: '', comment: '' },
    { enable: true, originReg: '(\\w+)=?\\w*\\s*[\\[\\{]', targetReg: '"$1": {', comment: '' },
    { enable: true, originReg: '[\\]\\}][;,]', targetReg: '},', comment: '' },
    { enable: true, originReg: '(\\w+)=(.*)[;,]', targetReg: '"$1": "$2",', comment: '' },
    { enable: true, originReg: '(\\w+)=(.*)', targetReg: '"$1": "$2"', comment: '' },
    { enable: true, originReg: ',(\\n\\d*\\})', targetReg: '$1', comment: '' },
    { enable: true, originReg: ': "(true|false)"', targetReg: ': $1', comment: '字符串转boolean' },
    { enable: true, originReg: ',(\n\\s*[\\}\\]])', targetReg: '$1', comment: '' },
    { enable: false, originReg: '\\s*\\n\\s*', targetReg: '', comment: '文本压缩' }
  ],
  value: '',
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

// JSON格式化校验
function formatValidate() {
  const value = toString2JsonData.value.value
  if (!value || value === '') {
    message.info('请输入内容')
  }
  const result = validateJson(value)
  if (result.error) {
    notification.error({
      message: 'JSON格式错误',
      description: result.message,
      placement: 'topRight'
    })
  } else {
    message.success('正确的JSON')
  }
}
</script>

<template>
  <a-modal title="ToString转JSON" v-model:open="toString2JsonData.openToString2Json" cancel-text="关闭" ok-text="转换" @ok="toString2Json" width="60vw">
    <a-alert message="将从上到下执行正则替换" type="info" closable
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
    <a-button size="small" block @click="handleAdd(undefined)" @change="handleChange"><Icon icon="ant-design:plus-outline" />添加</a-button>
  </a-modal>
  <a-modal title="转换结果" v-model:open="toString2JsonData.openJsonFormat" width="60vw" :footer="null">
    <MonacoEditor language="json" v-model="toString2JsonData.value" @dblClick="formatValidate" height="60vh" word-wrap>
      <template #title>
        <div class="tip-font">
          Tip：双击格式化校验JSON
        </div>
      </template>
    </MonacoEditor>
  </a-modal>
</template>

<style scoped>

</style>