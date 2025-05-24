<script setup lang="ts">
import {ref} from 'vue'
import CronParser from 'cron-parser'
import { message, notification } from 'ant-design-vue'

type CronItemKey = 'second' | 'minute' | 'hour' | 'day' | 'month' | 'week' | 'year'
type CronItemName = '秒' | '分钟' | '小时' | '日' | '月' | '周' | '年'
type CronItemType =
  | 'EveryOne'
  | 'FromTo'
  | 'BeginToStep'
  | 'Assign'
  | 'UnAssign'
  | 'NearWorkDay'
  | 'LastDay'
  | 'DayOfWeek'
  | 'LastWeek'

interface CronItem {
  key: CronItemKey
  name: CronItemName
  type: CronItemType
  radioGroup: {
    EveryOne?: boolean // 每个
    UnAssign?: boolean // 不指定
    FromTo?: { from: number; to: number; min?: number; max: number } // 周期
    BeginToStep?: { begin: number; step: number; min?: number; max: number } // 从第几开始，每隔几执行一次
    Assign?: { value: number[]; min?: number; max: number } // 指定
    NearWorkDay?: { value: number; min?: number; max: number } // 离工作日最近的那天
    LastDay?: boolean // 每月最后一天
    DayOfWeek?: { day: number; week: number; min?: number; max: number } // 第几周的周几
    LastWeek?: { value: number; min?: number; max: number } // 每月最后一个周几
  }
}

const cronItems = ref<CronItem[]>([
  {
    key: 'second',
    name: '秒',
    type: 'EveryOne',
    radioGroup: {
      EveryOne: true,
      FromTo: { from: 0, to: 1, max: 59 },
      BeginToStep: { begin: 0, step: 1, max: 59 },
      Assign: { value: [0], max: 59 }
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
      Assign: { value: [0], max: 59 }
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
      Assign: { value: [0], max: 23 }
    }
  },
  {
    key: 'day',
    name: '日',
    type: 'EveryOne',
    radioGroup: {
      EveryOne: true,
      UnAssign: true,
      FromTo: { from: 1, to: 2, min: 1, max: 31 },
      BeginToStep: { begin: 1, step: 1, min: 1, max: 31 },
      Assign: { value: [1], min: 1, max: 31 },
      NearWorkDay: { value: 1, min: 1, max: 31 },
      LastDay: true
    }
  },
  {
    key: 'month',
    name: '月',
    type: 'EveryOne',
    radioGroup: {
      EveryOne: true,
      FromTo: { from: 1, to: 2, min: 1, max: 12 },
      BeginToStep: { begin: 1, step: 1, min: 1, max: 12 },
      Assign: { value: [1], min: 1, max: 12 }
    }
  },
  {
    key: 'week',
    name: '周',
    type: 'UnAssign',
    radioGroup: {
      EveryOne: true,
      FromTo: { from: 1, to: 2, min: 1, max: 7 },
      DayOfWeek: { day: 1, week: 1, min: 1, max: 7 },
      LastWeek: { value: 1, min: 1, max: 7 },
      Assign: { value: [1], min: 1, max: 7 },
      UnAssign: true
    }
  },
  {
    key: 'year',
    name: '年',
    type: 'UnAssign',
    radioGroup: {
      EveryOne: true,
      UnAssign: true,
      FromTo: { from: new Date().getFullYear(), to: new Date().getFullYear() + 1, max: 2099 }
    }
  }
])

