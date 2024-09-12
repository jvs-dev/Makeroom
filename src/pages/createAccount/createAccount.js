import { alertThis } from "../../components/alerts/alert"
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, updateDoc, onSnapshot, addDoc, collection, query, where, getDocs, serverTimestamp, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadString, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { actualUserData } from "../../scripts/returnUserInfos";
import { activeLoading } from "../../components/uploadingSection/uploadingSection";
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
let manageUsersAlterData = document.getElementById("manageUsersAlterData")
let manageUsersDeleteData = document.getElementById("manageUsersDeleteData")
let manageUsersDataPhotoInput = document.getElementById("manageUsersDataPhotoInput")


manageUsersDataPhotoInput.onchange = function () {
  if (manageUsersDataPhotoInput.files && manageUsersDataPhotoInput.files[0]) {
    let reader = new FileReader();
    reader.onload = function (e) {
      document.getElementById("manageUsersDataPhoto").src = e.target.result;
    }
    reader.readAsDataURL(manageUsersDataPhotoInput.files[0]);
  }
}


closeManageUsersData.onclick = () => {
  manageUsersDataDiv.style.opacity = "0"
  setTimeout(() => {
    manageUsersDataDiv.style.display = "none"
  }, 500);
}

async function verifyUserEmailExists(newEmail) {
  return new Promise(async (resolve) => {
    let userExists = false
    const querySnapshot = await getDocs(collection(db, "users"));
    querySnapshot.forEach((usersData) => {
      if (usersData.data().email == newEmail) {
        userExists = true
      }
    })
    resolve(userExists)
  })
}

