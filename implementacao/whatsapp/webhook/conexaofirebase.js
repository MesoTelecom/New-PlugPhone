const { initializeApp } = require("firebase/app");
// Remova a importação do Analytics
// const { getAnalytics } = require("firebase/analytics");

const firebaseConfig = {
  apiKey: "AIzaSyCk7LTetqu-G83uFSAORnnkX6hk70syBJw",
  authDomain: "chatflutter-25018.firebaseapp.com",
  projectId: "chatflutter-25018",
  storageBucket: "chatflutter-25018.appspot.com",
  messagingSenderId: "655110204375",
  appId: "1:655110204375:web:b2a45b7ca8bfd0a33ff992",
  measurementId: "G-DBVW00T83M"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
// Não inicializa o Analytics
// const analytics = getAnalytics(app); // Remova ou comente esta linha
console.log("ou")
