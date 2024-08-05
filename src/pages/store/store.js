import { actualUserData, thisUserData, actualUserEmail } from "../../scripts/returnUserInfos"
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot, addDoc, collection, query, where, getDocs, serverTimestamp, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadString, deleteObject, uploadBytesResumable, getDownloadURL, uploadBytes } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
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

async function loadStore() {
    let storeDiv = document.getElementById("storeDiv")
    const querySnapshot = await getDocs(collection(db, "store"));
    querySnapshot.forEach((doc) => {
        getDownloadURL(ref(storage, `store/${doc.id}/image`))
            .then((url) => {
                let xhr = new XMLHttpRequest();
                xhr.responseType = 'blob';
                xhr.onload = (event) => {
                    let blob = xhr.response;
                };
                xhr.open('GET', url);
                xhr.send();
                let article = document.createElement("article")
                let button = document.createElement("button")
                button.classList.add("storeCard__addCart")
                storeDiv.insertAdjacentElement("beforeend", article)
                article.classList.add("store-card")
                article.innerHTML = `
                    <img class="storeCard__img" src="${url}">
                    <div class="storeCard__div--1">
                        <div class="storeCard__div--2">
                            <p class="storeCard__name">${doc.data().name}</p>
                            <p class="storeCard__price">$${doc.data().price}</p>
                        </div>

                    </div>
                `
                article.children[1].insertAdjacentElement("beforeend", button)
                button.innerHTML=`<i class="bi bi-cart-plus"></i>`
            })
            .catch((error) => {
                // Handle any errors
            });
    });
}

loadStore()