import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, updateDoc, setDoc, onSnapshot, addDoc, collection, query, where, getDocs, serverTimestamp, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadString, deleteObject, uploadBytesResumable, getDownloadURL, uploadBytes } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
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
let homeSection = document.getElementById("homeSection")
let closePerfil = document.getElementById("closePerfil")
let perfilSection = document.getElementById("perfilSection")
let perfilViewPassword = document.getElementById("perfilViewPassword")
let perfilPassword = document.getElementById("perfilPassword")
let perfilEmail = document.getElementById("perfilEmail")
let perfilPhotoInput = document.getElementById("perfilPhotoInput")

closePerfil.onclick = function () {
    homeSection.style.display = "flex"
    document.getElementById("perfilSection").style.display = "none"
}


onAuthStateChanged(auth, (user) => {
    if (user) {
        const uid = user.uid;
        actualUserData().then(actualUser => {            
            let coverUrl = ""
            if (actualUser.noPhoto == true) {
                perfilSection.children[0].children[3].children[0].children[0].children[0].src = "https://img.freepik.com/vetores-gratis/ilustracao-do-icone-da-lampada_53876-43730.jpg?w=740&t=st=1705192551~exp=1705193151~hmac=3347369c888609a6def2a1cd13bfb02dc519c8fbc965419dd1b5f091ef79982d"
            } else {
                getDownloadURL(ref(storage, `users/${actualUser.email}/photo`))
                    .then((url) => {
                        let xhr = new XMLHttpRequest();
                        xhr.responseType = 'blob';
                        xhr.onload = (event) => {
                            let blob = xhr.response;
                        };
                        xhr.open('GET', url);
                        xhr.send();
                        perfilSection.children[0].children[3].children[0].children[0].children[0].src = `${url}`
                    })
            }
            if (actualUser.noCover == true) {
                coverUrl = "https://images.pexels.com/photos/7869091/pexels-photo-7869091.jpeg?auto=compress&cs=tinysrgb&w=600"
            }
            perfilSection.children[1].innerHTML = `${actualUser.name}`
            perfilSection.children[2].children[0].innerHTML = `${actualUser.signature}`
            perfilSection.children[2].children[1].innerHTML = `${actualUser.points} Pontos`
            perfilSection.children[0].children[2].src = `${coverUrl}`
            perfilEmail.value = `${actualUser.email}`
            perfilViewPassword.onclick = function () {
            }
            perfilPhotoInput.onchange = function () {
                if (perfilPhotoInput.files && perfilPhotoInput.files[0]) {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        perfilSection.children[0].children[3].children[0].children[0].children[0].src = e.target.result;
                        let storageRef = ref(storage, `users/${actualUser.email}/photo`);
                        uploadString(storageRef, e.target.result, 'data_url').then(async (snapshot) => {
                            const userPhotoDataRef = doc(db, "users", `${actualUser.email}`);
                            await updateDoc(userPhotoDataRef, {
                                noPhoto: false
                            });
                        });
                    }
                    reader.readAsDataURL(perfilPhotoInput.files[0]);
                }
            }
            /* document.getElementById("homeUserSignature").innerHTML = `Assinatura: ${actualUser.signature}`
            document.getElementById("homeUserImg").src = `${photoUrl}`
            document.getElementById("homeUserCover").style.backgroundImage = `linear-gradient(0deg, rgba(250, 250, 250, 0.88), rgba(250, 250, 250, 0.88)), url(${coverUrl})`
            document.getElementById("homeViewPerfil").onclick = function () {
                homeSection.style.display = "none"
                document.getElementById("perfilSection").style.display = "flex"
            } */
        })
        /* loadLessons() */
    }
});