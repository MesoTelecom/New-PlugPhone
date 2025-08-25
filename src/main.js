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
      return getToken(messaging, { vapidKey: "BHUHIxXM1SJWjDOOlQS1C3fO4t4My_CFbCFqJ-uDIUTkDeYHg-iW4PvoKgOtidjgqssxgHSQlPJ6s9KyEC1YkUY"});
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
