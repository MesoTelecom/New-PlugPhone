const admin = require('firebase-admin');

const serviceAccount = require('./plugphonechat-f3a19-firebase-adminsdk-fbsvc-5c600117a5.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
