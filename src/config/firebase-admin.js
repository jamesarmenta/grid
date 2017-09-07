const admin = require('firebase-admin');

let serviceAccount;

try {
  serviceAccount = require('../../src/private/firebaseServiceAccountKey.json');
} catch (err) {
  serviceAccount = {
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
  };
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://armenta-grid.firebaseio.com',
});

export default admin.database();
