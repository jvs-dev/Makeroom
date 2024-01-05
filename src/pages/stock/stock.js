import { alertThis } from "../../components/alerts/alert"
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot, increment, addDoc, collection, query, where, getDocs, serverTimestamp, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
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
let showStockItens = document.getElementById("showStockItens")
let count = 0
async function showItems() {
    const querySnapshot = await getDocs(collection(db, "stockItem"));
    querySnapshot.forEach((doc) => {
        getDownloadURL(ref(storage, `stockItem/${doc.id}/image`))
            .then((url) => {
                let xhr = new XMLHttpRequest();
                xhr.responseType = 'blob';
                xhr.onload = (event) => {
                    let blob = xhr.response;
                };
                xhr.open('GET', url);
                xhr.send();
                let article = document.createElement("article")
                showStockItens.insertAdjacentElement("beforeend", article)
                article.classList.add("item-card")
                article.innerHTML = `
                    <div class="item-card__divImg">
                        <div class="item-card__loading" id="loadingImg0" style="display: none;"></div>
                        <img class="item-card__img" src="${url}" alt="">
                    </div>
                    <p class="item-card__name">${doc.data().StockItemName}</p>
                    <p class="item-card__quanty">TOTAL: ${doc.data().StockItemQuanty} unid.</p>
                    <div class="item-card__div">
                        <button type="button" class="item-card__btn" style="--clr: #132330;">-</button>
                        <button type="button" class="item-card__btn" style="--clr: #4684B5;">+</button>
                    </div>
                `
                let quantyNumber = article.children[2]
                let removeItemQuanty = article.children[3].children[0]
                let addItemQuanty = article.children[3].children[1]
                removeItemQuanty.onclick = function () {
                    if (Number(quantyNumber.textContent.replace("TOTAL: ", "").replace(" unid.", "")) > 0) {
                        quantyNumber.innerHTML = `TOTAL: ${Number(quantyNumber.textContent.replace("TOTAL: ", "").replace(" unid.", "")) - 1} unid.`
                        removeQuanty(doc.id)
                    } else {
                        alertThis("Minimo em estoque é 0", "")
                    }
                }
                addItemQuanty.onclick = function () {
                    quantyNumber.innerHTML = `TOTAL: ${Number(quantyNumber.textContent.replace("TOTAL: ", "").replace(" unid.", "")) + 1} unid.`
                    addQuanty(doc.id)
                }
            })
            .catch((error) => {
                // Handle any errors
            });
    });
}

async function addQuanty(id) {
    let washingtonRef = doc(db, "stockItem", `${id}`);
    await updateDoc(washingtonRef, {
        StockItemQuanty: increment(1)
    });

}

async function removeQuanty(id) {
    let washingtonRef = doc(db, "stockItem", `${id}`);
    await updateDoc(washingtonRef, {
        StockItemQuanty: increment(-1)
    });

}

showItems()
