import { actualUserData, thisUserData, actualUserEmail } from "../../scripts/returnUserInfos"
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot, addDoc, collection, query, updateDoc, where, increment, getDoc, getDocs, serverTimestamp, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadString, deleteObject, uploadBytesResumable, getDownloadURL, uploadBytes } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { alertThis } from "../../components/alerts/alert";
import { alternatePage } from "../../scripts/alternatePages";
import { initCart } from "../cart/cart";
import { monitorAllCollectionUpdates, monitorCollectionUpdates } from "../../scripts/returnDataInfos";
import { activeConfirmSection } from "../../components/confirmSection/confirmSection";
import { deleteThis } from "../../scripts/deleteThis";
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
let searchInput = document.getElementById("searchInput")
let cartCount = 0
let urlParams = new URLSearchParams(window.location.search);
let page = urlParams.get("page");

searchInput.onchange = () => {
    loadStore()
}

async function loadStore() {
    let storeDiv = document.getElementById("storeDiv")
    storeDiv.innerHTML = ""
    const querySnapshot = await getDocs(collection(db, "store"));
    querySnapshot.forEach((doc) => {
        if (searchInput.value != "") {
            if (doc.data().name.toLowerCase().includes(`${searchInput.value.toLowerCase()}`) == true) {
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
                        let body = document.querySelector("body")
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
                        article.children[1].children[0].onclick = (evt) => {
                            evt.stopPropagation()
                        }
                        article.children[1].children[1].onclick = (evt) => {
                            evt.stopPropagation()
                        }
                        addCartIcon.onclick = (evt) => {
                            evt.stopPropagation()
                            addCartInput.value = Number(addCartInput.value) + 1
                        }
                        removeCartIcon.onclick = (evt) => {
                            evt.stopPropagation()
                            addCartInput.value = Number(addCartInput.value) - 1
                        }
                        addCartBtn.onclick = (evt) => {
                            evt.stopPropagation()
                            addCartBtn.style.display = "none"
                            article.children[1].children[1].style.display = "none"
                            checkBtn.style.display = ""
                            article.children[1].children[0].style.display = ""
                            addCartInput.value = 1
                            body.onclick = () => {
                                addCartBtn.style.display = ""
                                article.children[1].children[1].style.display = ""
                                checkBtn.style.display = "none"
                                article.children[1].children[0].style.display = "none"
                            }
                        }
                        checkBtn.onclick = (evt) => {
                            evt.stopPropagation()
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
                                    if (page == "lojamaker") {
                                        let anonimyousCart = localStorage.getItem("anonimyousCart") || "";
                                        let updatedCart = [];
                                        let itemExists = false;

                                        if (anonimyousCart) {
                                            anonimyousCart.split(",").forEach((item) => {
                                                let [id, quantity] = item.split(":");
                                                if (id === doc.id) {
                                                    quantity = parseInt(quantity) + parseInt(addCartInput.value);
                                                    itemExists = true;
                                                }
                                                updatedCart.push(`${id}:${quantity}`);
                                            });
                                        }
                                        if (!itemExists) {
                                            updatedCart.push(`${doc.id}:${addCartInput.value}`);
                                        }
                                        localStorage.setItem("anonimyousCart", updatedCart.join(","));
                                        alertThis("Adicionado com sucesso", "sucess");
                                    } else {
                                        alertThis("Faça login para continuar", "")
                                    }
                                }
                            })
                        }
                        actualUserData().then(userData => {
                            if (userData.admin == true) {
                                let deleteBtn = document.createElement("button")
                                article.insertAdjacentElement("beforeend", deleteBtn)
                                deleteBtn.classList.add("storeCard__deleteBtn")
                                deleteBtn.innerHTML = `<ion-icon name="trash-outline"></ion-icon>`
                                deleteBtn.onclick = (evt) => {
                                    evt.stopPropagation()
                                    activeConfirmSection("Deseja excluir este item?", "Esta ação não poderá ser desfeita", "#f00", "sad").then(res => {
                                        if (res == "confirmed") {
                                            deleteThis(`store`, `${doc.id}`).then(res => {
                                                deleteItemForAll(`${doc.id}`)
                                                alertThis("Item deletado com sucesso", "sucess")
                                                loadStore()
                                            })
                                        }
                                    })
                                }
                            }
                        })
                    })
                    .catch((error) => {
                        // Handle any errors
                    });
            }
        } else {
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
                    let body = document.querySelector("body")
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
                    article.children[1].children[0].onclick = (evt) => {
                        evt.stopPropagation()
                    }
                    article.children[1].children[1].onclick = (evt) => {
                        evt.stopPropagation()
                    }
                    addCartIcon.onclick = (evt) => {
                        evt.stopPropagation()
                        addCartInput.value = Number(addCartInput.value) + 1
                    }
                    removeCartIcon.onclick = (evt) => {
                        evt.stopPropagation()
                        addCartInput.value = Number(addCartInput.value) - 1
                    }
                    addCartBtn.onclick = (evt) => {
                        evt.stopPropagation()
                        addCartBtn.style.display = "none"
                        article.children[1].children[1].style.display = "none"
                        checkBtn.style.display = ""
                        article.children[1].children[0].style.display = ""
                        addCartInput.value = 1
                        body.onclick = () => {
                            addCartBtn.style.display = ""
                            article.children[1].children[1].style.display = ""
                            checkBtn.style.display = "none"
                            article.children[1].children[0].style.display = "none"
                        }
                    }
                    checkBtn.onclick = (evt) => {
                        evt.stopPropagation()
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
                                if (page == "lojamaker") {
                                    let anonimyousCart = localStorage.getItem("anonimyousCart") || "";
                                    let updatedCart = [];
                                    let itemExists = false;
                                    if (anonimyousCart) {
                                        anonimyousCart.split(",").forEach((item) => {
                                            let [id, quantity] = item.split(":");
                                            if (id === doc.id) {
                                                quantity = parseInt(quantity) + parseInt(addCartInput.value);
                                                itemExists = true;
                                            }
                                            updatedCart.push(`${id}:${quantity}`);
                                        });
                                    }
                                    if (!itemExists) {
                                        updatedCart.push(`${doc.id}:${addCartInput.value}`);
                                    }
                                    localStorage.setItem("anonimyousCart", updatedCart.join(","));
                                    alertThis("Adicionado com sucesso", "sucess");
                                } else {
                                    alertThis("Faça login para continuar", "")
                                }
                            }
                        })
                    }
                    actualUserData().then(userData => {
                        if (userData.admin == true) {
                            let deleteBtn = document.createElement("button")
                            article.insertAdjacentElement("beforeend", deleteBtn)
                            deleteBtn.classList.add("storeCard__deleteBtn")
                            deleteBtn.innerHTML = `<ion-icon name="trash-outline"></ion-icon>`
                            deleteBtn.onclick = (evt) => {
                                evt.stopPropagation()
                                activeConfirmSection("Deseja excluir este item?", "Esta ação não poderá ser desfeita", "#f00", "sad").then(res => {
                                    if (res == "confirmed") {
                                        deleteThis(`store`, `${doc.id}`).then(res => {
                                            deleteItemForAll(`${doc.id}`)
                                            alertThis("Aula deletada com sucesso", "sucess")
                                            loadStore()
                                        })
                                    }
                                })
                            }
                        }
                    })
                })
                .catch((error) => {
                    // Handle any errors
                });
        }
    });
}


