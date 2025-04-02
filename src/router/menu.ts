import { shallowRef } from 'vue'
import LogFormat from '@/views/log/LogFormat.vue'
import JsonFormat from '@/views/json/JsonFormat.vue'
import XmlFormat from '@/views/xml/XmlFormat.vue'
import CodeDemo from '@/views/code/CodeDemo.vue'
import QrCode from '@/views/qrcode/QrCode.vue'
import Encoder from '@/views/encode/Encoder.vue'
import RegExp from '@/views/regexp/RegExp.vue'
import JSRunner from '@/views/runner/JSRunner.vue'
import TextComparator from '@/views/comparator/TextComparator.vue'
import Test from '@/views/test/Test.vue'
import Excalidraw from '@/views/excalidraw/Excalidraw.vue'
import type { MenuItem } from '@/components/DragableMenu'

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
    label: 'TextCompare',
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
    fullScreen: true,
  },
  {
    label: '代码',
    key: 'Code',
    component: shallowRef(CodeDemo),
    hide: true
  },
  {
    label: '测试',
    key: 'Test',
    component: shallowRef(Test),
    hide: true
  }
];

export {
  menus
}