const resultData = ref<{
  weekOptions: {value: number, label: string}[],
  tableColumns: { title: CronItemName; dataIndex: CronItemKey }[]
  tableDataSource: { [key: string]: string }[]
  inputData: string
  executeCount: number
  openCronModal: boolean
  cronDemoList: { cron: string; desc: string }[]
  result: string[]
}>({
  weekOptions: [
    { value: 1, label: '星期一' },
    { value: 2, label: '星期二' },
    { value: 3, label: '星期三' },
    { value: 4, label: '星期四' },
    { value: 5, label: '星期五' },
    { value: 6, label: '星期六' },
    { value: 7, label: '星期日' }
  ],
  tableColumns: [
    { title: '秒', dataIndex: 'second' },
    { title: '分钟', dataIndex: 'minute' },
    { title: '小时', dataIndex: 'hour' },
    { title: '日', dataIndex: 'day' },
    { title: '月', dataIndex: 'month' },
    { title: '周', dataIndex: 'week' },
    { title: '年', dataIndex: 'year' }
  ],
  tableDataSource: [
    { second: '*', minute: '*', hour: '*', day: '*', month: '*', week: '?', year: '' }
  ],
  inputData: '* * * * * ?',
  executeCount: 10,
  openCronModal: false,
  cronDemoList: [
    { cron: '0/2 * * * * ?', desc: '表示每2秒触发' },
    { cron: '0 0/2 * * * ?', desc: '表示每2分钟触发' },
    { cron: '0 0 2 1 * ?', desc: '表示在每月的1日的凌晨2点触发' },
    { cron: '0 15 10 ? * MON-FRI', desc: '表示周一到周五每天上午10:15触发' },
    { cron: '0 15 10 ? * 6L 2002-2006', desc: '表示2002-2006年的每个月的最后一个星期五上午10:15触发'},
    { cron: '0 0 10,14,16 * * ?', desc: '每天上午10点，下午2点，4点触发' },
    { cron: '0 0/30 9-17 * * ?', desc: '朝九晚五工作时间内每半小时触发' },
    { cron: '0 0 12 ? * WED', desc: '表示每个星期三中午12点触发' },
    { cron: '0 0 12 * * ?', desc: '每天中午12点触发' },
    { cron: '0 15 10 ? * *', desc: '每天上午10:15触发' },
    { cron: '0 15 10 * * ?', desc: '每天上午10:15触发' },
    { cron: '0 15 10 * * ?', desc: '每天上午10:15触发' },
    { cron: '0 15 10 * * ? 2005', desc: '2005年的每天上午10:15触发' },
    { cron: '0 * 14 * * ?', desc: '在每天下午2点到下午2:59期间的每1分钟触发' },
    { cron: '0 0/5 14 * * ?', desc: '在每天下午2点到下午2:55期间的每5分钟触发' },
    { cron: '0 0/5 14,18 * * ?', desc: '在每天下午2点到2:55期间和下午6点到6:55期间的每5分钟触发' },
    { cron: '0 0-5 14 * * ?', desc: '在每天下午2点到下午2:05期间的每1分钟触发' },
    { cron: '0 10,44 14 ? 3 WED', desc: '每年三月的星期三的下午2:10和2:44触发' },
    { cron: '0 15 10 ? * MON-FRI', desc: '周一至周五的上午10:15触发' },
    { cron: '0 15 10 15 * ?', desc: '每月15日上午10:15触发' },
    { cron: '0 15 10 L * ?', desc: '每月最后一日的上午10:15触发' },
    { cron: '0 15 10 ? * 6L', desc: '每月的最后一个星期五上午10:15触发' },
    { cron: '0 15 10 ? * 6L 2002-2005', desc: '2002年至2005年的每月的最后一个星期五上午10:15触发' },
    { cron: '0 15 10 ? * 6#3', desc: '每月的第三个星期五上午10:15触发' }
  ],
  result: []
})

const selectOptions = (cronItem: CronItem) => {
  if (cronItem.key === 'week') {
    return resultData.value.weekOptions;
  }
  const min = cronItem.radioGroup.Assign?.min || 0
  const max = cronItem.radioGroup.Assign?.max || 0
  const options = []
  for (let i = min; i <= max; i++) {
    options.push({ value: i })
  }
  return options
}
const disabled = (cronItem: CronItem, type: CronItemType) => {
  return cronItem.type !== type
}
const stopPropagation = (e: MouseEvent) => {
  e.preventDefault()
  e.stopPropagation()
}
const anyChange = (cronItem: CronItem, type: CronItemType) => {
  let val = ''
  if (type === 'EveryOne') {
    val = '*'
  } else if (type === 'FromTo') {
    const fromTo = cronItem.radioGroup.FromTo
    val = `${fromTo?.from}-${fromTo?.to}`
  } else if (type === 'BeginToStep') {
    const beginToStep = cronItem.radioGroup.BeginToStep
    val = `${beginToStep?.begin}/${beginToStep?.step}`
  } else if (type === 'Assign') {
    val = cronItem.radioGroup.Assign?.value.join(',') || ' '
  } else if (type === 'UnAssign') {
    if (cronItem.key === 'year') {
      val = ''
    } else {
      val = '?'
    }
  } else if (type === 'NearWorkDay') {
    val = `${cronItem.radioGroup.NearWorkDay?.value}W`
  } else if (type === 'LastDay') {
    val = 'L'
  } else if (type === 'DayOfWeek') {
    const dayOfWeek = cronItem.radioGroup.DayOfWeek
    val = `${dayOfWeek?.day}#${dayOfWeek?.week}`
  } else if (type === 'LastWeek') {
    val = `${cronItem.radioGroup.LastWeek?.value}L`
  }
  resultData.value.tableDataSource[0][cronItem.key] = val
  tableChange()
}
const tableChange = () => {
  resultData.value.inputData = Object.values(resultData.value.tableDataSource[0])
    .filter((item) => item)
    .join(' ')
}
const inputChange = () => {
  const split = resultData.value.inputData.split(' ')
  let i = 0
  for (const item in resultData.value.tableDataSource[0]) {
    if (i >= split.length) {
      // @ts-ignore
      resultData.value.tableDataSource[0][item] = ''
    } else {
      // @ts-ignore
      resultData.value.tableDataSource[0][item] = split[i++]
    }
  }
}
const execute = () => {
  try {
    resultData.value.result.splice(0, resultData.value.result.length)
    CronParser.parse(resultData.value.inputData)
      .take(resultData.value.executeCount)
      .forEach((item) => {
        const date = item.toDate();
        const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        resultData.value.result.push(`${date.toLocaleString()} ${days[date.getDay()]}`)
      })
    message.success('执行成功')
  } catch (e: any) {
    notification.error({
      message: '执行失败',
      description: e?.message,
      placement: 'topRight'
    })
  }
}
</script>

