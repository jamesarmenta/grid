const admin = require('firebase-admin');

const serviceAccount = require('../../src/private/firebaseServiceAccountKey.json') 
|| process.env.FIREBASE_ACCOUNT_KEY;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://armenta-grid.firebaseio.com',
});

export default admin.database();
