import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

import BlankLayout from "@/layouts/Blank"

export default new VueRouter({
  routes: [
    {
      path: '/',
      component: BlankLayout,
      children: [
        { 
          path: '', 
          component: () => import('@/components/Home.vue'), 
          alias: ['/home', '/index'] 
        }
      ]
    },
  ],
  linkActiveClass: 'active',
  mode: 'history',
})