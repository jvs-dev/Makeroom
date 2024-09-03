import { actualUserData, thisUserData, actualUserEmail } from "../../scripts/returnUserInfos"
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot, addDoc, collection, query, where, getDoc, getDocs, serverTimestamp, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadString, deleteObject, uploadBytesResumable, getDownloadURL, uploadBytes } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
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
let firstsDiv = document.getElementById("firstsDiv")
let rankOuthersDiv = document.getElementById("rankOuthersDiv")

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const uid = user.uid;
        monitorCollectionUpdates("users", async (updatedData) => {
            initRank(user)
        });
    }
})

async function initRank(user) {
    let usersArray = []
    const querySnapshot = await getDocs(collection(db, "users"));
    querySnapshot.forEach((doc) => {
        usersArray.push(doc.data())
    });
    const sortedUsers = usersArray.sort((a, b) => b.points - a.points);
    const rankedUsers = sortedUsers.map((user, index) => ({
        rankPosition: index + 1,
        email: user.email,
        name: user.name,
        noPhoto: user.noPhoto,
        points: user.points
    }));    
    firstsDiv.innerHTML = ""
    rankOuthersDiv.innerHTML = ""
    for (let index = 0; index < 3; index++) {
        let article = document.createElement("article")
        firstsDiv.insertAdjacentElement("beforeend", article)
        article.classList.add("rank__firstsArticle")
        article.innerHTML = `
                <img class="rank__firstsArticle__img" src="" alt="">
                <p class="rank__firstsArticle__name">${rankedUsers[index].name}</p>
                <p class="rank__firstsArticle__points">${rankedUsers[index].points} pontos</p>
                <span class="rank__firstsArticle__position position${rankedUsers[index].rankPosition}">#${rankedUsers[index].rankPosition}</span>                
            `
        if (rankedUsers[index].noPhoto == true) {
            article.children[0].src = "https://img.freepik.com/vetores-gratis/ilustracao-do-icone-da-lampada_53876-43730.jpg?w=740&t=st=1705192551~exp=1705193151~hmac=3347369c888609a6def2a1cd13bfb02dc519c8fbc965419dd1b5f091ef79982d"
        } else {
            getDownloadURL(ref(storage, `users/${rankedUsers[index].email}/photo`))
                .then((url) => {
                    let xhr = new XMLHttpRequest();
                    xhr.responseType = 'blob';
                    xhr.onload = (event) => {
                        let blob = xhr.response;
                    };
                    xhr.open('GET', url);
                    xhr.send();
                    article.children[0].src = `${url}`
                })
        }
    }
    actualUserData().then(actualUser => {
        if (actualUser.noPhoto == true) {
            document.getElementById("rankCardYouPhoto").src = "https://img.freepik.com/vetores-gratis/ilustracao-do-icone-da-lampada_53876-43730.jpg?w=740&t=st=1705192551~exp=1705193151~hmac=3347369c888609a6def2a1cd13bfb02dc519c8fbc965419dd1b5f091ef79982d"
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
                    document.getElementById("rankCardYouPhoto").src = `${url}`
                })
        }
        document.getElementById("rankCardYouPoints").innerHTML = `${actualUser.points} Pontos`
        rankedUsers.forEach(element => {
            if (element.email == actualUser.email) {
                document.getElementById("rankCardYouPosition").innerHTML = `#${element.rankPosition}`
            }
        });
    })
    rankedUsers.forEach(element => {
        if (element.rankPosition > 3) {
            let article = document.createElement("article")
            article.classList.add("rankOuthersCard")
            rankOuthersDiv.insertAdjacentElement("beforeend", article)
            article.innerHTML = `                    
                    <img class="rankOuthersCard__img" src="" alt="">
                    <div class="rankOuthersCard__div">
                        <p class="rankOuthersCard__name">${element.name}</p>
                        <p class="rankOuthersCard__points">${element.points} pontos</p>
                    </div>
                    <span class="rankOuthersCard__position">#${element.rankPosition}</span>                    
                `
            if (element.noPhoto == true) {
                article.children[0].src = "https://img.freepik.com/vetores-gratis/ilustracao-do-icone-da-lampada_53876-43730.jpg?w=740&t=st=1705192551~exp=1705193151~hmac=3347369c888609a6def2a1cd13bfb02dc519c8fbc965419dd1b5f091ef79982d"
            } else {
                getDownloadURL(ref(storage, `users/${element.email}/photo`))
                    .then((url) => {
                        let xhr = new XMLHttpRequest();
                        xhr.responseType = 'blob';
                        xhr.onload = (event) => {
                            let blob = xhr.response;
                        };
                        xhr.open('GET', url);
                        xhr.send();
                        article.children[0].src = `${url}`
                    })
            }
        }
    });
}