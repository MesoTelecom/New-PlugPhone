const { GoogleAuth } = require('google-auth-library');
const auth = new GoogleAuth({
    keyFile: './plugphonechat-f3a19-firebase-adminsdk-fbsvc-eca06c04f8.json',
    scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
});

async function getAccessToken() {
    const client = await auth.getClient();
    const token = await client.getAccessToken();
    console.log('Bearer token:\n', token.token);
}

getAccessToken();
