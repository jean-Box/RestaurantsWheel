import { createRouter, createWebHistory } from 'vue-router'

const routes =  [
    {
      path: '/',
      name : 'mainApp',
      component: () => import('./App.vue')
    },
    {
      path: '/restaurant-wheel',
      name : 'RestaurantWheel',
      component: () => import('./RestaurantWheel/App.vue')
    },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router