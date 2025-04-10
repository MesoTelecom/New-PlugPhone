import Vue from 'vue';
import App from './App.vue';
import router from './router';
import vuetify from './plugins/vuetify';
import store from './store';
import { messaging } from './firebase'; // Importa a instância de messaging
import { getToken, onMessage } from 'firebase/messaging';

// Solicitar permissão para exibir notificações
Notification.requestPermission()
  .then((permission) => {
    if (permission === 'granted') {
      console.log('Permissão concedida');
      return getToken(messaging, { vapidKey: "BMJb6V3UmgAtIJe_dhTf7RP7jR-8Z4bjRp1eyV3f3CwY7a85xvq7ZIhDH4INKUz2hKHdKNd7-4avPAPjw4IoUK4" });
    } else {
      console.error('Permissão para notificações não concedida');
    }
  })
  .then((token) => {
    if (token) {
      console.log('Token FCM:', token);
      // Enviar o token para o backend para associar ao usuário
    }
  })
  .catch((err) => {
    console.log('Erro ao obter permissão ou token:', err);
  });

// Lidar com mensagens recebidas em primeiro plano
onMessage(messaging, (payload) => {
  console.log('Mensagem recebida em primeiro plano:', payload);
});

// Instanciar a aplicação Vue
new Vue({
  router,
  vuetify,
  store,
  render: h => h(App)
}).$mount('#app');
