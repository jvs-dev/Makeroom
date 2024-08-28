import { activeLoading } from "../../components/uploadingSection/uploadingSection"
import { alertThis } from "../../components/alerts/alert"
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

let challengeMask = document.getElementById('challengeMask')
let selectClassRoom = document.querySelectorAll(".createChallengeSection__selectClassRoom")
let challengeSelected = []
let createChallengeBtn = document.getElementById("createChallengeBtn")
let uploadsCompleteds = 0

selectClassRoom.forEach(element => {
    element.onclick = function () {
        if (element.classList.contains("active")) {
            element.classList.remove("active")
            challengeSelected.splice(challengeSelected.indexOf(`${element.id.replace("challengeFor", "")}`), 1)
        } else {
            element.classList.add("active")
            challengeSelected.push(`${element.id.replace("challengeFor", "")}`)
        }
    }
});

challengeMask.onchange = function () {
    if (challengeMask.files && challengeMask.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            document.getElementById('challengePreviewMask').src = e.target.result;
            challengeMask.parentNode.style.background = "#1e1e1e"
        }
        reader.readAsDataURL(challengeMask.files[0]);
    }
}

createChallengeBtn.onclick = async function () {
    let challengeTitleValue = document.getElementById("challengeTitle").value
    let challengeDescriptionValue = document.getElementById("challengeDescription").value
    let challengeCertifiedTitleValue = document.getElementById("challengeCertifiedTitle").value
    let challengePointsValue = document.getElementById("challengePoints").value
    let challengeMaskSrc = document.getElementById('challengePreviewMask').src
    createChallengeBtn.disabled = true
    if (challengeTitleValue != "" && challengeDescriptionValue != "" && challengePointsValue > 0 && challengeMaskSrc != window.location.href && challengeSelected.length != 0) {
        uploadsCompleteds = 0
        activeLoading(uploadsCompleteds)
        let docRef = await addDoc(collection(db, "challenges"), {
            challengeTitle: `${challengeTitleValue}`,
            challengeClass: challengeSelected,
            challengeDescription: `${challengeDescriptionValue}`,      
            challengeCertifiedTitle:  `${challengeCertifiedTitleValue}`,     
            challengePoints: Number(challengePointsValue)
        });
        uploadsCompleteds = uploadsCompleteds + 50
        activeLoading(uploadsCompleteds)
        if (uploadsCompleteds == 100) {
            alertThis("Desafio criado com sucesso", "sucess")
            createChallengeBtn.disabled = false
            clearInputs()
        }

        let storageRef = ref(storage, `challenges/${docRef.id}/mask`);
        uploadString(storageRef, challengeMaskSrc, 'data_url').then((snapshot) => {
            uploadsCompleteds = uploadsCompleteds + 50
            activeLoading(uploadsCompleteds)
            if (uploadsCompleteds == 100) {
                alertThis("Desafio criado com sucesso", "sucess")
                createChallengeBtn.disabled = false
                clearInputs()
            }
        });
    } else {
        alertThis("Preencha todos os campos", "")
        createChallengeBtn.disabled = false
    }
}



function clearInputs() {
    document.getElementById("challengeTitle").value = ""
    document.getElementById("challengeDescription").value = ""    
    document.getElementById("challengePoints").value = ""
    document.getElementById('challengePreviewMask').src = ""
    challengeSelected = []
    selectClassRoom.forEach(element => {
        element.classList.remove("active")
    });
    challengeMask.parentNode.style.background = "#fff"
}



