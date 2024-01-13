import { actualUserData, thisUserData } from "../../scripts/returnUserInfos"
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot, addDoc, collection, query, where, getDocs, serverTimestamp, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
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
let challengeWindow = document.getElementById("challengeWindow")
let closeChallengeWindow = document.getElementById("closeChallengeWindow")
let challengeSection = document.getElementById("challengeSection")

closeChallengeWindow.onclick = () => {
    challengeSection.style.display = "flex"
    challengeWindow.style.display = "none"
}

async function loadChallenges() {
    actualUserData().then(async (UserData) => {
        let challengesDiv = document.getElementById("challengesDiv")
        let q = query(collection(db, "challenges"), where("challengeTitle", "!=", ""));
        let querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            let acess = false
            let signatureToAcess
            doc.data().challengeClass.forEach(element => {
                if (element == UserData.class.replace("°", "")) {
                    acess = true
                    signatureToAcess = 1
                }
            });
            if (acess == false) {
                doc.data().challengeClass.forEach(element => {
                    if (element == "Extra") {
                        signatureToAcess = 3
                    }
                })
            }
            if (signatureToAcess != 1 && signatureToAcess != 3) {
                signatureToAcess = 2
            }
            getDownloadURL(ref(storage, `challenges/${doc.id}/mask`))
                .then((url) => {
                    const xhr = new XMLHttpRequest();
                    xhr.responseType = 'blob';
                    xhr.onload = (event) => {
                        const blob = xhr.response;
                    };
                    xhr.open('GET', url);
                    xhr.send();

                    let article = document.createElement("article")
                    challengesDiv.insertAdjacentElement("beforeend", article)
                    article.classList.add("challengeCard")
                    article.innerHTML = `
                        <div class="challengeCard__div--1">
                            <div class="challengeCard__div--2">
                                ${acess == true ? `<ion-icon class="challengeCard__signatureIcon" name="school-outline"></ion-icon>` : `${signatureToAcess == 2 ? `<ion-icon name="construct-outline" class="challengeCard__signatureIcon"></ion-icon>` : `<ion-icon name="rocket-outline" class="challengeCard__signatureIcon"></ion-icon>`}`}
                                <p class="challengeCard__levelText">Nivel:${doc.data().challengeClass.map(level => `${level != "Extra" ? ` ${level}°` : ` Extracurricular`}`)}</p>
                            </div>
                            <img class="challengeCard__mask" src="${url}" alt="mask">
                        </div>
                        <p class="challengeCard__title">${doc.data().challengeTitle}</p>
                        <p class="challengeCard__description">${doc.data().challengeDescription}</p>
                        <span class="challengeCard__points">${doc.data().challengePoints} Pontos</span>                                            
                    `
                    article.onclick = () => {
                        ChallengeWindowData(doc.data(), doc.id, url)
                    }
                })
                .catch((error) => {
                    // Handle any errors
                });
        });
    })
}

function ChallengeWindowData(obj, id, url) {
    challengeWindow.children[1].textContent = `${obj.challengeTitle}`
    challengeWindow.children[2].children[0].src = `${url}`
    challengeWindow.children[3].textContent = `${obj.challengeDescription}`
    challengeWindow.children[5].textContent = `Detalhes da atividade: ${obj.challengeDetails}`
    challengeWindow.children[7].textContent = `+${obj.challengePoints} Pontos`
    challengeSection.style.display = "none"
    challengeWindow.style.display = "flex"
}

thisUserData("gabrielbastos@maker.com").then( UserData => {
    console.log(UserData);
})

loadChallenges()