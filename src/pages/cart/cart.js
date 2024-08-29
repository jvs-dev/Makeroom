import QRCode from 'qrcode';
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
    let buyCartItens = document.getElementById("buyCartItens")
    let items = []
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
                        items.push(` '${docSnap.data().name}: ${cartDoc.data().quanty}' `)
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
        buyCartItens.onclick = function () {
            buyThisItems(email, Number(totalCount), items).then(payRes => {
                let cartPaymentDiv = document.getElementById("cartPaymentDiv")
                cartPaymentDiv.style.display = "flex"
                generateQRCode(payRes.point_of_interaction.transaction_data.qr_code).then((qrCodeLink) => {
                    cartPaymentDiv.children[0].children[2].src = `${qrCodeLink}`
                })
                cartPaymentDiv.children[0].children[3].children[1].textContent = `${payRes.point_of_interaction.transaction_data.qr_code}`
                cartPaymentDiv.children[0].children[3].children[0].onclick = () => {
                    let tempTextArea = document.createElement("textarea");
                    tempTextArea.value = cartPaymentDiv.children[0].children[3].children[1].innerText;
                    document.body.appendChild(tempTextArea);
                    tempTextArea.select();
                    document.execCommand("copy");
                    document.body.removeChild(tempTextArea);
                    cartPaymentDiv.children[0].children[3].children[0].innerHTML = `<ion-icon name="checkmark-circle-outline"></ion-icon>`
                    cartPaymentDiv.children[0].children[3].children[0].style.background = "#20E3BB"
                    cartPaymentDiv.children[0].children[3].children[0].style.color = "#fff"
                    setTimeout(() => {
                        cartPaymentDiv.children[0].children[3].children[0].innerHTML = `<ion-icon name="copy-outline"></ion-icon>`
                        cartPaymentDiv.children[0].children[3].children[0].style.background = ""
                        cartPaymentDiv.children[0].children[3].children[0].style.color = ""
                    }, 3000);
                }
                cartPaymentDiv.children[0].children[4].onclick = () => {
                    cartPaymentDiv.style.display = ""
                }
            })
        }
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

async function createPay(email, value, items) {
    return new Promise(resolve => {
        let requestBody = {
            payerEmail: `${email}`,
            value: `${value}`,
            items: items
        };
        let requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        };
        fetch('http://localhost:3000/api/createpay', requestOptions)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao enviar requisição: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                resolve(data)
            })
    })
}

async function generateQRCode(text) {
    return new Promise(async (resolve) => {
        try {
            const qrCodeImage = await QRCode.toDataURL(text);
            resolve(qrCodeImage)
        } catch (error) {
            resolve('error')
        }
    })
}

async function buyThisItems(email, value, items) {
    return new Promise(resolve => {
        actualUserData().then(async (userData) => {
            const today = new Date();
            const day = String(today.getDate()).padStart(2, '0');
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const year = String(today.getFullYear()).slice(-2);
            const formattedDate = `${day}/${month}/${year}`;
            createPay(email, value, items).then(async (payRes) => {
                let docRef = await addDoc(collection(db, "payments"), {
                    payerEmail: `${email}`,
                    paymentStatus: "pending",
                    totalAmount: Number(value),
                    items: items,
                    paymentId: payRes.result.id,
                    delivered: false,
                    noticed: false,
                    payDate: formattedDate,
                    payerName: userData.name
                });
                resolve(payRes.result)
            })
        })
    })
}