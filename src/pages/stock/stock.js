import { alertThis } from "../../components/alerts/alert"
import { activeConfirmSection } from "../../components/confirmSection/confirmSection";
import { deleteThis } from "../../scripts/deleteThis";
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
    showStockItens.innerHTML = ""; // Clear existing items
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
                    <button type="button" class="item-card__delete-btn" aria-label="Excluir item">
                        <i class="bi bi-trash"></i>
                    </button>
                    <div class="item-card__divImg">
                        <div class="item-card__loading" id="loadingImg0" style="display: none;"></div>
                        <img class="item-card__img" src="${url}" alt="${doc.data().StockItemName}">
                    </div>
                    <h3 class="item-card__name">${doc.data().StockItemName}</h3>
                    <div class="item-card__quanty-container">
                        <p class="item-card__quanty-label">Em estoque</p>
                        <div class="item-card__quanty">
                            <span class="item-card__quanty-value">${doc.data().StockItemQuanty}</span>
                            <span>unid.</span>
                        </div>
                    </div>
                    <div class="item-card__div">
                        <button type="button" class="item-card__btn" style="--clr: #e53e3e;" aria-label="Reduzir quantidade">
                            <i class="bi bi-dash"></i>
                        </button>
                        <button type="button" class="item-card__btn" style="--clr: #38a169;" aria-label="Aumentar quantidade">
                            <i class="bi bi-plus"></i>
                        </button>
                    </div>
                `
                let quantyValue = article.querySelector('.item-card__quanty-value')
                let removeItemQuanty = article.querySelector('.item-card__div .item-card__btn:first-child')
                let addItemQuanty = article.querySelector('.item-card__div .item-card__btn:last-child')
                let deleteBtn = article.querySelector('.item-card__delete-btn');
                
                // Add delete functionality
                deleteBtn.onclick = function (e) {
                    e.stopPropagation();
                    activeConfirmSection("Deseja excluir este item?", "Esta ação não poderá ser desfeita", "#f00", "sad").then(async res => {
                        if (res == "confirmed") {
                            try {
                                // Delete the document from Firestore
                                await deleteThis("stockItem", doc.id);
                                
                                // Delete the image from Storage
                                try {
                                    const desertRef = ref(storage, `stockItem/${doc.id}/image`);
                                    await deleteObject(desertRef);
                                } catch (storageError) {
                                    console.log("Error deleting image from storage:", storageError);
                                }
                                
                                // Remove the card from the UI
                                article.style.opacity = "0";
                                article.style.transition = "opacity 0.3s ease";
                                setTimeout(() => {
                                    article.remove();
                                    alertThis("Item excluído com sucesso", "sucess");
                                }, 300);
                            } catch (error) {
                                console.error("Error deleting item:", error);
                                alertThis("Erro ao excluir item", "error");
                            }
                        }
                    });
                };
                
                removeItemQuanty.onclick = function () {
                    if (Number(quantyValue.textContent) > 0) {
                        quantyValue.textContent = Number(quantyValue.textContent) - 1;
                        removeQuanty(doc.id)
                    } else {
                        alertThis("Mínimo em estoque é 0", "")
                    }
                }
                addItemQuanty.onclick = function () {
                    quantyValue.textContent = Number(quantyValue.textContent) + 1;
                    addQuanty(doc.id)
                }
            })
            .catch((error) => {
                // Handle any errors
                console.error("Error loading item:", error);
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

// Initialize when user is authenticated
onAuthStateChanged(auth, (user) => {
    if (user) {
        const uid = user.uid;
        showItems();
    }
});