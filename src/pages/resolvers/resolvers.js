import { postComment, getThisComment } from "../../scripts/postGetcoments"
import { actualUserData, thisUserData, actualUserEmail } from "../../scripts/returnUserInfos"
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, updateDoc, setDoc, onSnapshot, addDoc, collection, query, where, getDoc, getDocs, serverTimestamp, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadString, deleteObject, uploadBytesResumable, getDownloadURL, uploadBytes } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { activeLoading } from "../../components/uploadingSection/uploadingSection";
import { alertThis } from "../../components/alerts/alert";
import { activeConfirmSection } from "../../components/confirmSection/confirmSection";
import { deleteAllFiles, deleteAllsubDocs, deleteFiles, deleteThis } from "../../scripts/deleteThis";
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
let resolversSectionDiv = document.getElementById("resolversSectionDiv")

async function loadResolves() {
    resolversSectionDiv.innerHTML = ""
    const querySnapshot = await getDocs(collection(db, `${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_challenges`));
    querySnapshot.forEach(async (challenge) => {
        getDownloadURL(ref(storage, `${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_challenges/${challenge.id}/mask`))
            .then(async (url) => {
                const xhr = new XMLHttpRequest();
                xhr.responseType = 'blob';
                xhr.onload = (event) => {
                    const blob = xhr.response;
                };
                xhr.open('GET', url);
                xhr.send();
                let article = document.createElement("article")
                resolversSectionDiv.insertAdjacentElement("beforeend", article)
                article.classList.add("resolverCard")
                article.innerHTML = `
                        <div class="resolverCard__div--1">
                            <img src="${url}" alt="" class="resolverCard__img">
                            <div class="resolverCard__div--2">
                                <p class="resolverCard__activieName">${challenge.data().challengeTitle}</p>
                                <p class="resolverCard__activiepoints">+${challenge.data().challengePoints} pontos</p>
                            </div>
                            <button class="resolverCard__arrow"><ion-icon name="chevron-down-outline"></ion-icon></button>
                        </div>`
                article.children[0].children[2].onclick = () => {
                    if (article.style.height == `auto`) {
                        article.style.height = ``
                        article.children[0].children[2].style.rotate = ``
                    } else {
                        article.style.height = `auto`
                        article.children[0].children[2].style.rotate = `180deg`
                    }

                }
                const resolverSnapshot = await getDocs(collection(db, `${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_challenges`, `${challenge.id}`, "resolves"));
                resolverSnapshot.forEach((resolve) => {
                    if (resolve.data().resolved == false) {
                        let div = document.createElement("div")
                        div.classList.add("resolverCard__div--3")
                        article.insertAdjacentElement("beforeend", div)
                        div.innerHTML = `
                            <div class="resolverCard__div--4">
                                <div class="resolverCard__div--5">
                                    <p class="resolverCard__resolverName">${resolve.data().senderName}</p>
                                    <p class="resolverCard__date">${resolve.data().sendDate}</p>
                                </div>
                                <button class="resolverCard__download"><i class="bi bi-file-earmark-arrow-down"></i></button>
                            </div>
                            <button class="resolverCard__resolvedBtn">Atividade Correta</button>
                            <button class="resolverCard__resolvedBtn--2">Atividade Errada</button>`
                        div.children[0].children[1].onclick = () => {
                            getDownloadURL(ref(storage, `${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_challengesResolveds/${challenge.id}/${resolve.data().senderEmail}`))
                                .then(async (file) => {
                                    const a = document.createElement('a');
                                    a.href = file;
                                    a.download = '';
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                })
                        }
                        div.children[1].onclick = async () => {
                            const washingtonRef = doc(db, `${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_challenges`, `${challenge.id}`, "resolves", `${resolve.data().senderEmail}`);
                            await updateDoc(washingtonRef, {
                                resolved: true
                            });
                            div.style.display = "none"
                            div.parentNode.removeChild(div);
                            if (article.children[1] == undefined) {
                                article.style.display = "none"
                                article.parentNode.removeChild(article);
                            }
                        }
                        div.children[2].onclick = async () => {
                            const washingtonRef = doc(db, `${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_challenges`, `${challenge.id}`, "resolves", `${resolve.data().senderEmail}`);
                            await updateDoc(washingtonRef, {
                                resolved: "incorrect"
                            });
                            div.style.display = "none"
                            div.parentNode.removeChild(div);
                            if (article.children[1] == undefined) {
                                article.style.display = "none"
                                article.parentNode.removeChild(article);
                            }
                        }
                    }
                })
                if (article.children[1] == undefined) {
                    article.style.display = "none"
                    article.parentNode.removeChild(article);
                }
                if (resolverSnapshot.size == 0) {
                    article.style.display = "none"
                    article.parentNode.removeChild(article);
                }
            })
    });
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        const uid = user.uid;
        loadResolves()
    }
});