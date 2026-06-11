import { initializeApp } from "firebase/app";

import {
  getAuth,
  GoogleAuthProvider
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDTlVTHLjhFHrb05DCMLCaNRasQq3vh5F4",
  authDomain: "ai-paper-analyzer-1a6c7.firebaseapp.com",
  projectId: "ai-paper-analyzer-1a6c7",
  storageBucket: "ai-paper-analyzer-1a6c7.firebasestorage.app",
  messagingSenderId: "792337181280",
  appId: "1:792337181280:web:727db3d3a1964352e3b105"
};

const app = initializeApp(
  firebaseConfig
);

export const auth = getAuth(app);

export const provider =
  new GoogleAuthProvider();