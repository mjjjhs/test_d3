import Vue from 'vue';
import Router from 'vue-router';
import Selection from './views/Selection.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'Selection',
      component: Selection,
    },
    {
      path: '/datactl',
      name: 'DataControl',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ './views/DataControl.vue'),
    },
    {
      path: '/svgctl',
      name: 'SvgControl',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ './views/SvgControl.vue'),
    },
  ],
});