<template>
  <div class="content-center">
    <a-divider orientation="left" orientationMargin="0">表达式配置</a-divider>
    <a-tabs>
      <a-tab-pane v-for="cronItem in cronItems" :key="cronItem.key" :tab="cronItem.name">
        <a-radio-group
          v-model:value="cronItem.type"
          class="cron-content"
          @change="(e: any) => anyChange(cronItem, e.target.value)"
        >
          <a-space direction="vertical" :size="20">
            <a-radio v-if="cronItem.radioGroup.EveryOne" value="EveryOne"
            >每{{ cronItem.name }}</a-radio
            >
            <a-radio v-if="cronItem.radioGroup.UnAssign" value="UnAssign">不指定</a-radio>
            <a-radio v-if="cronItem.radioGroup.FromTo" value="FromTo">
              <a-space v-if="cronItem.key === 'week'" align="center">
                周期从
                <a-select
                  style="min-width: 100px"
                  :options="selectOptions(cronItem)"
                  v-model:value="cronItem.radioGroup.FromTo.from"
                  :disabled="disabled(cronItem, 'FromTo')"
                  @click="stopPropagation"
                  @change="anyChange(cronItem, 'FromTo')"
                />
                到
                <a-select
                  style="min-width: 100px"
                  :options="selectOptions(cronItem)"
                  v-model:value="cronItem.radioGroup.FromTo.to"
                  :disabled="disabled(cronItem, 'FromTo')"
                  @click="stopPropagation"
                  @change="anyChange(cronItem, 'FromTo')"
                />
              </a-space>
              <a-space v-else align="center">
                周期从
                <a-input-number
                  v-model:value="cronItem.radioGroup.FromTo.from"
                  :disabled="disabled(cronItem, 'FromTo')"
                  :min="cronItem.radioGroup.FromTo.min || 0"
                  :max="cronItem.radioGroup.FromTo.max"
                  @change="anyChange(cronItem, 'FromTo')"
                />
                {{ cronItem.name }}到
                <a-input-number
                  v-model:value="cronItem.radioGroup.FromTo.to"
                  :disabled="disabled(cronItem, 'FromTo')"
                  :min="cronItem.radioGroup.FromTo.min || 0"
                  :max="cronItem.radioGroup.FromTo.max"
                  @change="anyChange(cronItem, 'FromTo')"
                />
                {{ cronItem.name }}
              </a-space>
            </a-radio>
            <a-radio v-if="cronItem.radioGroup.BeginToStep" value="BeginToStep">
              <a-space align="center">
                从第
                <a-input-number
                  v-model:value="cronItem.radioGroup.BeginToStep.begin"
                  :disabled="disabled(cronItem, 'BeginToStep')"
                  :min="cronItem.radioGroup.BeginToStep.min || 0"
                  :max="cronItem.radioGroup.BeginToStep.max"
                  @change="anyChange(cronItem, 'BeginToStep')"
                />
                {{ cronItem.name }}开始，每
                <a-input-number
                  v-model:value="cronItem.radioGroup.BeginToStep.step"
                  :disabled="disabled(cronItem, 'BeginToStep')"
                  :min="cronItem.radioGroup.BeginToStep.min || 0"
                  :max="cronItem.radioGroup.BeginToStep.max"
                  @change="anyChange(cronItem, 'BeginToStep')"
                />
                {{ cronItem.name }}执行一次
              </a-space>
            </a-radio>
            <a-radio v-if="cronItem.radioGroup.Assign" value="Assign">
              <a-space align="center">
                指定
                <a-select
                  mode="multiple"
                  style="min-width: 100px"
                  :options="selectOptions(cronItem)"
                  v-model:value="cronItem.radioGroup.Assign.value"
                  :disabled="disabled(cronItem, 'Assign')"
                  @click="stopPropagation"
                  @change="anyChange(cronItem, 'Assign')"
                />
              </a-space>
            </a-radio>
            <a-radio v-if="cronItem.radioGroup.NearWorkDay" value="NearWorkDay">
              <a-space align="center">
                每月
                <a-input-number
                  v-model:value="cronItem.radioGroup.NearWorkDay.value"
                  :disabled="disabled(cronItem, 'NearWorkDay')"
                  :min="cronItem.radioGroup.NearWorkDay.min || 0"
                  :max="cronItem.radioGroup.NearWorkDay.max"
                  @change="anyChange(cronItem, 'NearWorkDay')"
                />
                日最近的那个工作日
              </a-space>
            </a-radio>
            <a-radio v-if="cronItem.radioGroup.LastDay" value="LastDay">每月最后一天</a-radio>
            <a-radio v-if="cronItem.radioGroup.DayOfWeek" value="DayOfWeek">
              <a-space align="center">
                第
                <a-input-number
                  v-model:value="cronItem.radioGroup.DayOfWeek.day"
                  :disabled="disabled(cronItem, 'DayOfWeek')"
                  :min="cronItem.radioGroup.DayOfWeek.min || 0"
                  :max="cronItem.radioGroup.DayOfWeek.max"
                  @change="anyChange(cronItem, 'DayOfWeek')"
                />
                周的
                <a-select
                  style="min-width: 100px"
                  :options="selectOptions(cronItem)"
                  v-model:value="cronItem.radioGroup.DayOfWeek.week"
                  :disabled="disabled(cronItem, 'DayOfWeek')"
                  @click="stopPropagation"
                  @change="anyChange(cronItem, 'DayOfWeek')"
                />
              </a-space>
            </a-radio>
            <a-radio v-if="cronItem.radioGroup.LastWeek" value="LastWeek">
              <a-space align="center">
                每月最后一个
                <a-select
                  style="min-width: 100px"
                  :options="selectOptions(cronItem)"
                  v-model:value="cronItem.radioGroup.LastWeek.value"
                  :disabled="disabled(cronItem, 'LastWeek')"
                  @click="stopPropagation"
                  @change="anyChange(cronItem, 'LastWeek')"
                />
              </a-space>
            </a-radio>
          </a-space>
        </a-radio-group>
      </a-tab-pane>
    </a-tabs>
    <a-table
      :columns="resultData.tableColumns"
      :dataSource="resultData.tableDataSource"
      :pagination="false"
    >
      <template #headerCell="{title}">
        <p style="text-align: center; margin: 0">{{title}}</p>
      </template>
      <template #bodyCell="{record, column}">
        <a-input v-model:value="record[column.dataIndex]" :bordered="false" @change="tableChange" style="text-align: center; border-bottom: 1px solid #00000059; border-radius: 0"/>
      </template>
    </a-table>
    <a-divider orientation="left" orientationMargin="0">表达式预览</a-divider>
    <a-flex gap="middle" align="center">
      <a-input v-model:value="resultData.inputData" @change="inputChange" size="large">
        <template #addonAfter>
          <a class="un-select" @click="resultData.openCronModal = !resultData.openCronModal">
            常见的Cron
          </a>
        </template>
      </a-input>
      <a-input-number
        v-model:value="resultData.executeCount"
        min="1"
        :controls="false"
        addonAfter="次"
      />
      <a-button type="primary" @click="execute">执行</a-button>
    </a-flex>
    <a-list :data-source="resultData.result">
      <template #renderItem="{ item, index }">
        <a-list-item>
          <span class="tip-font">{{ index + 1 }}: </span>{{ item }}
        </a-list-item>
      </template>
    </a-list>
  </div>
  <a-modal v-model:open="resultData.openCronModal" title="常见的Cron" width="80vw" @ok="resultData.openCronModal = !resultData.openCronModal">
    <span class="tip-font">Tip：点击表达式选择</span>
    <a-list :data-source="resultData.cronDemoList">
      <template #renderItem="{ item, index }">
        <a-list-item>
          <span class="tip-font">{{ index + 1 }}、 </span>
          <a @click="() => {
            resultData.inputData = item.cron
            inputChange()
            resultData.openCronModal = false
          }">{{ item.cron }}</a>：
          <span>{{ item.desc }}</span>
        </a-list-item>
      </template>
    </a-list>
  </a-modal>
</template>
<style scoped>
.cron-content {
  width: 100%;
  padding: 19px 16px;
  background-color: #00000005;
  border-radius: 8px;
}
.ant-divider {
  color: #808080;
  font-size: 14px;
}
:global(.ant-table:not(.ant-table-bordered) .ant-table-tbody >tr:last-child>td) {
  border-bottom: none !important;
  background-color: #FAFAFA;
}
</style>
