<script setup lang="ts">
import { ref } from 'vue'

type CronItemType = 'EveryOne' | 'FromTo' | 'BeginToStep' | 'Assign' | 'UnAssign'
interface CronItem {
  key: string;
  name: string;
  type: CronItemType,
  radioGroup: {
    EveryOne?: boolean;
    FromTo?: { from: number; to: number; max: number; };
    BeginToStep?: { begin: number; step: number; max: number; };
    Assign?: {
      value: number[];
      max: number;
    };
    UnAssign?: boolean;
  }
}

const cronItems = ref<CronItem[]>([
  {
    key: 'second',
    name: '秒',
    type: 'EveryOne',
    radioGroup: {
      EveryOne: true,
      FromTo: { from: 0, to: 1, max: 59},
      BeginToStep: { begin: 0, step: 1, max: 59 },
      Assign: { value: [0], max: 59 },
    }
  },
  {
    key: 'minute',
    name: '分钟',
    type: 'EveryOne',
    radioGroup: {
      EveryOne: true,
      FromTo: { from: 0, to: 1, max: 59 },
      BeginToStep: { begin: 0, step: 1, max: 59 },
      Assign: { value: [0], max: 59 },
    }
  },
  {
    key: 'hour',
    name: '小时',
    type: 'EveryOne',
    radioGroup: {
      EveryOne: true,
      FromTo: { from: 0, to: 1, max: 23 },
      BeginToStep: { begin: 0, step: 1, max: 23 },
      Assign: { value: [0], max: 23 },
    }
  },
  {
    key: 'day',
    name: '日',
    type: 'EveryOne',
    radioGroup: {
      EveryOne: true,
      FromTo: { from: 0, to: 1, max: 31 },
      BeginToStep: { begin: 0, step: 1, max: 31 },
      Assign: { value: [0], max: 31 },
    }
  },
  {
    key: 'month',
    name: '月',
    type: 'EveryOne',
    radioGroup: {
      EveryOne: true,
      FromTo: { from: 0, to: 1, max: 12 },
      BeginToStep: { begin: 0, step: 1, max: 12 },
      Assign: { value: [0], max: 12 },
    }
  },
  {
    key: 'week',
    name: '周',
    type: 'EveryOne',
    radioGroup: {
      EveryOne: true,
      FromTo: { from: 0, to: 1, max: 23 },
      BeginToStep: { begin: 0, step: 1, max: 23 },
      Assign: { value: [0], max: 59 },
    }
  },
  {
    key: 'year',
    name: '年',
    type: 'EveryOne',
    radioGroup: {
      EveryOne: true,
      FromTo: { from: 0, to: 1, max: 23 },
      BeginToStep: { begin: 0, step: 1, max: 23 },
      Assign: { value: [0], max: 59 },
    }
  }
])


const selectOptions = (length: number, begin?: number) => {
  const a = begin || 0
  return [...Array(length)].map((_, i) => ({value: i + a}))
}
const disabled = (cronItem: CronItem, type: CronItemType) => {
  return cronItem.type !== type;
}
const tableColumns = [
  { title: '秒', dataIndex: 'second' },
  { title: '分钟', dataIndex: 'minute' },
  { title: '小时', dataIndex: 'hour' },
  { title: '日', dataIndex: 'day' },
  { title: '月', dataIndex: 'month' },
  { title: '周', dataIndex: 'week' },
  { title: '年', dataIndex: 'year' },
]
const tableDataSource = [{second: '*', minute: '*', hour: '*', day: '*', month: '*', week: '?', year: ''}]
</script>

<template>
  <div class="content-center">
    <a-tabs>
      <a-tab-pane v-for="cronItem in cronItems" :key="cronItem.key" :tab="cronItem.name">
        <a-radio-group v-model:value="cronItem.type"  class="cron-form-content">
          <a-space direction="vertical" :size="20">
            <a-radio v-if="cronItem.radioGroup.EveryOne" value="EveryOne">每{{cronItem.name}}</a-radio>
            <a-radio v-if="cronItem.radioGroup.FromTo" value="FromTo">
              <a-space align="center">
                每{{cronItem.name}}从<a-input-number v-model:value="cronItem.radioGroup.FromTo.from" :disabled="disabled(cronItem,'FromTo')" min="0" :max="cronItem.radioGroup.FromTo.max" />
                到<a-input-number v-model:value="cronItem.radioGroup.FromTo.to" :disabled="disabled(cronItem,'FromTo')" min="0" :max="cronItem.radioGroup.FromTo.max" />
                {{cronItem.name}}
              </a-space>
            </a-radio>
            <a-radio v-if="cronItem.radioGroup.BeginToStep" value="BeginToStep">
              <a-space align="center">
                从第<a-input-number v-model:value="cronItem.radioGroup.BeginToStep.begin" :disabled="disabled(cronItem,'BeginToStep')" min="0" :max="cronItem.radioGroup.BeginToStep.max" />
                {{cronItem.name}}开始，每<a-input-number v-model:value="cronItem.radioGroup.BeginToStep.step" :disabled="disabled(cronItem,'BeginToStep')" min="0" :max="cronItem.radioGroup.BeginToStep.max" />
                {{cronItem.name}}执行一次
              </a-space>
            </a-radio>
            <a-space v-if="cronItem.radioGroup.Assign" align="center">
              <a-radio value="Assign">指定</a-radio>
              <a-select mode="multiple" style="min-width: 100px" :options="selectOptions(60)" v-model:value="cronItem.radioGroup.Assign.value" :disabled="disabled(cronItem,'Assign')" />
            </a-space>
          </a-space>
        </a-radio-group >
      </a-tab-pane>
    </a-tabs>
    <a-divider />
    <a-table :columns="tableColumns" :dataSource="tableDataSource" />
  </div>
</template>

<style scoped>
.cron-form-content {
  width: 100%;
  padding: 19px 16px;
  background-color: #00000005;
  border-radius: 8px;
}
</style>