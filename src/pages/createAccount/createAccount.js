import { alertThis } from "../../components/alerts/alert"
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot, addDoc, collection, query, where, getDocs, serverTimestamp, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
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

let createAccountBtn = document.getElementById("createAccountBtn")
let body = document.querySelector("body")

createAccountBtn.onclick = function () {
  let createAccountClass = document.getElementById("createAccountClass").value
  let createAccountPassword = document.getElementById("createAccountPassword").value
  let createAccountEmail = document.getElementById("createAccountEmail").value
  let createAccountName = document.getElementById("createAccountName").value
  let createAccountRoom = document.getElementById("createAccountRoom").value
  createAccountBtn.disabled = true
  if (createAccountClass != "" && createAccountPassword != "" && createAccountEmail != "" && createAccountName != "" && createAccountRoom != "") {
    registerAccount(createAccountClass, createAccountPassword, createAccountEmail, createAccountName, createAccountRoom)
  } else {
    createAccountBtn.disabled = false
    alertThis("Preencha todos os campos", "error")
  }
}

async function registerAccount(createAccountClass, createAccountPassword, createAccountEmail, createAccountName, createAccountRoom) {
  await setDoc(doc(db, "users", `${createAccountEmail}`), {
    name: `${createAccountName}`,
    class: `${createAccountClass}`,
    temporaryPassword: `${createAccountPassword}`,
    room: `${createAccountRoom}`,
    signature: `basic`,
    points: 0,
    email: `${createAccountEmail}`,
    firstUse: true,
    noPhoto: true
  });
  document.getElementById("createAccountPassword").value = ""
  document.getElementById("createAccountEmail").value = ""
  document.getElementById("createAccountName").value = ""
  alertThis("Conta criada", "sucess")
  createAccountBtn.disabled = false
}