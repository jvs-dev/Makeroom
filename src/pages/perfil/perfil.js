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
let perfilDataDiv = document.getElementById("perfilDataDiv")
let perfilCertifiesDiv = document.getElementById("perfilCertifiesDiv")
let perfilShowData = document.getElementById("perfilShowData")
let perfilShowCertifies = document.getElementById("perfilShowCertifies")

perfilShowData.onclick = () => {
    perfilDataDiv.style.display = "flex"
    perfilCertifiesDiv.style.display = "none"
    perfilShowData.classList.add("active")
    perfilShowCertifies.classList.remove("active")
}

perfilShowCertifies.onclick = () => {
    perfilDataDiv.style.display = "none"
    perfilCertifiesDiv.style.display = "flex"
    perfilShowData.classList.remove("active")
    perfilShowCertifies.classList.add("active")
}


closePerfil.onclick = function () {
    homeSection.style.display = "flex"
    document.getElementById("perfilSection").style.display = "none"
}


onAuthStateChanged(auth, (user) => {
    if (user) {
        const uid = user.uid;
        actualUserData().then(actualUser => {
            loadCertifies(user.email)
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

async function loadCertifies(email) {
    perfilCertifiesDiv.innerHTML = ""
    const q = query(collection(db, "challenges"), where("challengeCertifiedTitle", "!=", ""));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        returnResolversEmail(doc.id).then(resolverItems => {
            resolverItems.forEach(resolverData => {
                if (resolverData.resolved == true && resolverData.senderEmail == email) {
                    let article = document.createElement("article")
                    article.classList.add("certifiedCard")
                    perfilCertifiesDiv.insertAdjacentElement("beforeend", article)
                    article.innerHTML = `
                        <img class="certifiedCard__logo" src="assets/logo.svg" alt="">
                        <img class="certifiedCard__flag" src="assets/flag.svg" alt="">
                        <div class="certifiedCard__div--1">
                            <p class="certifiedCard__p--1">Certificamos que</p>
                            <p class="certifiedCard__p--2">${resolverData.senderName}</p>
                            <p class="certifiedCard__p--1">Em 15/08/24 concluiu na plataforma makeroom o curso</p>
                            <p class="certifiedCard__p--2">${doc.data().challengeCertifiedTitle}</p>
                            <span class="certifiedCard__span--1">Certification Program</span>
                        </div>
                        <div class="certifiedCard__div--2">
                            <span class="certifiedCard__signature">Gilsimar</span>
                            <p class="certifiedCard__chefName">Gil Andrade</p>
                            <p class="certifiedCard__chefPosisie">Chef Officer- Makeroom</p>
                        </div>
                        <div class="certifiedCard__retangle--1"></div>
                        <div class="certifiedCard__retangle--2"></div>`
                }
            });
        })

    });
}

function returnResolversEmail(id) {
    return new Promise(async (resolve) => {
        let resolversEmail = []
        const querySnapshot = await getDocs(collection(db, "challenges", `${id}`, "resolves"));
        querySnapshot.forEach((doc) => {
            resolversEmail.push(doc.data())
        });
        resolve(resolversEmail)
    })
}