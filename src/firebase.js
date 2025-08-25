// src/firebase/firebaseconfig.js
import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

// Configuração do Firebase
const firebaseConfig = {
apiKey: "AIzaSyAQ4CqOoGru65wdz8ELizhKvJY-W1fqlvA",
authDomain: "plugphonechat-f3a19.firebaseapp.com",
projectId: "plugphonechat-f3a19",
storageBucket: "plugphonechat-f3a19.firebasestorage.app",
messagingSenderId: "813008783828",
appId: "1:813008783828:web:515fcb453cb764a86e2e41"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa o Firebase Cloud Messaging
const messaging = getMessaging(app);

// Exporta a instância de messaging para uso em outros módulos
export { messaging, app };
