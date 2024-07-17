import { reactive, shallowRef } from 'vue'
import LogFormat from '@/views/log/LogFormat.vue'
import JsonFormat from '@/views/json/JsonFormat.vue'
import XmlFormat from '@/views/xml/XmlFormat.vue'
import Code from '@/views/code/Code.vue'
import QrCode from '@/views/qrcode/QrCode.vue'
import Encoder from '@/views/encode/Encoder.vue'
import RegExp from '@/views/regexp/RegExp.vue'

// ['AnyFormat', 'JSON', 'XML', 'HTML', 'SQL', 'QRCode', 'Base64', 'Encode', 'Hex']
const menus: { value: string, label?: string, component: any, reloadOnActive?: boolean }[] = reactive(
  [
    {
      value: 'LogFormat',
      component: shallowRef(LogFormat)
    },
    {
      value: 'JSON',
      component: shallowRef(JsonFormat),
      reloadOnActive: true
    },
    {
      value: 'XML',
      component: shallowRef(XmlFormat),
      reloadOnActive: true,
    },
    {
      value: 'QRCode',
      component: shallowRef(QrCode)
    },
    {
      value: 'Encoder',
      component: shallowRef(Encoder)
    },
    {
      value: 'RegExp',
      component: shallowRef(RegExp)
    },
    {
      value: 'Code',
      component: shallowRef(Code)
    }
  ]
)

export {
  menus
}