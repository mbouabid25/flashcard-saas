import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBZ05jTtsEjZU-cGlZnRqDq2lufGS8V8aA",
  authDomain: "flashcard-saas-b5bfa.firebaseapp.com",
  projectId: "flashcard-saas-b5bfa",
  storageBucket: "flashcard-saas-b5bfa.appspot.com",
  messagingSenderId: "723505425084",
  appId: "1:723505425084:web:47b7cfa0608ce44c3dfeb9",
  measurementId: "G-QP8C34BP96"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize Analytics only in the client-side environment
let analytics;
if (typeof window !== "undefined") {
  isSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export default db;
export {analytics};