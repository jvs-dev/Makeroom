import { actualUserData, thisUserData, actualUserEmail } from "../../scripts/returnUserInfos"
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot, addDoc, collection, query, updateDoc, where, increment, getDoc, getDocs, serverTimestamp, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadString, deleteObject, uploadBytesResumable, getDownloadURL, uploadBytes } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { alertThis } from "../../components/alerts/alert";
import { alternatePage } from "../../scripts/alternatePages";
import { initCart } from "../cart/cart";
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

const storeCartBtn = document.getElementById("storeCartBtn")
let cartCount = 0

async function loadStore() {
    let storeDiv = document.getElementById("storeDiv")
    storeDiv.innerHTML = ""
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
                let count = 1
                storeDiv.insertAdjacentElement("beforeend", article)
                article.classList.add("store-card")
                article.innerHTML = `
                    <img class="storeCard__img" src="${url}">
                    <div class="storeCard__div--1">
                        <div class="storeCard__divInput" style="display: none;">
                            <button type="button" class="storeCard__inputIcon"><i class="bi bi-dash"></i></button>
                            <input type="number" class="storeCard__input">
                            <button type="button" class="storeCard__inputIcon"><i class="bi bi-plus"></i></i></button>
                        </div>
                        <div class="storeCard__div--2">
                            <p class="storeCard__name">${doc.data().name}</p>
                            <p class="storeCard__price">$${doc.data().price.toFixed(2)}</p>
                        </div>
                        <button type="button" class="storeCard__addCart"><i class="bi bi-cart-plus"></i></button>
                        <button type="button" class="storeCard__addCart" style="display: none;"><i class="bi bi-check2" style="font-size: 24px;"></i></button>
                    </div>
                `
                let addCartInput = article.children[1].children[0].children[1]
                let addCartIcon = article.children[1].children[0].children[2]
                let removeCartIcon = article.children[1].children[0].children[0]
                let checkBtn = article.children[1].children[3]
                let addCartBtn = article.children[1].children[2]
                addCartIcon.onclick = () => {
                    addCartInput.value = Number(addCartInput.value) + 1
                }
                removeCartIcon.onclick = () => {
                    addCartInput.value = Number(addCartInput.value) - 1
                }
                addCartBtn.onclick = () => {
                    addCartBtn.style.display = "none"
                    article.children[1].children[1].style.display = "none"
                    checkBtn.style.display = ""
                    article.children[1].children[0].style.display = ""
                    addCartInput.value = 1
                }
                checkBtn.onclick = () => {
                    addCartBtn.style.display = ""
                    article.children[1].children[1].style.display = ""
                    checkBtn.style.display = "none"
                    article.children[1].children[0].style.display = "none"
                    actualUserEmail().then(conected => {
                        if (conected != "no user conected") {
                            addCartFct(doc.id, Number(addCartInput.value)).then(res => {
                                alertThis("Adicionado com sucesso", "sucess")
                            })
                        } else {
                            alertThis("Faça login para continuar", "")
                        }
                    })
                }
            })
            .catch((error) => {
                // Handle any errors
            });
    });
}

async function addCartFct(itemId, quanty) {
    return new Promise(async (resolve) => {
        actualUserEmail().then(async (email) => {
            const docRef = doc(db, "users", `${email}`, "cart", `${itemId}`);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const cartItemRef = doc(db, "users", `${email}`, "cart", `${itemId}`);
                await updateDoc(cartItemRef, {
                    quanty: increment(Number(quanty))
                });
                updateCartQuanty()
                resolve("added")
            } else {
                await setDoc(doc(db, "users", `${email}`, "cart", `${itemId}`), {
                    itemId: `${itemId}`,
                    quanty: Number(quanty)
                });
                updateCartQuanty()
                resolve("added")
            }
        })
    })
}

export function refreshCartQuanty() {
    cartCount = 0
    actualUserEmail().then(async (email) => {
        const querySnapshot = await getDocs(collection(db, "users", `${email}`, "cart"));
        querySnapshot.forEach((doc) => {
            cartCount = cartCount + Number(doc.data().quanty)
            storeCartBtn.children[1].textContent = `${cartCount}`
        });
    })
}

function updateCartQuanty() {
    cartCount = 0
    actualUserEmail().then(async (email) => {
        const querySnapshot = await getDocs(collection(db, "users", `${email}`, "cart"));
        querySnapshot.forEach((doc) => {
            cartCount = cartCount + Number(doc.data().quanty)
            storeCartBtn.children[1].textContent = `${cartCount}`
        });
    })
}

document.getElementById("storeCartBtn").onclick = function () {
    alternatePage(document.getElementById("cartSection"))
    initCart()
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        const uid = user.uid;
        loadStore()
        updateCartQuanty()
    }
});