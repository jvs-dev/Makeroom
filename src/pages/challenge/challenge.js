import { postComment, getThisComment } from "../../scripts/postGetcoments"
import { actualUserData, thisUserData, actualUserEmail } from "../../scripts/returnUserInfos"
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot, addDoc, collection, query, where, getDoc, getDocs, serverTimestamp, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadString, deleteObject, uploadBytesResumable, getDownloadURL, uploadBytes } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { activeLoading } from "../../components/uploadingSection/uploadingSection";
import { alertThis } from "../../components/alerts/alert";
import { activeConfirmSection } from "../../components/confirmSection/confirmSection";
import { deleteAllFiles, deleteAllsubDocs, deleteFiles, deleteThis } from "../../scripts/deleteThis";
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
let challengeWindow = document.getElementById("challengeWindow")
let closeChallengeWindow = document.getElementById("closeChallengeWindow")
let challengeSection = document.getElementById("challengeSection")
let sendChallengeFile = document.getElementById("sendChallengeFile")
let deleteChallange = document.getElementById("deleteChallange")

closeChallengeWindow.onclick = () => {
    challengeSection.style.display = "flex"
    challengeWindow.style.display = "none"
}

async function loadChallenges() {
    actualUserData().then(async (UserData) => {
        let challengesDiv1 = document.getElementById("challengesDiv1")
        let challengesDiv2 = document.getElementById("challengesDiv2")
        let challengesDiv3 = document.getElementById("challengesDiv3")
        let challengesDiv4 = document.getElementById("challengesDiv4")
        let challengesDiv5 = document.getElementById("challengesDiv5")
        let challengesDiv6 = document.getElementById("challengesDiv6")
        let challengesDiv7 = document.getElementById("challengesDiv7")
        challengesDiv1.innerHTML = ""
        challengesDiv2.innerHTML = ""
        challengesDiv3.innerHTML = ""
        challengesDiv4.innerHTML = ""
        challengesDiv5.innerHTML = ""
        challengesDiv6.innerHTML = ""
        challengesDiv7.innerHTML = ""
        /* let challengesDivExtra = document.getElementById("challengesDivExtra") */
        let q = query(collection(db, `${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_challenges`), where("challengeTitle", "!=", ""));
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
            getDownloadURL(ref(storage, `${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_challenges/${doc.id}/mask`))
                .then(async (url) => {
                    const xhr = new XMLHttpRequest();
                    xhr.responseType = 'blob';
                    xhr.onload = (event) => {
                        const blob = xhr.response;
                    };
                    xhr.open('GET', url);
                    xhr.send();

                    let article = document.createElement("article")
                    doc.data().challengeClass.forEach(element => {
                        switch (element) {
                            case "1":
                                challengesDiv1.insertAdjacentElement("beforeend", article)
                                break;
                            case "2":
                                challengesDiv2.insertAdjacentElement("beforeend", article)
                                break;
                            case "3":
                                challengesDiv3.insertAdjacentElement("beforeend", article)
                                break;
                            case "4":
                                challengesDiv4.insertAdjacentElement("beforeend", article)
                                break;
                            case "5":
                                challengesDiv5.insertAdjacentElement("beforeend", article)
                                break;
                            case "6":
                                challengesDiv6.insertAdjacentElement("beforeend", article)
                                break;
                            case "7":
                                challengesDiv7.insertAdjacentElement("beforeend", article)
                                break;
                            /* case "Extra":
                                challengesDivExtra.insertAdjacentElement("beforeend", article)
                                break; */
                            default:
                                break;
                        }
                    });
                    let sendersImages = []
                    const senderSnapshot = await getDocs(collection(db, `${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_challenges`, `${doc.id}`, "resolves"));
                    senderSnapshot.forEach((senderDoc) => {
                        if (senderDoc.data().senderNoPhoto == true) {
                            sendersImages.push(`https://img.freepik.com/vetores-gratis/ilustracao-do-icone-da-lampada_53876-43730.jpg?w=740&t=st=1705192551~exp=1705193151~hmac=3347369c888609a6def2a1cd13bfb02dc519c8fbc965419dd1b5f091ef79982d`)
                        } else {
                            sendersImages.push(`https://img.freepik.com/vetores-gratis/ilustracao-do-icone-da-lampada_53876-43730.jpg?w=740&t=st=1705192551~exp=1705193151~hmac=3347369c888609a6def2a1cd13bfb02dc519c8fbc965419dd1b5f091ef79982d`)
                        }
                    });
                    article.classList.add("challengeCard")
                    article.innerHTML = `
                        <div class="challengeCard__div--1">
                            <p class="challengeCard__title">${doc.data().challengeTitle}</p>
                            <div class="challengeCard__div--2">                                
                                <div class="challengeCard__mask"></div>
                                <img src="${url}" class="challengeCard__cover">
                            </div>
                            <span class="challengeCard__points">+${doc.data().challengePoints} pontos</span>
                        </div>                        
                        <p class="challengeCard__resolved">Já resolveram esse desafio:</p>
                        <div class="challengeCard__resolvedDiv" ${sendersImages.length > 3 ? `` : `style="justify-content: flex-start; gap: 12px;"`}>
                            ${sendersImages.length > 0 ? `${sendersImages.length > 3 ? `${sendersImages.map(element => `<img src="${element}" class="challengeCard__resolvedImage">`).join('')}<span class="challengeCard__resolvedSpan">+10</span>` : sendersImages.map(element => `<img src="${element}" class="challengeCard__resolvedImage">`).join('')}` : `<p class="challengeCard__resolveText">Seja o primeiro a resolver!</p>`}                            
                        </div>
                        <div class="challengeCard__div--3">
                            <p class="challengeCard__description">${doc.data().challengeDescription}</p>
                            <button class="challengeCard__play"><i class="bi bi-play"></i></button>
                        </div>
                    `
                    article.children[3].children[1].onclick = () => {
                        ChallengeWindowData(doc.data(), doc.id, url)
                    }

                    /* if (challengesDivExtra.children[0] == undefined) {
                        challengesDivExtra.previousElementSibling.style.display = "none"
                        challengesDivExtra.style.display = "none"
                    } else {
                        challengesDivExtra.previousElementSibling.style.display = ""
                        challengesDivExtra.style.display = ""
                    }; */

                    if (challengesDiv1.children[0] == undefined) {
                        challengesDiv1.previousElementSibling.style.display = "none"
                        challengesDiv1.style.display = "none"
                    } else {
                        challengesDiv1.previousElementSibling.style.display = ""
                        challengesDiv1.style.display = ""
                    };

                    if (challengesDiv2.children[0] == undefined) {
                        challengesDiv2.previousElementSibling.style.display = "none"
                        challengesDiv2.style.display = "none"
                    } else {
                        challengesDiv2.previousElementSibling.style.display = ""
                        challengesDiv2.style.display = ""
                    };

                    if (challengesDiv3.children[0] == undefined) {
                        challengesDiv3.previousElementSibling.style.display = "none"
                        challengesDiv3.style.display = "none"
                    } else {
                        challengesDiv3.previousElementSibling.style.display = ""
                        challengesDiv3.style.display = ""
                    };

                    if (challengesDiv4.children[0] == undefined) {
                        challengesDiv4.previousElementSibling.style.display = "none"
                        challengesDiv4.style.display = "none"
                    } else {
                        challengesDiv4.previousElementSibling.style.display = ""
                        challengesDiv4.style.display = ""
                    };

                    if (challengesDiv5.children[0] == undefined) {
                        challengesDiv5.previousElementSibling.style.display = "none"
                        challengesDiv5.style.display = "none"
                    } else {
                        challengesDiv5.previousElementSibling.style.display = ""
                        challengesDiv5.style.display = ""
                    };

                    if (challengesDiv6.children[0] == undefined) {
                        challengesDiv6.previousElementSibling.style.display = "none"
                        challengesDiv6.style.display = "none"
                    } else {
                        challengesDiv6.previousElementSibling.style.display = ""
                        challengesDiv6.style.display = ""
                    };

                    if (challengesDiv7.children[0] == undefined) {
                        challengesDiv7.previousElementSibling.style.display = "none"
                        challengesDiv7.style.display = "none"
                    } else {
                        challengesDiv7.previousElementSibling.style.display = ""
                        challengesDiv7.style.display = ""
                    };
                })
                .catch((error) => {
                    // Handle any errors
                });
        });
    })
}

