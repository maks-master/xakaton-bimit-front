import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

import DefaultLayout from "@/layouts/Default"

export default new VueRouter({
  routes: [
    {
      path: '/',
      component: DefaultLayout,
      children: [
        { 
          path: '', 
          component: () => import('@/pages/Main.vue'), 
          alias: ['/home', '/index'] 
        }
      ]
    },
  ],
  linkActiveClass: 'active',
  mode: 'history',
})