 // Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCVw8Jw-NVFmFvRyxkZEElPtZ_LfZ2JXTQ",
  authDomain: "swe-aircon-retailer.firebaseapp.com",
  projectId: "swe-aircon-retailer",
  storageBucket: "swe-aircon-retailer.appspot.com",
  messagingSenderId: "19296598170",
  appId: "1:19296598170:web:5496269ccc736d4fe94723",
  measurementId: "G-B91JNP4FJ2"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const db = getFirestore(app)
const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()

export { app, db, auth, googleProvider }