import type { MenuItem } from '@/components/DragableMenu'
import { getEnv } from '@/data/env'

const isDev = getEnv('DEV')

// ['AnyFormat', 'JSON', 'XML', 'HTML', 'SQL', 'QRCode', 'Base64', 'Encode', 'Hex']
const menus: MenuItem[] = [
  {
    label: 'LogFormat',
    key: 'LogFormat',
    component: () => import('@/views/log/LogFormat.vue'),
  },
  {
    label: 'JSON',
    key: 'JSON',
    component: () => import('@/views/json/JsonFormat.vue'),
  },
  {
    label: 'XML',
    key: 'XML',
    component: () => import('@/views/xml/XmlFormat.vue'),
  },
  {
    label: '转换',
    key: 'DataTransfer',
    component: () => import('@/views/DataTransfer/DataTransfer.vue'),
  },
  {
    label: '简/繁',
    key: 'OpenCC',
    component: () => import('@/views/opencc/OpenCCTransfer.vue'),
  },
  {
    label: '文本对比',
    key: 'TextCompare',
    component: () => import('@/views/comparator/TextComparator.vue')
  },
  {
    label: 'QRCode',
    key: 'QRCode',
    component: () => import('@/views/qrcode/QrCode.vue')
  },
  {
    label: 'Encoder',
    key: 'Encoder',
    component: () => import('@/views/encode/Encoder.vue')
  },
  {
    label: 'RegExp',
    key: 'RegExp',
    component: () => import('@/views/regexp/RegExp.vue')
  },
  {
    label: 'Cron',
    key: 'Cron',
    component: () => import('@/views/cron/Cron.vue')
  },
  {
    label: 'JSRunner',
    key: 'JSRunner',
    component: () => import('@/views/runner/JSRunner.vue')
  },
  {
    label: '画板',
    key: 'Excalidraw',
    component: () => import('@/views/excalidraw/Excalidraw.vue'),
    hideHeader: true,
    hideFooter: true,
    fullContent: true,
  },
  {
    label: 'IconPicker',
    key: 'IconPicker',
    component: () => import('@/views/demo/IconPickerDemo.vue'),
    fullContent: false,
    hide: !isDev
  },
  {
    label: '来个Demo',
    key: 'Demo',
    component: () => import('@/views/demo/Demo.vue'),
    fullContent: false,
    hide: !isDev
  }
];

export {
  menus
}