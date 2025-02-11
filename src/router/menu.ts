import { reactive, shallowRef } from 'vue'
import LogFormat from '@/views/log/LogFormat.vue'
import JsonFormat from '@/views/json/JsonFormat.vue'
import XmlFormat from '@/views/xml/XmlFormat.vue'
import CodeDemo from '@/views/code/CodeDemo.vue'
import QrCode from '@/views/qrcode/QrCode.vue'
import Encoder from '@/views/encode/Encoder.vue'
import RegExp from '@/views/regexp/RegExp.vue'
import JSRunner from '@/views/runner/JSRunner.vue'
import TextComparator from '@/views/comparator/TextComparator.vue'

// ['AnyFormat', 'JSON', 'XML', 'HTML', 'SQL', 'QRCode', 'Base64', 'Encode', 'Hex']
const menus: { value: string, label?: string, component: any, reloadOnActive?: boolean }[] = reactive(
  [
    {
      value: 'LogFormat',
      component: shallowRef(LogFormat),
      reloadOnActive: true,
    },
    {
      value: 'JSON',
      component: shallowRef(JsonFormat),
      reloadOnActive: true,
    },
    {
      value: 'XML',
      component: shallowRef(XmlFormat),
      reloadOnActive: true,
    },
    {
      value: 'TextCompare',
      component: shallowRef(TextComparator),
    },
    {
      value: 'QRCode',
      component: shallowRef(QrCode),
    },
    {
      value: 'Encoder',
      component: shallowRef(Encoder),
    },
    {
      value: 'RegExp',
      component: shallowRef(RegExp),
    },
    // {
    //   value: 'Code',
    //   component: shallowRef(CodeDemo),
    // },
    {
      value: 'JSRunner',
      component: shallowRef(JSRunner),
    }
  ]
)

export {
  menus
}