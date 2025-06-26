const admin = require('firebase-admin');

const serviceAccount = require('./chatflutter-25018-firebase-adminsdk-dogng-0c1cfe00cc.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
