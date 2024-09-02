import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot, addDoc, collection, query, where, getDocs, serverTimestamp, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadString, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { actualUserData } from "../../scripts/returnUserInfos";
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
let buyedsSectionDiv = document.getElementById("buyedsSectionDiv")

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const uid = user.uid;
        buyedsSectionDiv.innerHTML = ""
        actualUserData().then(async (userData) => {
            if (userData.admin == true) {
                const querySnapshot = await getDocs(collection(db, "payments"));
                querySnapshot.forEach((doc) => {
                    let article = document.createElement("article")                    
                    buyedsSectionDiv.insertAdjacentElement("beforeend", article)
                    article.classList.add("buyedsCard")
                    article.innerHTML = `
                    <div class="buyedsCard__div--1">
                        <div class="buyedsCard__div--2">
                            <p class="buyedsCard__name">${doc.data().payerName}</p>
                            <p class="buyedsCard__price">R$ ${doc.data().totalAmount}</p>
                        </div>
                        <p class="buyedsCard__date">${doc.data().payDate}</p>
                    </div>
                    <ul class="buyedsCard__ul">
                    ${doc.data().items.map(element => `<li class="buyedsCard__li">${element}</li>`).join('')}                        
                    </ul>
                    <button class="buyedsCard__Btn">Entregue</button>`
                })
            }
        })
    }
})