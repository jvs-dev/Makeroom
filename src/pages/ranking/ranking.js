import { actualUserData, thisUserData, actualUserEmail } from "../../scripts/returnUserInfos"
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot, addDoc, collection, query, where, getDoc, getDocs, serverTimestamp, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
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
let firstsDiv = document.getElementById("firstsDiv")
let rankOuthersDiv = document.getElementById("rankOuthersDiv")


onAuthStateChanged(auth, async (user) => {
    if (user) {
        const uid = user.uid;
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
            noCover: user.noCover,
            noPhoto: user.noPhoto,
            points: user.points
        }));
        firstsDiv.innerHTML = ""
        rankOuthersDiv.innerHTML = ""
        for (let index = 0; index < 3; index++) {
            let photoUrl = ""
            let coverUrl = ""
            if (rankedUsers[index].noPhoto == true) {
                photoUrl = "https://img.freepik.com/vetores-gratis/ilustracao-do-icone-da-lampada_53876-43730.jpg?w=740&t=st=1705192551~exp=1705193151~hmac=3347369c888609a6def2a1cd13bfb02dc519c8fbc965419dd1b5f091ef79982d"
            }
            if (rankedUsers[index].noCover == true) {
                coverUrl = "https://images.pexels.com/photos/7869091/pexels-photo-7869091.jpeg?auto=compress&cs=tinysrgb&w=600"
            }
            firstsDiv.insertAdjacentHTML("beforeend", `
                <article class="rank__firstsArticle">
                    <img class="rank__firstsArticle__img"
                        src="${photoUrl}"
                        alt="">
                    <p class="rank__firstsArticle__name">${rankedUsers[index].name}</p>
                    <p class="rank__firstsArticle__points">${rankedUsers[index].points} pontos</p>
                    <span class="rank__firstsArticle__position position${rankedUsers[index].rankPosition}">#${rankedUsers[index].rankPosition}</span>
                </article>
            `)
        }
        actualUserData().then(actualUser => {
            let photoUrl = ""
            let coverUrl = ""
            if (actualUser.noPhoto == true) {
                photoUrl = "https://img.freepik.com/vetores-gratis/ilustracao-do-icone-da-lampada_53876-43730.jpg?w=740&t=st=1705192551~exp=1705193151~hmac=3347369c888609a6def2a1cd13bfb02dc519c8fbc965419dd1b5f091ef79982d"
            }
            if (actualUser.noCover == true) {
                coverUrl = "https://images.pexels.com/photos/7869091/pexels-photo-7869091.jpeg?auto=compress&cs=tinysrgb&w=600"
            }
            document.getElementById("rankCardYouPhoto").src = `${photoUrl}`
            document.getElementById("rankCardYouPoints").innerHTML = `${actualUser.points} Pontos`
            rankedUsers.forEach(element => {
                if (element.email == actualUser.email) {
                    document.getElementById("rankCardYouPosition").innerHTML = `#${element.rankPosition}`
                }
            });
        })
        rankedUsers.forEach(element => {
            if (element.rankPosition > 3) {
                let photoUrl = ""
                let coverUrl = ""
                if (element.noPhoto == true) {
                    photoUrl = "https://img.freepik.com/vetores-gratis/ilustracao-do-icone-da-lampada_53876-43730.jpg?w=740&t=st=1705192551~exp=1705193151~hmac=3347369c888609a6def2a1cd13bfb02dc519c8fbc965419dd1b5f091ef79982d"
                }
                if (element.noCover == true) {
                    coverUrl = "https://images.pexels.com/photos/7869091/pexels-photo-7869091.jpeg?auto=compress&cs=tinysrgb&w=600"
                }
                rankOuthersDiv.insertAdjacentHTML("beforeend", `
                    <article class="rankOuthersCard">
                        <img class="rankOuthersCard__img"
                            src="${photoUrl}"
                            alt="">
                        <div class="rankOuthersCard__div">
                            <p class="rankOuthersCard__name">${element.name}</p>
                            <p class="rankOuthersCard__points">${element.points} pontos</p>
                        </div>
                        <span class="rankOuthersCard__position">#${element.rankPosition}</span>
                    </article>
                `)
            }
        });
        console.log(rankedUsers);
    }
})