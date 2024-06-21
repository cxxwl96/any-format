import { reactive, shallowRef } from 'vue'
import LogFormat from '@/views/log-format/LogFormat.vue'
import JsonFormat from '@/views/json/JsonFormat.vue'
import XmlFormat from '@/views/xml/XmlFormat.vue'

// ['AnyFormat', 'JSON', 'XML', 'HTML', 'SQL', 'QRCode', 'Base64', 'Encode', 'Hex']
const menus: { value: string, payload?: any, component: any }[] = reactive(
  [
    {
      value: 'LogFormat',
      component: shallowRef(LogFormat)
    },
    {
      value: 'JSON',
      component: shallowRef(JsonFormat)
    },
    {
      value: 'XML',
      component: shallowRef(XmlFormat)
    },
    {
      value: 'QRCode',
      component: shallowRef(XmlFormat)
    },
    {
      value: 'Base64',
      component: shallowRef(XmlFormat)
    },
    {
      value: 'UrlEncode',
      component: shallowRef(XmlFormat)
    }
  ]
)

export {
  menus
}