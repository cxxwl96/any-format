import { reactive } from 'vue'
import type { RouteComponent, RouteRecordRaw } from 'vue-router'

// ['AnyFormat', 'JSON', 'XML', 'HTML', 'SQL', 'QRCode', 'Base64', 'Encode', 'Hex']
const menus: { value: string, payload?: any, component: string }[] = reactive(
  [
    {
      value: 'LogFormat',
      component: '/src/views/log-format/LogFormat.vue'
    },
    {
      value: 'JSON',
      component: '/src/views/json/JsonFormat.vue'
    },
    {
      value: 'XML',
      component: '/src/views/xml/XmlFormat.vue'
    },
    {
      value: 'QRCode',
      component: '/src/views/xml/XmlFormat.vue'
    },
    {
      value: 'Base64',
      component: '/src/views/xml/XmlFormat.vue'
    },
    {
      value: 'UrlEncode',
      component: '/src/views/xml/XmlFormat.vue'
    }
  ]
)

export {
  menus
}