function ChallengeWindowData(obj, id, url) {
    actualUserData().then(userData => {
        if (userData.admin == true) {
            deleteChallange.style.display = ""
            deleteChallange.onclick = () => {
                activeConfirmSection("Deseja excluir este desafio?", "Esta ação não poderá ser desfeita", "#f00", "sad").then(res => {
                    if (res == "confirmed") {
                        let uploadsCompleteds = 0
                        activeLoading(uploadsCompleteds)
                        deleteThis(`${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_challenges`, `${id}`).then(res => {
                            uploadsCompleteds = uploadsCompleteds + 20
                            activeLoading(uploadsCompleteds)
                            if (uploadsCompleteds == 100) {
                                alertThis("Desafio deletado com sucesso", "sucess")
                            }
                        })
                        deleteAllsubDocs(`${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_challenges`, `${id}`, "coments").then(res => {
                            uploadsCompleteds = uploadsCompleteds + 20
                            activeLoading(uploadsCompleteds)
                            if (uploadsCompleteds == 100) {
                                alertThis("Desafio deletado com sucesso", "sucess")
                            }
                        })
                        deleteAllsubDocs(`${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_challenges`, `${id}`, "resolves").then(res => {
                            uploadsCompleteds = uploadsCompleteds + 20
                            activeLoading(uploadsCompleteds)
                            if (uploadsCompleteds == 100) {
                                alertThis("Desafio deletado com sucesso", "sucess")
                            }
                        })
                        deleteFiles(`challenges/${id}/mask`).then(() => {
                            uploadsCompleteds = uploadsCompleteds + 20
                            activeLoading(uploadsCompleteds)
                            if (uploadsCompleteds == 100) {
                                alertThis("Desafio deletado com sucesso", "sucess")
                            }
                        })
                        deleteAllFiles(`challengesResolveds/${id}`).then(() => {
                            uploadsCompleteds = uploadsCompleteds + 20
                            activeLoading(uploadsCompleteds)
                            if (uploadsCompleteds == 100) {
                                alertThis("Desafio deletado com sucesso", "sucess")
                            }
                        })
                    }
                })
            }
        } else {
            deleteChallange.style.display = "none"
        }
    })
    actualUserEmail().then(actualUser => {
        verifySend(id, actualUser).then(async (isSended) => {
            challengeWindow.children[2].children[3].innerHTML = `Enviar
                <input type="file" name="sendChallengeFile" class="challengeWindow__fileInput" id="sendChallengeFile">`
            sendChallengeFile = document.getElementById("sendChallengeFile")
            challengeWindow.children[2].children[3].style.background = ""
            challengeWindow.children[2].children[3].style.boxShadow = ""
            challengeWindow.children[2].children[3].style.color = ""
            if (isSended == true) {
                challengeWindow.children[2].children[3].textContent = "Enviado"
                challengeWindow.children[2].children[3].style.background = "#20E3BB"
                challengeWindow.children[2].children[3].style.boxShadow = "0px 0px 6px #20E3BB"
                challengeWindow.children[2].children[3].style.color = "#fff"
            }
            challengeWindow.children[2].children[0].textContent = `${obj.challengeTitle}`
            challengeWindow.children[2].children[1].children[1].src = `${url}`
            challengeWindow.children[2].children[2].textContent = `${obj.challengeDescription}`
            challengeWindow.children[2].children[1].children[2].textContent = `+${obj.challengePoints} Pontos`
            loadComents(challengeWindow.children[3].children[1].children[0], obj, id, url)
            challengeWindow.children[3].children[1].children[1].children[0].children[2].onclick = function () {
                if (challengeWindow.children[3].children[1].children[1].children[0].children[1].value.replace(" ", "") != "") {
                    postComment(`${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_challenges`, id, actualUser, challengeWindow.children[3].children[1].children[1].children[0].children[1].value).then(posted => {
                        challengeWindow.children[3].children[1].children[1].children[0].children[1].value = ""
                    })
                }
            }
            sendChallengeFile.onchange = async function () {
                if (sendChallengeFile.files[0] != undefined) {
                    actualUserData().then(async (userData) => {
                        if (isSended == false) {
                            let uploadsCompleteds = 0
                            activeLoading(uploadsCompleteds)
                            const today = new Date();
                            const day = String(today.getDate()).padStart(2, '0');
                            const month = String(today.getMonth() + 1).padStart(2, '0');
                            const year = String(today.getFullYear()).slice(-2);
                            const formattedDate = `${day}/${month}/${year}`;
                            await setDoc(doc(db, `${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_challenges`, `${id}`, "resolves", `${userData.email}`), {
                                resolved: false,
                                senderEmail: `${userData.email}`,
                                senderName: `${userData.name}`,
                                senderClass: `${userData.class}`,
                                senderRoom: `${userData.room}`,
                                senderNoPhoto: `${userData.noPhoto}`,
                                sendDate: `${formattedDate}`
                            });
                            uploadsCompleteds = uploadsCompleteds + 50
                            activeLoading(uploadsCompleteds)
                            if (uploadsCompleteds == 100) {
                                challengeSended(challengeWindow.children[0])
                            }
                            if (sendChallengeFile.files[0] != undefined) {
                                const storageRef3 = ref(storage, `${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_challengesResolveds/${id}/${userData.email}`);
                                uploadBytes(storageRef3, sendChallengeFile.files[0]).then((snapshot) => {
                                    uploadsCompleteds = uploadsCompleteds + 50
                                    activeLoading(uploadsCompleteds)
                                    if (uploadsCompleteds == 100) {
                                        challengeSended(challengeWindow.children[0])
                                    }
                                });
                            }
                        } else {
                            alertThis("Atividade já enviada", "")
                        }
                    })
                }
            }
            challengeSection.style.display = "none"
            challengeWindow.style.display = "flex"
        })
    })
}

