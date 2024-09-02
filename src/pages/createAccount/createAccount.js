import { alertThis } from "../../components/alerts/alert"
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot, addDoc, collection, query, where, getDocs, serverTimestamp, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadString, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
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

let createAccountBtn = document.getElementById("createAccountBtn")
let body = document.querySelector("body")
let manageUsersDiv = document.getElementById("manageUsersDiv")
let manageUsersDataDiv = document.getElementById("manageUsersDataDiv")
let closeManageUsersData = document.getElementById("closeManageUsersData")

closeManageUsersData.onclick = () => {
  manageUsersDataDiv.style.opacity = "0"
  setTimeout(() => {    
    manageUsersDataDiv.style.display = "none"
  }, 500);
}

createAccountBtn.onclick = function () {
  let createAccountClass = document.getElementById("createAccountClass").value
  let createAccountPassword = document.getElementById("createAccountPassword").value
  let createAccountEmail = document.getElementById("createAccountEmail").value.toLowerCase()
  let createAccountName = document.getElementById("createAccountName").value
  let createAccountRoom = document.getElementById("createAccountRoom").value
  createAccountBtn.disabled = true
  if (createAccountClass != "" && createAccountPassword != "" && createAccountEmail != "" && createAccountName != "" && createAccountRoom != "") {
    registerAccount(createAccountClass, createAccountPassword, createAccountEmail, createAccountName, createAccountRoom)
  } else {
    createAccountBtn.disabled = false
    alertThis("Preencha todos os campos", "error")
  }
}

async function registerAccount(createAccountClass, createAccountPassword, createAccountEmail, createAccountName, createAccountRoom) {
  await setDoc(doc(db, "users", `${createAccountEmail}`), {
    name: `${createAccountName}`,
    class: `${createAccountClass}`,
    temporaryPassword: `${createAccountPassword}`,
    room: `${createAccountRoom}`,
    signature: `basic`,
    points: 0,
    email: `${createAccountEmail}`,
    firstUse: true,
    noPhoto: true,
    noCover: true
  });
  document.getElementById("createAccountPassword").value = ""
  document.getElementById("createAccountEmail").value = ""
  document.getElementById("createAccountName").value = ""
  alertThis("Conta criada", "sucess")
  createAccountBtn.disabled = false
}

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const uid = user.uid;
    manageUsersDiv.innerHTML = ""
    actualUserData().then(async (userData) => {
      if (userData.admin == true) {
        const querySnapshot = await getDocs(collection(db, "users"));
        querySnapshot.forEach((doc) => {
          let article = document.createElement("article")
          manageUsersDiv.insertAdjacentElement("beforeend", article)
          article.classList.add("manageUsersCard")
          article.innerHTML = `
            <img class="manageUsersCard__img" src="" alt="">
            <div class="manageUsersCard__div">
              <p class="manageUsersCard__name">${doc.data().name}</p>
              <p class="manageUsersCard__email">${doc.data().email}</p>
            </div>`
          if (doc.data().noPhoto == true) {
            article.children[0].src = "https://img.freepik.com/vetores-gratis/ilustracao-do-icone-da-lampada_53876-43730.jpg?w=740&t=st=1705192551~exp=1705193151~hmac=3347369c888609a6def2a1cd13bfb02dc519c8fbc965419dd1b5f091ef79982d"
          } else {
            getDownloadURL(ref(storage, `users/${doc.data().email}/photo`))
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
          article.onclick = () => {
            manageUsersDataDiv.style.display = "flex"
            setTimeout(() => {
              manageUsersDataDiv.style.opacity = "1"
            }, 1);
            document.getElementById("manageUsersDataClass").value = `${doc.data().class}`
            document.getElementById("manageUsersDataRoom").value = `${doc.data().room}`
            document.getElementById("manageUsersDataPoints").value = `${doc.data().points}`
            document.getElementById("manageUsersDataEmail").value = `${doc.data().email}`
            document.getElementById("manageUsersDataName").value = `${doc.data().name}`
            document.getElementById("manageUsersDataSignature").textContent = `${doc.data().signature}`
            document.getElementById("manageUsersDataPassword").value = ``
            if (doc.data().noPhoto == true) {
              document.getElementById("manageUsersDataPhoto").src = "https://img.freepik.com/vetores-gratis/ilustracao-do-icone-da-lampada_53876-43730.jpg?w=740&t=st=1705192551~exp=1705193151~hmac=3347369c888609a6def2a1cd13bfb02dc519c8fbc965419dd1b5f091ef79982d"
            } else {
              getDownloadURL(ref(storage, `users/${doc.data().email}/photo`))
                .then((url) => {
                  let xhr = new XMLHttpRequest();
                  xhr.responseType = 'blob';
                  xhr.onload = (event) => {
                    let blob = xhr.response;
                  };
                  xhr.open('GET', url);
                  xhr.send();
                  document.getElementById("manageUsersDataPhoto").src = `${url}`
                })
            }
          }
        });
      }
    })
  }
})