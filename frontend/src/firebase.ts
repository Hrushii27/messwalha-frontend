// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyD0y27ILWT6Io4IWleWjmCkuCyUSv0PY7Q",
    authDomain: "messwala-f09a5.firebaseapp.com",
    projectId: "messwala-f09a5",
    storageBucket: "messwala-f09a5.firebasestorage.app",
    messagingSenderId: "1017590323676",
    appId: "1:1017590323676:web:cfb4cb70a131a0d0889719",
    measurementId: "G-CNS8X0NMZY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// Analytics only initializes in the browser
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export { app, auth, analytics };
