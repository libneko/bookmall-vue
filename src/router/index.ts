import { createRouter, createWebHistory } from 'vue-router'

// import IndexView from '@/views/index/index.vue'
// import ClazzView from '@/views/clazz/index.vue'
// import DeptView from '@/views/dept/index.vue'
// import EmpView from '@/views/emp/index.vue'
// import LogView from '@/views/log/index.vue'
// import Stuview from '@/views/stu/index.vue'
// import EmpReportView from '@/views/report/emp/index.vue'
// import StuReportView from '@/views/report/stu/index.vue'
import LayoutView from '@/views/layout/index.vue'
import LoginView from '@/views/login/index.vue'
import RegisterView from '@/views/register/index.vue'
import ShoppingCartView from '@/views/shopping-cart/index.vue'
import SearchView from '@/views/search/index.vue'
import IntroductionView from '@/views/Introduction/index.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: LayoutView,
      children: [
        // { path: '/index', name: 'index', component: IndexView },
        // { path: '/clazz', name: 'clazz', component: ClazzView },
        // { path: '/stu', name: 'stu', component: Stuview },
        // { path: '/dept', name: 'dept', component: DeptView },
        // { path: '/emp', name: 'emp', component: EmpView },
        // { path: '/log', name: 'log', component: LogView },
        // { path: '/empReport', name: 'empReport', component: EmpReportView },
        // { path: '/stuReport', name: 'stuReport', component: StuReportView },
        {
          path: '/shopping-cart',
          name: 'shopping-cart',
          component: ShoppingCartView,
          meta: { title: '我的购物车' },
        },
        {
          path: '/search',
          name: 'search',
          component: SearchView,
          meta: { title: '搜索' },
        },
        {
          path: '/introduction',
          name: 'introduction',
          component: IntroductionView,
          meta: { title: '书本详情' },
        },
      ],
    },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
  ],
})

export default router