async function deleteItemForAll(id) {
    const scRef = doc(db, "schools", "all");
    const scSnap = await getDoc(scRef);
    if (scSnap.exists()) {
        scSnap.data().schools.forEach(async (scName, index) => {
            const userSnapshot = await getDocs(collection(db, `${index}_users`));
            userSnapshot.forEach(async (user) => {
                const querySnapshot = await getDocs(collection(db, `${index}_users`, `${user.id}`, "cart"));
                querySnapshot.forEach(async (item) => {
                    if (item.id == id) {
                        await deleteDoc(doc(db, `${index}_users`, `${user.id}`, "cart", `${id}`));
                    }
                });
            });
        });
    }
}

async function addCartFct(itemId, quanty) {
    return new Promise(async (resolve) => {
        actualUserEmail().then(async (email) => {
            const docRef = doc(db, `${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_users`, `${email}`, "cart", `${itemId}`);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const cartItemRef = doc(db, `${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_users`, `${email}`, "cart", `${itemId}`);
                await updateDoc(cartItemRef, {
                    quanty: increment(Number(quanty))
                });
                resolve("added")
            } else {
                await setDoc(doc(db, `${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_users`, `${email}`, "cart", `${itemId}`), {
                    itemId: `${itemId}`,
                    quanty: Number(quanty)
                });
                resolve("added")
            }
        })
    })
}


function updateCartQuanty() {
    actualUserEmail().then(async (email) => {
        if (email == "no user conected" && page == "lojamaker") {
            setInterval(() => {
                localStorage.getItem("anonimyousCart") != null ? storeCartBtn.children[1].textContent = `${localStorage.getItem("anonimyousCart").split(",").length}` : storeCartBtn.children[1].textContent = `0`
            }, 500)
        } else {
            monitorCollectionUpdates(`${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_users/${email}/cart`, async (dataItems) => {
                cartCount = 0
                const querySnapshot = await getDocs(collection(db, `${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_users`, `${email}`, "cart"));
                querySnapshot.forEach((doc) => {
                    storeCartBtn.children[1].textContent = ``
                    cartCount = cartCount + Number(doc.data().quanty)
                    storeCartBtn.children[1].textContent = `${cartCount}`
                });
                if (querySnapshot.size == 0) {
                    storeCartBtn.children[1].textContent = `0`
                }
            })
        }
    })
}

document.getElementById("storeCartBtn").onclick = function () {
    if (window.innerWidth > 600) {
        document.getElementById("cartSection").style.display = "flex"
        initCart()
    } else {
        alternatePage(document.getElementById("cartSection"))
        initCart()
    }
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        const uid = user.uid;
        loadStore()
        updateCartQuanty()
    } else {
        if (page == "lojamaker") {
            loadStore()
            updateCartQuanty()
            document.querySelectorAll(".header__menuToggle").forEach(menuBtn => { menuBtn.parentNode.removeChild(menuBtn); })
            document.getElementById("menuSection").parentNode.removeChild(document.getElementById("menuSection"));
        }
    }
});