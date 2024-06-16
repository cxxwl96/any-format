import { createRouter, createWebHistory } from 'vue-router'
import { menus } from '@/router/menu'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: []
})

menus.forEach(menu => {
  router.addRoute(menu)
})

export default router
