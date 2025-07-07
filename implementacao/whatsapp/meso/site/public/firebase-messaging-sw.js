// public/firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Inicializa o Firebase no Service Worker
const firebaseConfig = {
    apiKey: 'AIzaSyDhmZQqTr0GVtdBSTwNa1EeOPvRG-VA1dI',
    authDomain: 'flutterpushnotification-6cb4d.firebaseapp.com',
    projectId: 'flutterpushnotification-6cb4d',
    storageBucket: 'flutterpushnotification-6cb4d.appspot.com',
    messagingSenderId: '368837374170',
    appId: '1:368837374170:web:93b01478747cc839b535e3',
    measurementId: 'G-6Q2LNGT70E',
};

// Inicializa o Firebase com a configuração fornecida
firebase.initializeApp(firebaseConfig);

// Cria uma instância do Firebase Messaging
const messaging = firebase.messaging();

// Listener para mensagens recebidas em segundo plano
messaging.onBackgroundMessage((payload) => {
  console.log('Mensagem recebida em segundo plano:', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: 'path/to/your/icon.png', // Adicione o caminho para o ícone da notificação
  };

  // Exibe a notificação
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Listener para ações na notificação (opcional)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('https://mesotelecom.com.br') // Altere para o URL que você deseja abrir
  );
});
