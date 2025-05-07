import { shallowRef } from 'vue'
import type { MenuItem } from '@/components/DragableMenu'
import { getEnv } from '@/data/env'
import LogFormat from '@/views/log/LogFormat.vue'
import JsonFormat from '@/views/json/JsonFormat.vue'
import XmlFormat from '@/views/xml/XmlFormat.vue'
import DataTransfer from '@/views/DataTransfer/DataTransfer.vue'
import QrCode from '@/views/qrcode/QrCode.vue'
import Encoder from '@/views/encode/Encoder.vue'
import RegExp from '@/views/regexp/RegExp.vue'
import Cron from '@/views/cron/Cron.vue'
import JSRunner from '@/views/runner/JSRunner.vue'
import TextComparator from '@/views/comparator/TextComparator.vue'
import Excalidraw from '@/views/excalidraw/Excalidraw.vue'

// for test demo
import Demo from '@/views/demo/Demo.vue'

const isDev = getEnv('DEV')

// ['AnyFormat', 'JSON', 'XML', 'HTML', 'SQL', 'QRCode', 'Base64', 'Encode', 'Hex']
const menus: MenuItem[] = [
  {
    label: 'LogFormat',
    key: 'LogFormat',
    component: shallowRef(LogFormat),
  },
  {
    label: 'JSON',
    key: 'JSON',
    component: shallowRef(JsonFormat),
  },
  {
    label: 'XML',
    key: 'XML',
    component: shallowRef(XmlFormat),
  },
  {
    label: '转换',
    key: 'DataTransfer',
    component: shallowRef(DataTransfer),
  },
  {
    label: '文本对比',
    key: 'TextCompare',
    component: shallowRef(TextComparator)
  },
  {
    label: 'QRCode',
    key: 'QRCode',
    component: shallowRef(QrCode)
  },
  {
    label: 'Encoder',
    key: 'Encoder',
    component: shallowRef(Encoder)
  },
  {
    label: 'RegExp',
    key: 'RegExp',
    component: shallowRef(RegExp)
  },
  {
    label: 'Cron',
    key: 'Cron',
    component: shallowRef(Cron)
  },
  {
    label: 'JSRunner',
    key: 'JSRunner',
    component: shallowRef(JSRunner)
  },
  {
    label: '画板',
    key: 'Excalidraw',
    component: shallowRef(Excalidraw),
    hideHeader: true,
    hideFooter: true,
    fullContent: true,
  },
  {
    label: '来个Demo',
    key: 'Demo',
    component: shallowRef(Demo),
    fullContent: false,
    hide: !isDev
  }
];

export {
  menus
}