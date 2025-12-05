const admin = require('firebase-admin');

const serviceAccount = require('./plugphonechat-f3a19-firebase-adminsdk-fbsvc-4432807ed7.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
