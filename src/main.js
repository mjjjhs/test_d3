import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import myPlugin from '@/assets/js/plugin';
import '@/assets/fonts/flowfont/flowfont.css';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCoffee } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(faCoffee);
Vue.component('font-awesome-icon', FontAwesomeIcon);

import 'reset-css';

Vue.config.productionTip = false;
Vue.use(myPlugin);

const app = new Vue({
  data() {
    return {
      svg: null,
      canvas: null,
      snapAlignmentPixels: 8,
      SUPPORTS_SVG: !!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect
    };
  },
  router,
  store,
  render: h => h(App),
}).$mount('#app');
