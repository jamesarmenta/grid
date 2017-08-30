const firebase = require('firebase/app');
require('firebase/database');

const app = firebase.initializeApp({
    apiKey: 'AIzaSyBuarglDUNl1NzFFPbiwXp6KXZKgPez3BM',
    authDomain: 'armenta-grid.firebaseapp.com',
    databaseURL: 'https://armenta-grid.firebaseio.com',
    projectId: 'armenta-grid',
    storageBucket: 'armenta-grid.appspot.com',
    messagingSenderId: '460185188504',
  });

export default app.database();