function challengeSended(section) {
    section.style.opacity = "0"
    section.style.transition = "0.5s"
    section.style.display = "flex"
    setTimeout(() => {
        section.style.opacity = "1"
    }, 400);
}

challengeWindow.children[0].children[0].children[3].onclick = () => {
    challengeWindow.children[5].textContent = "Enviado"
    challengeWindow.children[5].style.background = "#20E3BB"
    challengeWindow.children[5].style.boxShadow = "0px 0px 6px #20E3BB"
    challengeWindow.children[5].style.color = "#fff"
    challengeWindow.children[0].style.opacity = "0"
    setTimeout(() => {
        challengeWindow.children[0].style.transition = ""
        challengeWindow.children[0].style.display = ""
    }, 500);
}

async function verifySend(challengeId, email) {
    return new Promise(async (resolve) => {
        const docRef = doc(db, `${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_challenges`, `${challengeId}`, "resolves", `${email}`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            resolve(true)
        } else {
            resolve(false)
        }
    })
}

function loadComents(section, obj, id, url) {
    actualUserEmail().then(actualUser => {
        section.innerHTML = ""
        monitorCollectionUpdates(`${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_challenges/${id}/coments`, async (coment) => {
            coment.forEach(element => {
                if (element.timestamp != null) {
                    thisUserData(element.email).then(UserData => {
                        let article = document.createElement("article")
                        section.insertAdjacentElement("beforeend", article)
                        article.classList.add(`${element.email == actualUser ? "actualUser" : "otherUser"}`)
                        article.classList.add(`commentCard`)
                        article.innerHTML = `
                        <div class="commentCard__div--1">
                            <div class="commentCard__resetPhoto">
                                <img class="commentCard__photo" src="">
                            </div>
                            <p class="commentCard__dateTime">${element.date}<br>${element.time}</p>
                        </div>
                        <div class="commentCard__div--2">
                            <p class="commentCard__name">${element.email == actualUser ? "" : `<span class="commentCard__clasRoom">${UserData.class}${UserData.room}</span>`}${UserData.name}</p>
                            <div class="commentCard__resetText">
                                <p class="commentCard__text">${element.text}</p>
                            </div>
                        </div>`
                        if (UserData.noPhoto == true) {
                            article.children[0].children[0].children[0].src = "https://img.freepik.com/vetores-gratis/ilustracao-do-icone-da-lampada_53876-43730.jpg?w=740&t=st=1705192551~exp=1705193151~hmac=3347369c888609a6def2a1cd13bfb02dc519c8fbc965419dd1b5f091ef79982d"
                        } else {
                            getDownloadURL(ref(storage, `${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_users/${element.email}/photo`))
                                .then((url) => {
                                    let xhr = new XMLHttpRequest();
                                    xhr.responseType = 'blob';
                                    xhr.onload = (event) => {
                                        let blob = xhr.response;
                                    };
                                    xhr.open('GET', url);
                                    xhr.send();
                                    article.children[0].children[0].children[0].src = `${url}`
                                })
                        }
                        article.style.order = `${element.timestamp.seconds}`
                    });
                }
            })
        })
    })
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        const uid = user.uid;
        monitorCollectionUpdates(`${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_challenges`, (updatedData) => {
            loadChallenges()
        });
    }
});