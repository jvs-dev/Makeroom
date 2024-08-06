import { actualUserData } from "./returnUserInfos"
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot, addDoc, collection, getDoc, query, where, getDocs, serverTimestamp, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadString, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
const firebaseConfig = {
  apiKey: `${import.meta.env.VITE_API_KEY}`,
  authDomain: `${import.meta.env.VITE_AUTH_DOMAIN}`,
  projectId: `${import.meta.env.VITE_PROJECT_ID}`,
  storageBucket: `${import.meta.env.VITE_STORAGE_BUCKET}`,
  messagingSenderId: `${import.meta.env.VITE_MESSAGING_SENDER_ID}`,
  appId: `${import.meta.env.VITE_APP_ID}`,
};
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);
const storage = getStorage(app);
let goToAddContent = document.getElementById("goToAddContent")
let goToCreateAccount = document.getElementById("goToCreateAccount")
let goToStock = document.getElementById("goToStock")

onAuthStateChanged(auth, (user) => {
  if (user) {
    const uid = user.uid;
    actualUserData().then(result => {
      if (result.admin == true) {
        goToStock.style.display = ""
        goToCreateAccount.style.display = ""
        goToAddContent.style.display = ""
      } else {
        goToStock.style.display = "none"
        goToCreateAccount.style.display = "none"
        goToAddContent.style.display = "none"
        goToStock.parentNode.removeChild(goToStock);
        goToCreateAccount.parentNode.removeChild(goToCreateAccount);
        goToAddContent.parentNode.removeChild(goToAddContent);
      }
    })
  }
});