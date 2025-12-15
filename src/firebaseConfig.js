import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCNA3KyD5jdNFqvCKskvmHtg8EHKYX3dco",
  authDomain: "form-7faeb.firebaseapp.com",
  projectId: "form-7faeb",
  storageBucket: "form-7faeb.firebasestorage.app",
  messagingSenderId: "352567750242",
  appId: "1:352567750242:web:0c45d260a2779f9b1a6b3b"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
