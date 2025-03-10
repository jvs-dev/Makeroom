import QRCode from 'qrcode';
import { actualUserData, thisUserData, actualUserEmail } from "../../scripts/returnUserInfos"
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot, addDoc, collection, query, updateDoc, where, increment, getDoc, getDocs, serverTimestamp, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadString, deleteObject, uploadBytesResumable, getDownloadURL, uploadBytes } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { alertThis } from "../../components/alerts/alert";
import { alternatePage } from "../../scripts/alternatePages";
import { monitorCollectionUpdates } from '../../scripts/returnDataInfos';
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
let cartTotalSpan = document.getElementById("cartTotalSpan")
let urlParams = new URLSearchParams(window.location.search);
let page = urlParams.get("page");

document.getElementById("closeCartSection").onclick = function () {
    alternatePage(document.getElementById("storeSection"))
}

setInterval(() => {
    if (cartItemsDiv.innerHTML == "") {
        cartItemsDiv.classList.add("empity")
    }
}, 1000);

export function initCart() {
    let cartItemsDiv = document.getElementById("cartItemsDiv")
    let cartBuyDiv = document.getElementById("cartBuyDiv")
    let buyCartItens = document.getElementById("buyCartItens")
    let items = []
    cartBuyDiv.style.display = "none"
    cartItemsDiv.innerHTML = ""
    cartItemsDiv.classList.add("empity")
    actualUserEmail().then(async (email) => {
        if (email == "no user conected" && page == "lojamaker") {
            let anonimyousCart = localStorage.getItem("anonimyousCart")
            if (anonimyousCart != null) {
                let cartCount = 0
                anonimyousCart.split(",").forEach(async (item) => {
                    const docRef = doc(db, "store", `${item.split(":")[0]}`);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        getDownloadURL(ref(storage, `store/${item.split(":")[0]}/image`))
                            .then((url) => {
                                let xhr = new XMLHttpRequest();
                                xhr.responseType = 'blob';
                                xhr.onload = (event) => {
                                    let blob = xhr.response;
                                };
                                xhr.open('GET', url);
                                xhr.send();
                                items.push(` '${docSnap.data().name}: ${item.split(":")[1]}' `)
                                cartBuyDiv.style.display = ""
                                cartItemsDiv.classList.remove("empity")
                                let article = document.createElement("article")
                                cartItemsDiv.insertAdjacentElement("beforeend", article)
                                article.classList.add("cartItemCard")
                                article.innerHTML = `
                                    <div class="cartItemCard__div--1">
                                        <button type="button" class="cartItemCard__addRemoveBtn"><ion-icon name="add-outline"></ion-icon></button>
                                        <input type="number" class="cartItemCard__input" value="${item.split(":")[1]}">
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
                                    article.children[0].children[1].value = Number(article.children[0].children[1].value) + 1;
                                    let anonimyousCart = localStorage.getItem("anonimyousCart") || "";
                                    let updatedCart = [];
                                    anonimyousCart.split(",").forEach((item) => {
                                        let [id, quantity] = item.split(":");
                                        if (id == docSnap.id) {
                                            quantity = Number(article.children[0].children[1].value);
                                        }
                                        updatedCart.push(`${id}:${quantity}`);
                                    });
                                    localStorage.setItem("anonimyousCart", updatedCart.join(","));
                                    calcTotalValue();
                                }
                                article.children[0].children[1].oninput = async function () {
                                    if (Number(article.children[0].children[1].value) < 1) {
                                        article.children[0].children[1].value = 1
                                        let anonimyousCart = localStorage.getItem("anonimyousCart") || "";
                                        let updatedCart = [];
                                        anonimyousCart.split(",").forEach((item) => {
                                            let [id, quantity] = item.split(":");
                                            if (id == docSnap.id) {
                                                quantity = Number(article.children[0].children[1].value);
                                            }
                                            updatedCart.push(`${id}:${quantity}`);
                                        });
                                        localStorage.setItem("anonimyousCart", updatedCart.join(","));
                                        calcTotalValue();
                                    } else {
                                        article.children[0].children[1].value = Number(article.children[0].children[1].value)
                                        let anonimyousCart = localStorage.getItem("anonimyousCart") || "";
                                        let updatedCart = [];
                                        anonimyousCart.split(",").forEach((item) => {
                                            let [id, quantity] = item.split(":");
                                            if (id == docSnap.id) {
                                                quantity = Number(article.children[0].children[1].value);
                                            }
                                            updatedCart.push(`${id}:${quantity}`);
                                        });
                                        localStorage.setItem("anonimyousCart", updatedCart.join(","));
                                        calcTotalValue();
                                    }
                                }
                                article.children[0].children[2].onclick = async function () {
                                    if (Number(article.children[0].children[1].value) > 1) {
                                        article.children[0].children[1].value = Number(article.children[0].children[1].value) - 1;
                                        let anonimyousCart = localStorage.getItem("anonimyousCart") || "";
                                        let updatedCart = [];
                                        anonimyousCart.split(",").forEach((item) => {
                                            let [id, quantity] = item.split(":");
                                            if (id == docSnap.id) {
                                                quantity = Number(article.children[0].children[1].value);
                                            }
                                            updatedCart.push(`${id}:${quantity}`);
                                        });
                                        localStorage.setItem("anonimyousCart", updatedCart.join(","));
                                        calcTotalValue();
                                    }
                                }
                                article.children[3].onclick = function () {
                                    let anonimyousCart = localStorage.getItem("anonimyousCart") || "";
                                    let newCart = [];
                                    console.log("removendo item");
                                    anonimyousCart.split(",").forEach((item) => {
                                        if (item.split(":")[0] !== docSnap.id) {
                                            newCart.push(item);
                                        }
                                    });
                                    localStorage.setItem("anonimyousCart", newCart.join(","));
                                    article.style.display = "none";
                                    article.parentNode.removeChild(article);
                                    calcTotalValue();
                                }

                            })
                    }
                });
                buyCartItens.onclick = function () {
                    let cartFormDiv = document.getElementById("cartFormDiv")
                    let ConfirmCartFormBtn = document.getElementById("ConfirmCartFormBtn")
                    cartFormDiv.style.display = "flex"
                    ConfirmCartFormBtn.onclick = function () {

                        let cartFormResName = document.getElementById("cartFormResName")
                        let cartFormAlunoName = document.getElementById("cartFormAlunoName")
                        let cartFormTel = document.getElementById("cartFormTel")
                        let cartFormEmail = document.getElementById("cartFormEmail")
                        if (cartFormResName.value == "" || cartFormAlunoName.value == "" || cartFormTel.value == "" || cartFormEmail.value == "") {
                            alertThis("Preencha todos os campos", "error")
                        } else {
                            cartFormDiv.style.display = ""
                            anonymusBuyThisItems(cartFormEmail.value, cartFormTel.value, cartFormResName.value, cartFormAlunoName.value, items).then(payRes => {
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
                    }
                }
            }
        } else {
            const querySnapshot = await getDocs(collection(db, `${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_users`, `${email}`, "cart"));
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
                                alterCartQuanty(cartDoc.id, article.children[0].children[1].value)
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
                                    alterCartQuanty(cartDoc.id, article.children[0].children[1].value)
                                }
                            }
                            article.children[3].onclick = async function () {
                                await deleteDoc(doc(db, `${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_users`, `${email}`, "cart", `${cartDoc.id}`));
                                article.style.display = "none"
                                article.parentNode.removeChild(article);
                            }
                        })
                }
            })
            buyCartItens.onclick = function () {
                buyThisItems(email, items).then(payRes => {

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
        }
    })
}

async function alterCartQuanty(itemId, quanty) {
    actualUserEmail().then(async (email) => {
        const docRef = doc(db, `${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_users`, `${email}`, "cart", `${itemId}`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const cartItemRef = doc(db, `${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_users`, `${email}`, "cart", `${itemId}`);
            await updateDoc(cartItemRef, {
                quanty: Number(quanty)
            });
        } else {
            await setDoc(doc(db, `${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_users`, `${email}`, "cart", `${itemId}`), {
                itemId: `${itemId}`,
                quanty: Number(quanty)
            });
        }
    })
}

function calcTotalValue() {
    cartTotalSpan.textContent = `$0.00`
    actualUserEmail().then(async (email) => {
        if (email == "no user conected" && page == "lojamaker") {
            let anonimyousCart = localStorage.getItem("anonimyousCart")
            if (anonimyousCart != null) {
                let cartCount = 0
                anonimyousCart.split(",").forEach(async (item) => {
                    const docRef = doc(db, "store", `${item.split(":")[0]}`);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        cartCount = cartCount + (Number(item.split(":")[1]) * Number(docSnap.data().price))
                        cartTotalSpan.textContent = `$${cartCount.toFixed(2)}`
                    }
                });
            }
        } else {
            monitorCollectionUpdates(`${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_users/${email}/cart`, async (dataItems) => {
                let cartCount = 0
                const querySnapshot = await getDocs(collection(db, `${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_users`, `${email}`, "cart"));
                querySnapshot.forEach(async (item) => {
                    const docRef = doc(db, "store", `${item.data().itemId}`);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        cartCount = cartCount + (Number(item.data().quanty) * Number(docSnap.data().price))
                        cartTotalSpan.textContent = `$${cartCount.toFixed(2)}`
                    }
                });
                if (querySnapshot.size == 0) {
                    cartTotalSpan.textContent = `$0.00`
                    initCart()
                }
            })
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
        fetch('https://makeroom-payment.vercel.app/api/createpay', requestOptions)
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

function returnCartTotal() {
    return new Promise(resolve => {
        let value = 0;
        actualUserEmail().then(async (email) => {
            const querySnapshot = await getDocs(collection(db, `${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_users`, `${email}`, "cart"));
            const promises = querySnapshot.docs.map(async (item) => {
                const docRef = doc(db, "store", `${item.data().itemId}`);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    value += Number(item.data().quanty) * Number(docSnap.data().price);
                }
            });
            await Promise.all(promises);
            resolve(value);
        });
    });
}

async function returnAnonymusCartTotal() {
    return new Promise(async (resolve) => {
        let value = 0;
        let anonimyousCart = localStorage.getItem("anonimyousCart");
        if (anonimyousCart != null) {
            const promises = anonimyousCart.split(",").map(async (item) => {
                const docRef = doc(db, "store", `${item.split(":")[0]}`);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    value += Number(item.split(":")[1]) * Number(docSnap.data().price);
                }
            });
            await Promise.all(promises);
            resolve(value);
        } else {
            resolve(0); // Se não houver carrinho, retorna 0
        }
    });
}

async function buyThisItems(email, items) {
    return new Promise(resolve => {
        actualUserData().then(async (userData) => {
            returnCartTotal().then(value => {
                const today = new Date();
                const day = String(today.getDate()).padStart(2, '0');
                const month = String(today.getMonth() + 1).padStart(2, '0');
                const year = String(today.getFullYear()).slice(-2);
                const formattedDate = `${day}/${month}/${year}`;
                createPay(email, value, items).then(async (payRes) => {
                    let docRef = await addDoc(collection(db, `${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_payments`), {
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
    })
}

async function anonymusBuyThisItems(email, phone, resName, alunoName, items) {
    return new Promise(resolve => {
        returnAnonymusCartTotal().then(cartCount => {
            const today = new Date();
            const day = String(today.getDate()).padStart(2, '0');
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const year = String(today.getFullYear()).slice(-2);
            const formattedDate = `${day}/${month}/${year}`;
            createPay(email, cartCount, items).then(async (payRes) => {
                let docRef = await addDoc(collection(db, `anonymus_payments`), {
                    payerEmail: `${email}`,
                    phone: `${phone}`,
                    resName: `${resName}`,
                    alunoName: `${alunoName}`,
                    paymentStatus: "pending",
                    totalAmount: Number(cartCount),
                    items: items,
                    paymentId: payRes.result.id,
                    delivered: false,
                    noticed: false,
                    payDate: formattedDate,
                    payerName: resName,
                    anonymusBuy: true
                });
                resolve(payRes.result)
            })
        })
    })
}

calcTotalValue()

export function updateCartOff() {
    calcTotalValue()
}