createAccountBtn.onclick = function () {
  let createAccountClass = document.getElementById("createAccountClass").value
  let createAccountPassword = document.getElementById("createAccountPassword").value
  let createAccountEmail = document.getElementById("createAccountEmail").value.toLowerCase()
  let createAccountName = document.getElementById("createAccountName").value
  let createAccountRoom = document.getElementById("createAccountRoom").value
  createAccountBtn.disabled = true
  if (createAccountClass != "" && createAccountPassword != "" && createAccountEmail != "" && createAccountName != "" && createAccountRoom != "") {
    verifyUserEmailExists(createAccountEmail).then(userExists => {
      if (userExists == false) {
        registerAccount(createAccountClass, createAccountPassword, createAccountEmail, createAccountName, createAccountRoom)
      } else {
        createAccountBtn.disabled = false
        alertThis("Este email já existe", "error")
      }
    })
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
        querySnapshot.forEach((usersData) => {
          let article = document.createElement("article")
          manageUsersDiv.insertAdjacentElement("beforeend", article)
          article.classList.add("manageUsersCard")
          article.innerHTML = `
            <img class="manageUsersCard__img" src="" alt="">
            <div class="manageUsersCard__div">
              <p class="manageUsersCard__name">${usersData.data().name}</p>
              <p class="manageUsersCard__email">${usersData.data().email}</p>
            </div>`
          if (usersData.data().noPhoto == true) {
            article.children[0].src = "https://img.freepik.com/vetores-gratis/ilustracao-do-icone-da-lampada_53876-43730.jpg?w=740&t=st=1705192551~exp=1705193151~hmac=3347369c888609a6def2a1cd13bfb02dc519c8fbc965419dd1b5f091ef79982d"
          } else {
            getDownloadURL(ref(storage, `users/${usersData.data().email}/photo`))
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
            document.getElementById("manageUsersDataClass").value = `${usersData.data().class}`
            document.getElementById("manageUsersDataRoom").value = `${usersData.data().room}`
            document.getElementById("manageUsersDataPoints").value = `${usersData.data().points}`
            document.getElementById("manageUsersDataEmail").value = `${usersData.data().email}`
            document.getElementById("manageUsersDataName").value = `${usersData.data().name}`
            document.getElementById("manageUsersDataSignature").textContent = `${usersData.data().signature}`
            document.getElementById("manageUsersDataPassword").value = ``
            if (usersData.data().noPhoto == true) {
              document.getElementById("manageUsersDataPhoto").src = "https://img.freepik.com/vetores-gratis/ilustracao-do-icone-da-lampada_53876-43730.jpg?w=740&t=st=1705192551~exp=1705193151~hmac=3347369c888609a6def2a1cd13bfb02dc519c8fbc965419dd1b5f091ef79982d"
            } else {
              getDownloadURL(ref(storage, `users/${usersData.data().email}/photo`))
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
            manageUsersDeleteData.onclick = async () => {
              let uploadsCompleteds = 0
              activeLoading(uploadsCompleteds)
              if (usersData.data().noPhoto == false) {
                const desertRef = ref(storage, `users/${usersData.data().email}/photo`);
                deleteObject(desertRef).then(() => {
                  uploadsCompleteds = uploadsCompleteds + 50
                  activeLoading(uploadsCompleteds)
                  if (uploadsCompleteds == 100) {
                    alertThis("Conta apagada com sucesso", "sucess")
                    manageUsersDataDiv.style.opacity = "0"
                    setTimeout(() => {
                      manageUsersDataDiv.style.display = "none"
                    }, 500);
                  }
                })
              } else {
                uploadsCompleteds = uploadsCompleteds + 50
                activeLoading(uploadsCompleteds)
                if (uploadsCompleteds == 100) {
                  alertThis("Conta apagada com sucesso", "sucess")
                  manageUsersDataDiv.style.opacity = "0"
                  setTimeout(() => {
                    manageUsersDataDiv.style.display = "none"
                  }, 500);
                }
              }
              await deleteDoc(doc(db, "users", `${usersData.data().email}`));
              uploadsCompleteds = uploadsCompleteds + 50
              activeLoading(uploadsCompleteds)
              if (uploadsCompleteds == 100) {
                alertThis("Conta apagada com sucesso", "sucess")
                manageUsersDataDiv.style.opacity = "0"
                setTimeout(() => {
                  manageUsersDataDiv.style.display = "none"
                }, 500);
              }
            }
            manageUsersAlterData.onclick = async () => {
              let noPhotoExists = true
              let uploadsCompleteds = 0
              activeLoading(uploadsCompleteds)
              if (article.children[0].src == "https://img.freepik.com/vetores-gratis/ilustracao-do-icone-da-lampada_53876-43730.jpg?w=740&t=st=1705192551~exp=1705193151~hmac=3347369c888609a6def2a1cd13bfb02dc519c8fbc965419dd1b5f091ef79982d") {
                noPhotoExists = true
                uploadsCompleteds = uploadsCompleteds + 50
                if (uploadsCompleteds == 100) {
                  alertThis("Dados alterados com sucesso", "sucess")
                }
              } else {
                noPhotoExists = false
              }
              const washingtonRef = doc(db, "users", `${usersData.data().email}`);
              await updateDoc(washingtonRef, {
                class: `${document.getElementById("manageUsersDataClass").value.replace(/°/g, '')}°`,
                email: `${document.getElementById("manageUsersDataEmail").value}`,
                name: `${document.getElementById("manageUsersDataName").value}`,
                noPhoto: noPhotoExists,
                points: Number(document.getElementById("manageUsersDataPoints").value),
                room: `${document.getElementById("manageUsersDataRoom").value}`,
                signature: `${document.getElementById("manageUsersDataSignature").textContent}`,
              });
              uploadsCompleteds = uploadsCompleteds + 50
              if (uploadsCompleteds == 100) {
                alertThis("Dados alterados com sucesso", "sucess")
                manageUsersDataDiv.style.opacity = "0"
                setTimeout(() => {
                  manageUsersDataDiv.style.display = "none"
                }, 500);
              }
              activeLoading(uploadsCompleteds)
              if (noPhotoExists == false) {
                if (`${document.getElementById("manageUsersDataPhoto").src}`.includes("https://firebasestorage") == false) {
                  let storageRef = ref(storage, `users/${usersData.data().email}/photo`);
                  uploadString(storageRef, `${document.getElementById("manageUsersDataPhoto").src}`, 'data_url').then(async (snapshot) => {
                    uploadsCompleteds = uploadsCompleteds + 50
                    if (uploadsCompleteds == 100) {
                      alertThis("Dados alterados com sucesso", "sucess")
                      manageUsersDataDiv.style.opacity = "0"
                      setTimeout(() => {
                        manageUsersDataDiv.style.display = "none"
                      }, 500);
                    }
                    activeLoading(uploadsCompleteds)
                  });
                } else {
                  uploadsCompleteds = uploadsCompleteds + 50
                  if (uploadsCompleteds == 100) {
                    alertThis("Dados alterados com sucesso", "sucess")
                    manageUsersDataDiv.style.opacity = "0"
                    setTimeout(() => {
                      manageUsersDataDiv.style.display = "none"
                    }, 500);
                  }
                  activeLoading(uploadsCompleteds)
                }
              }
            }
          }
        });
      }
    })
  }
})