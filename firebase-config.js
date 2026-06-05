// firebase-config.js
const firebaseConfig = { 
    apiKey: "AIzaSyC5sGKGeD_zht-Qknp6VPwfPIChqwvX8MQ", 
    authDomain: "masstore-c32a7.firebaseapp.com", 
    projectId: "masstore-c32a7", 
    storageBucket: "masstore-c32a7.firebasestorage.app", 
    messagingSenderId: "321720130071", 
    appId: "1:321720130071:web:20aab19001cc8bb3cd9a52" 
};

if (!firebase.apps.length) { 
    firebase.initializeApp(firebaseConfig); 
}

const auth = firebase.auth();
const db = firebase.firestore();

