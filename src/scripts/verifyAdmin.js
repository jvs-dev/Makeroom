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
let logins = 0
let goToAddContent = document.getElementById("goToAddContent")
let goToCreateAccount = document.getElementById("goToCreateAccount")
let goToStock = document.getElementById("goToStock")
let goToFolders = document.getElementById("goToFolders")
let goToBuyeds = document.getElementById("goToBuyeds")
let goToResolvers = document.getElementById("goToResolvers")

onAuthStateChanged(auth, (user) => {
  if (user) {
    const uid = user.uid;
    logins = logins + 1
    actualUserData().then(result => {
      if (result.admin == true) {
        goToStock.style.display = ""
        goToCreateAccount.style.display = ""
        goToAddContent.style.display = ""
        goToFolders.style.display = ""
        goToBuyeds.style.display = ""
        goToResolvers.style.display = ""
        if (logins > 1) {
          window.location.reload()
        }
      } else {
        goToStock.style.display = "none"
        goToCreateAccount.style.display = "none"
        goToAddContent.style.display = "none"
        goToFolders.style.display = "none"
        goToBuyeds.style.display = "none"
        goToResolvers.style.display = "none"
        goToStock.parentNode.removeChild(goToStock);
        goToCreateAccount.parentNode.removeChild(goToCreateAccount);
        goToAddContent.parentNode.removeChild(goToAddContent);
        goToFolders.parentNode.removeChild(goToFolders);
        goToBuyeds.parentNode.removeChild(goToBuyeds);
        goToResolvers.parentNode.removeChild(goToResolvers);
        switchSchool.parentNode.removeChild(switchSchool);
      }
    })
  }
});