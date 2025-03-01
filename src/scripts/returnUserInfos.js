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

export async function actualUserEmail() {
    return new Promise(resolve => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                const uid = user.uid;
                resolve(`${user.email}`)
            } else {
                resolve("no user conected")
            }
        });
    })
}

export async function actualUserData() {
    return new Promise(resolve => {
        actualUserEmail().then(async userEmail => {
            const docRef = doc(db, `${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_users`, `${userEmail}`);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                resolve(docSnap.data());
            } else {
                resolve("no such document");
            }
        })
    })
}

export async function thisUserData(email) {
    return new Promise(async resolve => {
        const docRef = doc(db, `${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_users`, `${email}`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            resolve(docSnap.data());
        } else {
            resolve("no such document");
        }
    })
}