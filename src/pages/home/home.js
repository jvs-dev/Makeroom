import { actualUserData } from "../../scripts/returnUserInfos"
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

actualUserData().then(actualUser => {
    let photoUrl = ""
    let coverUrl = ""
    if (actualUser.noPhoto == true) {
        photoUrl = "https://img.freepik.com/vetores-gratis/ilustracao-do-icone-da-lampada_53876-43730.jpg?w=740&t=st=1705192551~exp=1705193151~hmac=3347369c888609a6def2a1cd13bfb02dc519c8fbc965419dd1b5f091ef79982d"
    }
    if (actualUser.noCover == true) {
        coverUrl = "https://images.pexels.com/photos/7869091/pexels-photo-7869091.jpeg?auto=compress&cs=tinysrgb&w=600"
    }
    document.getElementById("homeUserName").innerHTML = `${actualUser.name}`
    document.getElementById("homeUserSignature").innerHTML = `Assinatura: ${actualUser.signature}`
    document.getElementById("homeUserImg").src = `${photoUrl}`
    document.getElementById("homeUserCover").style.backgroundImage = `linear-gradient(0deg, rgba(250, 250, 250, 0.88), rgba(250, 250, 250, 0.88)), url(${coverUrl})`
})

async function loadProjects() {
    actualUserData().then(async (UserData) => {
        let LessonProjectsDiv = document.getElementById("LessonProjectsDiv")
        let q = query(collection(db, "lessons"), where("lessonCategory", "==", "Projeto"));
        let querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            let acess = false
            let signatureToAcess
            doc.data().lessonClass.forEach(element => {
                if (element == UserData.class.replace("°", "")) {
                    acess = true
                    signatureToAcess = 1
                }
            });
            if (acess == false) {
                doc.data().lessonClass.forEach(element => {
                    if (element == "Extra") {
                        signatureToAcess = 3
                    }
                })
            }
            if (signatureToAcess != 1 && signatureToAcess != 3) {
                signatureToAcess = 2
            }
            getDownloadURL(ref(storage, `lessons/${doc.id}/mask`))
                .then((url) => {
                    const xhr = new XMLHttpRequest();
                    xhr.responseType = 'blob';
                    xhr.onload = (event) => {
                        const blob = xhr.response;
                    };
                    xhr.open('GET', url);
                    xhr.send();

                    let article = document.createElement("article")
                    LessonProjectsDiv.insertAdjacentElement("beforeend", article)
                    article.classList.add("projectCard")
                    article.innerHTML = `
                        <img src="${url}" alt="cover" class="projectCard__cover">
                        <div class="projectCard__imgMask">                            
                            <p class="projectCard__title">${doc.data().lessonTitle}</p>
                            <span class="projectCard__span" ${signatureToAcess == 1 ? `style="background: #0d8a4f;"` : `style="background: var(--primary-color);"`}>${signatureToAcess == 1 ? "Grátis" : "Assinatura"}</span>
                        </div>
                    `
                })
                .catch((error) => {
                    // Handle any errors
                });
        });
    })
}


async function loadComponents() {
    actualUserData().then(async (UserData) => {
        let LessonComponentsDiv = document.getElementById("LessonComponentsDiv")
        let q = query(collection(db, "lessons"), where("lessonCategory", "==", "Componente"));
        let querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            let acess = false
            let signatureToAcess
            doc.data().lessonClass.forEach(element => {
                if (element == UserData.class.replace("°", "")) {
                    acess = true
                    signatureToAcess = 1
                }
            });
            if (acess == false) {
                doc.data().lessonClass.forEach(element => {
                    if (element == "Extra") {
                        signatureToAcess = 3
                    }
                })
            }
            if (signatureToAcess != 1 && signatureToAcess != 3) {
                signatureToAcess = 2
            }
            getDownloadURL(ref(storage, `lessons/${doc.id}/mask`))
                .then((url) => {
                    const xhr = new XMLHttpRequest();
                    xhr.responseType = 'blob';
                    xhr.onload = (event) => {
                        const blob = xhr.response;
                    };
                    xhr.open('GET', url);
                    xhr.send();

                    let article = document.createElement("article")
                    LessonComponentsDiv.insertAdjacentElement("beforeend", article)
                    article.classList.add("projectCard")
                    article.innerHTML = `
                        <img src="${url}" alt="cover" class="projectCard__cover">
                        <div class="projectCard__imgMask">                            
                            <p class="projectCard__title">${doc.data().lessonTitle}</p>
                            <span class="projectCard__span" ${signatureToAcess == 1 ? `style="background: #0d8a4f;"` : `style="background: var(--primary-color);"`}>${signatureToAcess == 1 ? "Grátis" : "Assinatura"}</span>
                        </div>
                    `
                })
                .catch((error) => {
                    // Handle any errors
                });
        });
    })
}

async function loadCircuits() {
    actualUserData().then(async (UserData) => {
        let LessonCircuitsDiv = document.getElementById("LessonCircuitsDiv")
        let q = query(collection(db, "lessons"), where("lessonCategory", "==", "Circuito"));
        let querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            let acess = false
            let signatureToAcess
            doc.data().lessonClass.forEach(element => {
                if (element == UserData.class.replace("°", "")) {
                    acess = true
                    signatureToAcess = 1
                }
            });
            if (acess == false) {
                doc.data().lessonClass.forEach(element => {
                    if (element == "Extra") {
                        signatureToAcess = 3
                    }
                })
            }
            if (signatureToAcess != 1 && signatureToAcess != 3) {
                signatureToAcess = 2
            }
            getDownloadURL(ref(storage, `lessons/${doc.id}/mask`))
                .then((url) => {
                    const xhr = new XMLHttpRequest();
                    xhr.responseType = 'blob';
                    xhr.onload = (event) => {
                        const blob = xhr.response;
                    };
                    xhr.open('GET', url);
                    xhr.send();

                    let article = document.createElement("article")
                    LessonCircuitsDiv.insertAdjacentElement("beforeend", article)
                    article.classList.add("projectCard")
                    article.innerHTML = `
                        <img src="${url}" alt="cover" class="projectCard__cover">
                        <div class="projectCard__imgMask">                            
                            <p class="projectCard__title">${doc.data().lessonTitle}</p>
                            <span class="projectCard__span" ${signatureToAcess == 1 ? `style="background: #0d8a4f;"` : `style="background: var(--primary-color);"`}>${signatureToAcess == 1 ? "Grátis" : "Assinatura"}</span>
                        </div>
                    `
                })
                .catch((error) => {
                    // Handle any errors
                });
        });
    })
}
loadProjects()
loadComponents()
loadCircuits()