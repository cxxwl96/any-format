import { createRouter, createWebHistory } from 'vue-router'
import { menus } from '@/router/menu'
import { unref } from 'vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: {
        path: '/' + (
          sessionStorage.getItem('activeKey') as string || unref(menus[0].value)
        )
      }
    }
  ]
})

menus.forEach(menu => {
  router.addRoute({
    path: '/' + menu.value,
    component: () => import(menu.component)
  })
})

export default router
