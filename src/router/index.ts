import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import MainPage from '../views/MainPage.vue'

const router: object = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    {
      path: '/main_page',
      component: MainPage,
      meta: { requiresAuth: true }
    },
    {
      path: '/home',
      redirect: () => {
        return '/main_page'
      }
    }
  ]
})

export default router
