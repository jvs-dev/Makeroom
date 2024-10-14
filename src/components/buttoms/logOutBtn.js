import { alertThis } from "../alerts/alert"
import { logoAlternateAnimation } from "../../scripts/alternatePages"
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot, addDoc, collection, query, where, getDocs, serverTimestamp, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadString, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { activeConfirmSection } from "../confirmSection/confirmSection";
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
let menuToggle = document.querySelectorAll(".header__menuToggle")
let menuSection = document.getElementById("menuSection")
let body = document.querySelector("body")
let logOutBtnDesktop = document.getElementById("logOutBtnDesktop")
let logOutBtn = document.getElementById("logOutBtn")
let menuSideUl = document.getElementById("menuSideUl")
let menuSideUlToggle = document.getElementById("menuSideUlToggle")

logOutBtnDesktop.onclick = function () {
    logout()
}
logOutBtn.onclick = function () {
    logout()
}

function logout() {
    activeConfirmSection("Deseja realmente sair?", "Você será desconectado de sua conta", "#f00", "sad").then(res => {
        if (res == "confirmed") {
            if (window.innerWidth > 600) {
                menuSideUl.style.transform = "translateX(-50px)"
                menuSideUl.style.opacity = "0"
                menuSideUlToggle.style.rotate = "0deg"
                setTimeout(() => {
                    menuSideUl.style.display = "none"
                    menuSideUlToggle.style.display = "none"
                }, 200);
            }
            signOut(auth).then(() => {
                menuToggle.forEach(menuBtn => {
                    if (menuBtn.classList.contains("active")) {
                        if (window.innerWidth < 600) {
                            menuBtn.classList.remove("active")
                            menuSection.style.transform = "translateX(100vw)"
                        }
                        body.style.overflowY = "auto"
                    }
                });
                logoAlternateAnimation(document.getElementById("loginSection"))
            }).catch((error) => {
                alertThis("Erro 201", "")
            });
        }
    })
}