// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  "projectId": "omniviewcfork",
  "appId": "1:523641072714:web:8985756d2310b18581cab3",
  "storageBucket": "omniviewcfork.firebasestorage.app",
  "apiKey": "AIzaSyC_kS0V1j0H20Y7w_SKRNc_8QB6XnWYEzM",
  "authDomain": "omniviewcfork.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "523641072714"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
