// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Import Authentication service
import { getFirestore } from "firebase/firestore"; // Import Firestore service
import { getStorage } from "firebase/storage"; // Import Storage service

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCQ5JI5yflFlaERRHCcxR9HI_QI3IVbeXk",
  authDomain: "mallang-58cd8.firebaseapp.com",
  projectId: "mallang-58cd8",
  storageBucket: "mallang-58cd8.firebasestorage.app",
  messagingSenderId: "124490902290",
  appId: "1:124490902290:web:da9f5a4174e9e46d5361cb",
  measurementId: "G-X38QZVV830"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get service instances
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // Export Storage service

// Note: getAnalytics is not used in this context for backend/data management
// import { getAnalytics } from "firebase/analytics";
// const analytics = getAnalytics(app); 