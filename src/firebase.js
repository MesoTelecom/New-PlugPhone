// src/firebase/firebaseconfig.js
import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

// Configuração do Firebase
const firebaseConfig = {
    apiKey: 'AIzaSyDhmZQqTr0GVtdBSTwNa1EeOPvRG-VA1dI',
    authDomain: 'flutterpushnotification-6cb4d.firebaseapp.com',
    projectId: 'flutterpushnotification-6cb4d',
    storageBucket: 'flutterpushnotification-6cb4d.appspot.com',
    messagingSenderId: '368837374170',
    appId: '1:368837374170:web:93b01478747cc839b535e3',
    measurementId: 'G-6Q2LNGT70E',
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa o Firebase Cloud Messaging
const messaging = getMessaging(app);

// Exporta a instância de messaging para uso em outros módulos
export { messaging, app };
