import { actualUserData, thisUserData, actualUserEmail } from "../../scripts/returnUserInfos"
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot, addDoc, collection, query, updateDoc, where, increment, getDoc, getDocs, serverTimestamp, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadString, deleteObject, uploadBytesResumable, getDownloadURL, uploadBytes } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { alertThis } from "../../components/alerts/alert";
import { alternatePage } from "../../scripts/alternatePages";
import { refreshCartQuanty } from "../store/store";
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

document.getElementById("closeCartSection").onclick = function () {
    alternatePage(document.getElementById("storeSection"))
}

export function initCart() {
    let totalCount = 0
    let cartTotalSpan = document.getElementById("cartTotalSpan")
    let cartItemsDiv = document.getElementById("cartItemsDiv")
    let cartBuyDiv = document.getElementById("cartBuyDiv")
    cartBuyDiv.style.display = "none"
    cartItemsDiv.innerHTML = ""
    cartItemsDiv.classList.add("empity")
    cartTotalSpan.textContent = `$${totalCount.toFixed(2)}`
    actualUserEmail().then(async (email) => {
        const querySnapshot = await getDocs(collection(db, "users", `${email}`, "cart"));
        querySnapshot.forEach(async (cartDoc) => {
            const docRef = doc(db, "store", `${cartDoc.data().itemId}`);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                getDownloadURL(ref(storage, `store/${cartDoc.data().itemId}/image`))
                    .then((url) => {
                        let xhr = new XMLHttpRequest();
                        xhr.responseType = 'blob';
                        xhr.onload = (event) => {
                            let blob = xhr.response;
                        };
                        xhr.open('GET', url);
                        xhr.send();
                        cartBuyDiv.style.display = ""
                        cartItemsDiv.classList.remove("empity")
                        totalCount = totalCount + (docSnap.data().price * cartDoc.data().quanty)
                        cartTotalSpan.textContent = `$${totalCount.toFixed(2)}`
                        let article = document.createElement("article")
                        cartItemsDiv.insertAdjacentElement("beforeend", article)
                        article.classList.add("cartItemCard")
                        article.innerHTML = `
                            <div class="cartItemCard__div--1">
                                <button type="button" class="cartItemCard__addRemoveBtn"><ion-icon name="add-outline"></ion-icon></button>
                                <input type="number" class="cartItemCard__input" value="${cartDoc.data().quanty}">
                                <button type="button" class="cartItemCard__addRemoveBtn"><i class="bi bi-dash"></i></button>
                            </div>
                            <img src="${url}" class="cartItemCard__img">
                            <div class="cartItemCard__div--2">
                                <p class="cartItemCard__name">${docSnap.data().name}</p>
                                <p class="cartItemCard__price">$${docSnap.data().price.toFixed(2)}</p>
                            </div>
                            <button type="button" class="cartItemCard__closeBtn"><ion-icon name="close-outline"></ion-icon></button>
                        `
                        article.children[0].children[0].onclick = function () {
                            article.children[0].children[1].value = Number(article.children[0].children[1].value) + 1
                        }
                        article.children[0].children[1].oninput = async function () {
                            if (Number(article.children[0].children[1].value) < 1) {
                                article.children[0].children[1].value = 1
                                alterCartQuanty(cartDoc.id, article.children[0].children[1].value)
                            } else {
                                article.children[0].children[1].value = Number(article.children[0].children[1].value)
                                alterCartQuanty(cartDoc.id, article.children[0].children[1].value)
                            }
                        }
                        article.children[0].children[2].onclick = async function () {
                            if (Number(article.children[0].children[1].value) > 1) {
                                article.children[0].children[1].value = Number(article.children[0].children[1].value) - 1
                            }
                        }
                        article.children[3].onclick = async function () {
                            await deleteDoc(doc(db, "users", `${email}`, "cart", `${cartDoc.id}`));
                            refreshCartQuanty()
                            initCart()
                        }
                    })
            }
        })
    })
}

async function alterCartQuanty(itemId, quanty) {
    actualUserEmail().then(async (email) => {
        const docRef = doc(db, "users", `${email}`, "cart", `${itemId}`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const cartItemRef = doc(db, "users", `${email}`, "cart", `${itemId}`);
            await updateDoc(cartItemRef, {
                quanty: Number(quanty)
            });
            refreshCartQuanty()
        } else {
            await setDoc(doc(db, "users", `${email}`, "cart", `${itemId}`), {
                itemId: `${itemId}`,
                quanty: Number(quanty)
            });
            refreshCartQuanty()
        }
    })
}