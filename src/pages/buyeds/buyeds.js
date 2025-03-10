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
                        <div class="buyedsCard__div--1">
                            <div class="buyedsCard__div--2">
                                <p class="buyedsCard__name">${payData.data().payerName}</p>
                                <p class="buyedsCard__price">R$ ${payData.data().totalAmount.toFixed(2)}</p>
                            </div>
                            <p class="buyedsCard__date">${payData.data().payDate}</p>
                        </div>
                        <ul class="buyedsCard__ul">
                            ${payData.data().items.map(element => `<li class="buyedsCard__li">${element}</li>`).join('')}                        
                        </ul>
                        <button class="buyedsCard__Btn">Entregue</button>`
                    article.children[2].onclick = () => {
                        activeConfirmSection("Os items foram entregues?", "Confirme para continuar", "#20E3BB", "happy").then(async res => {
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
                        <div class="buyedsCard__div--1">
                            <span class="buyedsCard__span"><ion-icon name="warning-outline"></ion-icon>Sem Conta</span>
                            <div class="buyedsCard__div--2">
                                <p class="buyedsCard__name">Aluno: ${payData.data().alunoName}</p>
                                <p class="buyedsCard__name" style="margin: 10px 0px;" >Responsável: ${payData.data().resName}</p>
                                <p class="buyedsCard__price">R$ ${payData.data().totalAmount.toFixed(2)}</p>
                            </div>
                            <p class="buyedsCard__date">${payData.data().payDate}</p>
                        </div>
                        <ul class="buyedsCard__ul">
                            ${payData.data().items.map(element => `<li class="buyedsCard__li">${element}</li>`).join('')}                        
                        </ul>
                        <p class="buyedsCard__phone">Número: ${payData.data().phone}</p>
                        <button class="buyedsCard__Btn">Entregue</button>`
                    article.children[3].onclick = () => {
                        activeConfirmSection("Os items foram entregues?", "Confirme para continuar", "#20E3BB", "happy").then(async res => {
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