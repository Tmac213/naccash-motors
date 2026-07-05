// Firebase configuration for Naccash Motors
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyB6cS5q9MslXLjOLEmNDuexqpvLKptoN8I",
  authDomain: "naccashmotors.firebaseapp.com",
  projectId: "naccashmotors",
  storageBucket: "naccashmotors.firebasestorage.app",
  messagingSenderId: "721299299691",
  appId: "1:721299299691:web:d26335a18b54ac1452802e",
  measurementId: "G-7WGW8B5PYG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;
