import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot, addDoc, collection, query, where, getDocs, updateDoc, serverTimestamp, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadString, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { actualUserData } from "../../scripts/returnUserInfos";
import { activeConfirmSection } from "../../components/confirmSection/confirmSection";
import { alertThis } from "../../components/alerts/alert";
import { monitorCollectionUpdates } from "../../scripts/returnDataInfos";
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

async function loadBuyeds(user) {
    buyedsSectionDiv.innerHTML = ""
    actualUserData().then(async (userData) => {
        if (userData.admin == true) {
            const querySnapshot = await getDocs(collection(db, `${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_payments`));
            querySnapshot.forEach((payData) => {
                if (payData.data().delivered == false && payData.data().paymentStatus == "approved") {
                    let article = document.createElement("article")
                    buyedsSectionDiv.insertAdjacentElement("beforeend", article)
                    article.classList.add("buyedsCard")
                    article.innerHTML = `
                        <div class="buyedsCard__header">
                            <div class="buyedsCard__userInfo">
                                <p class="buyedsCard__name">${payData.data().payerName}</p>
                                <p class="buyedsCard__price">R$ ${payData.data().totalAmount.toFixed(2)}</p>
                            </div>
                            <span class="buyedsCard__date">${payData.data().payDate}</span>
                        </div>
                        <div class="buyedsCard__itemsSection">
                            <h3 class="buyedsCard__itemsTitle"><i class="bi bi-cart-check"></i> Itens Comprados</h3>
                            <ul class="buyedsCard__ul">
                                ${payData.data().items.map(element => `<li class="buyedsCard__li">${element}</li>`).join('')}                        
                            </ul>
                        </div>
                        <div class="buyedsCard__actions">
                            <button class="buyedsCard__Btn">Marcar como Entregue</button>
                        </div>`
                    article.querySelector('.buyedsCard__Btn').onclick = () => {
                        activeConfirmSection("Os itens foram entregues?", "Confirme para continuar", "#20E3BB", "happy").then(async res => {
                            if (res == "confirmed") {
                                const cartItemRef = doc(db, `${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_payments`, `${payData.id}`);
                                await updateDoc(cartItemRef, {
                                    delivered: true
                                });
                                alertThis("Entrega registrada com sucesso", "sucess")
                                article.style.display = "none"
                            }
                        })
                    }
                }
            })
            const anonymusSnapshot = await getDocs(collection(db, `anonymus_payments`));
            anonymusSnapshot.forEach((payData) => {
                if (payData.data().delivered == false && payData.data().paymentStatus == "approved") {
                    let article = document.createElement("article")
                    buyedsSectionDiv.insertAdjacentElement("beforeend", article)
                    article.classList.add("buyedsCard")
                    article.classList.add("noAccount")
                    article.innerHTML = `
                        <div class="buyedsCard__header">
                            <div class="buyedsCard__userInfo">
                                <span class="buyedsCard__tag warning"><i class="bi bi-exclamation-triangle"></i> Sem Conta</span>
                                <p class="buyedsCard__name">Aluno: ${payData.data().alunoName}</p>
                                <p class="buyedsCard__name">Responsável: ${payData.data().resName}</p>
                                <p class="buyedsCard__price">R$ ${payData.data().totalAmount.toFixed(2)}</p>
                            </div>
                            <span class="buyedsCard__date">${payData.data().payDate}</span>
                        </div>
                        <div class="buyedsCard__itemsSection">
                            <h3 class="buyedsCard__itemsTitle"><i class="bi bi-cart-check"></i> Itens Comprados</h3>
                            <ul class="buyedsCard__ul">
                                ${payData.data().items.map(element => `<li class="buyedsCard__li">${element}</li>`).join('')}                        
                            </ul>
                        </div>
                        <div class="buyedsCard__contactInfo">
                            <h4 class="buyedsCard__contactTitle"><i class="bi bi-telephone"></i> Informações de Contato</h4>
                            <p class="buyedsCard__phone"><i class="bi bi-phone"></i> Número: ${payData.data().phone}</p>
                        </div>
                        <div class="buyedsCard__actions">
                            <button class="buyedsCard__Btn">Marcar como Entregue</button>
                        </div>`
                    article.querySelector('.buyedsCard__Btn').onclick = () => {
                        activeConfirmSection("Os itens foram entregues?", "Confirme para continuar", "#20E3BB", "happy").then(async res => {
                            if (res == "confirmed") {
                                const cartItemRef = doc(db, `anonymus_payments`, `${payData.id}`);
                                await updateDoc(cartItemRef, {
                                    delivered: true
                                });
                                alertThis("Entrega registrada com sucesso", "sucess")
                                article.style.display = "none"
                            }
                        })
                    }
                }
            })
        }
    })
}

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const uid = user.uid;
        monitorCollectionUpdates(`${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_payments`, (updatedData) => {
            loadBuyeds(user)
        });
    }
})