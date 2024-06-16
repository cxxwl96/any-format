import { reactive } from 'vue'
import type { RouteRecordRaw } from 'vue-router'

// ['AnyFormat', 'JSON', 'XML', 'HTML', 'SQL', 'QRCode', 'Base64', 'Encode', 'Hex']
const menus: Readonly<RouteRecordRaw[]> = reactive(
  [
    {
      path: '/',
      redirect: {
        path: '/LogFormat'
      }
    },
    {
      path: '/LogFormat',
      name: 'LogFormat',
      component: () => import('../views/log-format/LogFormat.vue')
    },
    {
      path: '/JSON',
      name: 'JSON',
      component: () => import('../views/json/JsonFormat.vue')
    },
    // {
    //   path: '/XML',
    //   name: 'XML'
    // },
    // {
    //   path: '/HTML',
    //   name: 'HTML'
    // },
    // {
    //   path: '/SQL',
    //   name: 'SQL'
    // },
    // {
    //   path: '/QRCode',
    //   name: 'QRCode'
    // },
    // {
    //   path: '/Base64',
    //   name: 'Base64'
    // },
    // {
    //   path: '/Encode',
    //   name: 'Encode'
    // },
    // {
    //   path: '/Hex',
    //   name: 'Hex'
    // }
  ]
)

export {
  menus
}