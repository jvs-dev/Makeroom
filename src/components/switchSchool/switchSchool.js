import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot, addDoc, collection, query, updateDoc, where, increment, getDoc, arrayUnion, arrayRemove, getDocs, serverTimestamp, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadString, deleteObject, uploadBytesResumable, getDownloadURL, uploadBytes } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { activeLoading } from "../../components/uploadingSection/uploadingSection";
import { activeConfirmSection } from "../../components/confirmSection/confirmSection";
import { deleteAllFiles, deleteAllsubDocs, deleteFiles, deleteThis } from "../../scripts/deleteThis";
import { alertThis } from "../../components/alerts/alert";
import { actualUserData } from "../../scripts/returnUserInfos";
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

let switchSchool = document.getElementById("switchSchool")
let switchSchoolDiv = document.getElementById("switchSchoolDiv")
let closeSwitchSchoolDiv = document.getElementById("closeSwitchSchoolDiv")
let schoolsCardDiv = document.getElementById("schoolsCardDiv")
let switchSchoolBtn = document.getElementById("switchSchoolBtn")
let schoolToSwitch = null

switchSchool.onclick = function () {
    switchSchoolDiv.style.display = "flex"
}

closeSwitchSchoolDiv.onclick = function () {
    switchSchoolDiv.style.display = "none"
}


async function loadSchools() {
    actualUserData().then(async (userData) => {
        if (userData.admin == true) {
            schoolsCardDiv.innerHTML = ""
            const docRef = doc(db, "schools", "all");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                docSnap.data().schools.forEach((element, index) => {
                    let actualSchool = 0
                    if (localStorage.getItem("schoolIndex") != undefined) {
                        actualSchool = localStorage.getItem("schoolIndex")
                    } else {
                        localStorage.setItem("schoolIndex", 0)
                    }
                    let div = document.createElement("div")
                    schoolsCardDiv.insertAdjacentElement("beforeend", div)
                    div.classList.add("switchSchoolDiv__div--2")
                    if (actualSchool == index) {
                        div.classList.add("active")
                    }
                    div.innerHTML = `
                        <button>
                            ${element}<ion-icon name="checkmark-circle-${actualSchool == index ? "sharp" : "outline"}"></ion-icon>
                        </button>
                        <ion-icon name="trash-outline"></ion-icon>`
                    div.children[0].onclick = function () {
                        document.querySelectorAll(".switchSchoolDiv__div--2").forEach(card => {
                            card.classList.remove("active")
                            card.children[0].children[0].name = "checkmark-circle-outline"
                        });
                        div.classList.add("active")
                        div.children[0].children[0].name = "checkmark-circle-sharp"
                        schoolToSwitch = index
                    }
                });
                switchSchoolBtn.onclick = () => {
                    localStorage.setItem("schoolIndex", schoolToSwitch)
                    window.location.reload()
                }
            }
        }
    })
}


onAuthStateChanged(auth, (user) => {
    if (user) {
        const uid = user.uid;
        loadSchools()
    }
});