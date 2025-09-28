// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "firebase/auth";
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, limit, updateDoc, deleteDoc } from "firebase/firestore";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDtRhHtIcPfTQS-pk4Lq1-Qq9e-c2QqVhk",
  authDomain: "soulcircle20.firebaseapp.com",
  projectId: "soulcircle20",
  storageBucket: "soulcircle20.firebasestorage.app",
  messagingSenderId: "225971909786",
  appId: "1:225971909786:web:326a2c2a65f9a4cca1db23",
  measurementId: "G-5KPXMV6S7G",
  databaseURL: "https://soulcircle20-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app);

// Export auth and firestore functions
export { 
  auth, 
  db,
  rtdb,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateProfile,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  limit,
  updateDoc,
  deleteDoc
};
export default app;