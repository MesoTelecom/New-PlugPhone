importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// 🔥 Configuração do Firebase
const firebaseConfig = {
    apiKey: 'AIzaSyDhmZQqTr0GVtdBSTwNa1EeOPvRG-VA1dI',
    authDomain: 'flutterpushnotification-6cb4d.firebaseapp.com',
    projectId: 'flutterpushnotification-6cb4d',
    storageBucket: 'flutterpushnotification-6cb4d.appspot.com',
    messagingSenderId: '368837374170',
    appId: '1:368837374170:web:93b01478747cc839b535e3',
    measurementId: 'G-6Q2LNGT70E',
};

// 🚀 Inicializa o Firebase no Service Worker
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// 📩 Listener para mensagens em segundo plano
messaging.onBackgroundMessage((payload) => {
    console.log('📩 Mensagem recebida em segundo plano:', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
       // icon: '/icons/icon-192x192.png', // 📌 Altere para o caminho do seu ícone real
        vibrate: [200, 100, 200], // 📳 Faz o celular vibrar ao receber
        data: { url: 'https://poc.plugphone.cloud:5001/chat' }, // 🌍 Altere para a URL que deseja abrir ao clicar
        sound: '/sounds/notification.mp3' // 🔊 Adiciona um som (o navegador pode bloquear)
    };

    // 🔔 Exibe a notificação
    self.registration.showNotification(notificationTitle, notificationOptions);

    // 🔊 Força a reprodução de som (se permitido pelo navegador)
    self.playNotificationSound();
});

// 🔊 Função para tocar o som
self.playNotificationSound = () => {
    const audio = new Audio('/sounds/notification.mp3');
    audio.play().catch(error => console.error('🚨 Erro ao tocar som:', error));
};

// 🎯 Listener para ações na notificação
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url) // 🌍 Abre o link da notificação
    );
});
