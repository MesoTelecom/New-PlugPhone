import Vue from 'vue';
import App from './App.vue';
import router from './router';
import vuetify from './plugins/vuetify';
import store from './store';
import { askPermissionAndSubscribe } from './push';

Vue.config.productionTip = false;

new Vue({
  router,
  vuetify,
  store,
  async created() {
    this.subscription = await askPermissionAndSubscribe();
  },
  render: h => h(App)
}).$mount('#app');
