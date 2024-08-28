import { getComments, postComment, getThisComment } from "../../scripts/postGetcoments"
import { actualUserData, thisUserData, actualUserEmail } from "../../scripts/returnUserInfos"
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot, addDoc, collection, query, where, getDoc, getDocs, serverTimestamp, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadString, deleteObject, uploadBytesResumable, getDownloadURL, uploadBytes } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { activeLoading } from "../../components/uploadingSection/uploadingSection";
import { alertThis } from "../../components/alerts/alert";
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
        let q = query(collection(db, "challenges"), where("challengeTitle", "!=", ""));
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
            getDownloadURL(ref(storage, `challenges/${doc.id}/mask`))
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
                    const senderSnapshot = await getDocs(collection(db, "challenges", `${doc.id}`, "resolves"));
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
    actualUserEmail().then(actualUser => {
        verifySend(id, actualUser).then(async (isSended) => {
            challengeWindow.children[5].innerHTML = `Enviar
                <input type="file" name="sendChallengeFile" class="challengeWindow__fileInput" id="sendChallengeFile">`
            sendChallengeFile = document.getElementById("sendChallengeFile")
            challengeWindow.children[5].style.background = ""
            challengeWindow.children[5].style.boxShadow = ""
            challengeWindow.children[5].style.color = ""
            if (isSended == true) {
                challengeWindow.children[5].textContent = "Enviado"
                challengeWindow.children[5].style.background = "#20E3BB"
                challengeWindow.children[5].style.boxShadow = "0px 0px 6px #20E3BB"
                challengeWindow.children[5].style.color = "#fff"
            }
            challengeWindow.children[2].textContent = `${obj.challengeTitle}`
            challengeWindow.children[3].children[0].src = `${url}`
            challengeWindow.children[4].textContent = `${obj.challengeDescription}`
            challengeWindow.children[3].children[1].textContent = `+${obj.challengePoints} Pontos`
            loadComents(challengeWindow.children[7].children[0], obj, id, url)
            challengeWindow.children[7].children[1].children[0].children[2].onclick = function () {
                if (challengeWindow.children[7].children[1].children[0].children[1].value.replace(" ", "") != "") {
                    postComment("challenges", id, actualUser, challengeWindow.children[7].children[1].children[0].children[1].value).then(posted => {
                        challengeWindow.children[7].children[1].children[0].children[1].value = ""
                        unrefreshLoadComents(challengeWindow.children[7].children[0], obj, id, posted, url)
                    })
                }
            }
            sendChallengeFile.onchange = async function () {
                if (sendChallengeFile.files[0] != undefined) {
                    actualUserData().then(async (userData) => {
                        if (isSended == false) {
                            let uploadsCompleteds = 0
                            activeLoading(uploadsCompleteds)
                            await setDoc(doc(db, "challenges", `${id}`, "resolves", `${userData.email}`), {
                                senderEmail: `${userData.email}`,
                                senderName: `${userData.name}`,
                                senderClass: `${userData.class}`,
                                senderRoom: `${userData.room}`,
                                senderNoPhoto: `${userData.noPhoto}`
                            });
                            uploadsCompleteds = uploadsCompleteds + 50
                            activeLoading(uploadsCompleteds)
                            if (uploadsCompleteds == 100) {
                                challengeSended(challengeWindow.children[0])
                            }
                            if (sendChallengeFile.files[0] != undefined) {
                                const storageRef3 = ref(storage, `challengesResolveds/${id}/${userData.email}`);
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
        const docRef = doc(db, "challenges", `${challengeId}`, "resolves", `${email}`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            resolve(true)
        } else {
            resolve(false)
        }
    })
}

function loadComents(section, obj, id, url) {
    let photoUrl = ""
    actualUserEmail().then(actualUser => {
        section.innerHTML = ""
        getComments("challenges", `${id}`).then(coment => {
            coment.forEach(element => {
                thisUserData(element.email).then(UserData => {
                    if (UserData.noPhoto == true) {
                        photoUrl = "https://img.freepik.com/vetores-gratis/ilustracao-do-icone-da-lampada_53876-43730.jpg?w=740&t=st=1705192551~exp=1705193151~hmac=3347369c888609a6def2a1cd13bfb02dc519c8fbc965419dd1b5f091ef79982d"
                    } else {

                    }
                    let article = document.createElement("article")
                    section.insertAdjacentElement("beforeend", article)
                    article.classList.add(`${element.email == actualUser ? "actualUser" : "otherUser"}`)
                    article.classList.add(`commentCard`)
                    article.innerHTML = `
                <div class="commentCard__div--1">
                    <div class="commentCard__resetPhoto">
                        <img class="commentCard__photo" src="${photoUrl}">
                    </div>
                    <p class="commentCard__dateTime">${element.date}<br>${element.time}</p>
                </div>
                <div class="commentCard__div--2">
                    <p class="commentCard__name">${element.email == actualUser ? "" : `<span class="commentCard__clasRoom">${UserData.class}${UserData.room}</span>`}${UserData.name}</p>
                    <div class="commentCard__resetText">
                        <p class="commentCard__text">${element.text}</p>
                    </div>
                </div>`
                    article.style.order = `${element.timestamp.seconds}`

                });
            })
        })
    })
}

function unrefreshLoadComents(section, obj, id, postId, url) {
    let photoUrl = ""
    actualUserEmail().then(actualUser => {
        getThisComment("challenges", id, postId).then(element => {
            thisUserData(element.email).then(UserData => {
                if (UserData.noPhoto == true) {
                    photoUrl = "https://img.freepik.com/vetores-gratis/ilustracao-do-icone-da-lampada_53876-43730.jpg?w=740&t=st=1705192551~exp=1705193151~hmac=3347369c888609a6def2a1cd13bfb02dc519c8fbc965419dd1b5f091ef79982d"
                } else {

                }
                let article = document.createElement("article")
                section.insertAdjacentElement("beforeend", article)
                article.classList.add(`${element.email == actualUser ? "actualUser" : "otherUser"}`)
                article.classList.add(`commentCard`)
                article.innerHTML = `
                    <div class="commentCard__div--1">
                        <div class="commentCard__resetPhoto">
                            <img class="commentCard__photo" src="${photoUrl}">
                        </div>
                        <p class="commentCard__dateTime">${element.date}<br>${element.time}</p>
                    </div>
                    <div class="commentCard__div--2">
                        <p class="commentCard__name">${element.email == actualUser ? "" : `<span class="commentCard__clasRoom">${UserData.class}${UserData.room}</span>`}${UserData.name}</p>
                        <div class="commentCard__resetText">
                            <p class="commentCard__text">${element.text}</p>
                        </div>
                    </div>`
                article.style.order = `${element.timestamp.seconds}`
            });
        })
    })
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        const uid = user.uid;
        loadChallenges()
    }
});