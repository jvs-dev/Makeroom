import { alertThis } from "../../components/alerts/alert"
import { logoAlternateAnimation } from "../../scripts/alternatePages"
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, updateDoc, deleteField, setDoc, onSnapshot, addDoc, collection, query, where, getDocs, serverTimestamp, deleteDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
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
let loginViewPassword = document.getElementById("loginViewPassword")
let totalSchools = 0

async function loadTotal() {
    const docRef = doc(db, "schools", "all");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        docSnap.data().schools.forEach((element, index) => {
            totalSchools = totalSchools + 1
        })
    }
}

loadTotal()

loginViewPassword.onclick = () => {
    let password = document.getElementById("loginPassword")
    if (password.type == "text") {
        password.type = "password"
        loginViewPassword.name = "eye-outline"
    } else {
        password.type = "text"
        loginViewPassword.name = "eye-off-outline"
    }
}

let loginBtn = document.getElementById("loginBtn")

loginBtn.onclick = function () {
    loginBtn.disabled = true
    let password = document.getElementById("loginPassword").value
    let email = document.getElementById("loginEmail").value
    if (password != "" && email != "") {
        signInWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                const user = userCredential.user;
                for (let index = 0; index < totalSchools; index++) {
                    const docRef = doc(db, `${index}_users`, `${email}`);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        localStorage.setItem("schoolIndex", index)
                        if (docSnap.data().firstUse == true) {
                            const cityRef = doc(db, `${index}_users`, `${email}`);
                            updateDoc(cityRef, {
                                firstUse: deleteField(),
                                temporaryPassword: deleteField()
                            });
                            window.location.reload()
                        } else {
                            window.location.reload()
                        }
                    }
                }
                logoAlternateAnimation(document.getElementById("homeSection"))
                loginBtn.disabled = false
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                verifyUserAccount(email, password, 0)
            });
    } else {
        alertThis("Preencha todos os campos", "error")
        loginBtn.disabled = false
    }
}

async function verifyUserAccount(email, password, tryIndex) {
    const docRef = doc(db, `${Number(tryIndex)}_users`, `${email}`);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        if (docSnap.data().firstUse == true) {
            if (docSnap.data().temporaryPassword == `${password}`) {
                localStorage.setItem("schoolIndex", tryIndex)
                initAccount(email, password)
            } else {
                alertThis("Senha incorreta", "error")
                loginBtn.disabled = false
            }
        } else {
            alertThis("Algo deu errado", "error")
            loginBtn.disabled = false
        }
    } else {
        if (tryIndex < totalSchools) {
            verifyUserAccount(email, password, Number(tryIndex) + 1)
        } else {
            alertThis("Conta inexistente", "error")
            loginBtn.disabled = false
        }
    }
}

async function initAccount(email, password) {
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            const cityRef = doc(db, `${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_users`, `${email}`);
            updateDoc(cityRef, {
                firstUse: deleteField(),
                temporaryPassword: deleteField()
            });
            window.location.reload()
            logoAlternateAnimation(document.getElementById("homeSection"))
            loginBtn.disabled = false
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            alertThis("Erro 401, entre em contato", "error")
            loginBtn.disabled = false
        });
}