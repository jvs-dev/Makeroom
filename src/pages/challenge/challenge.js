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
                .then((url) => {
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
                        <div class="challengeCard__resolvedDiv">
                            <img src="https://images.pexels.com/photos/1068205/pexels-photo-1068205.jpeg?auto=compress&cs=tinysrgb&w=600" class="challengeCard__resolvedImage">
                            <img src="https://images.pexels.com/photos/1068205/pexels-photo-1068205.jpeg?auto=compress&cs=tinysrgb&w=600" class="challengeCard__resolvedImage">
                            <img src="https://images.pexels.com/photos/1068205/pexels-photo-1068205.jpeg?auto=compress&cs=tinysrgb&w=600" class="challengeCard__resolvedImage">
                            <img src="https://images.pexels.com/photos/1068205/pexels-photo-1068205.jpeg?auto=compress&cs=tinysrgb&w=600" class="challengeCard__resolvedImage">
                            <span class="challengeCard__resolvedSpan">+10</span>
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
        challengeWindow.children[1].textContent = `${obj.challengeTitle}`
        challengeWindow.children[2].children[0].src = `${url}`
        challengeWindow.children[3].textContent = `${obj.challengeDescription}`
        challengeWindow.children[2].children[1].textContent = `+${obj.challengePoints} Pontos`
        loadComents(challengeWindow.children[6].children[0], obj, id, url)
        challengeWindow.children[6].children[1].children[0].children[2].onclick = function () {
            if (challengeWindow.children[6].children[1].children[0].children[1].value.replace(" ", "") != "") {
                postComment("challenges", id, actualUser, challengeWindow.children[6].children[1].children[0].children[1].value).then(posted => {
                    challengeWindow.children[6].children[1].children[0].children[1].value = ""
                    unrefreshLoadComents(challengeWindow.children[6].children[0], obj, id, posted, url)
                })
            }
        }
        sendChallengeFile.onchange = async function () {
            if (sendChallengeFile.files[0] != undefined) {
                actualUserData().then(async (userData) => {
                    verifySend(id, userData.email).then(async (res) => {
                        if (res == false) {
                            let uploadsCompleteds = 0
                            activeLoading(uploadsCompleteds)
                            await setDoc(doc(db, "challenges", `${id}`, "resolves", `${userData.email}`), {
                                senderEmail: `${userData.email}`,
                                senderName: `${userData.name}`,
                                senderClass: `${userData.class}`,
                                senderRoom: `${userData.room}`
                            });
                            uploadsCompleteds = uploadsCompleteds + 50
                            activeLoading(uploadsCompleteds)
                            if (sendChallengeFile.files[0] != undefined) {
                                const storageRef3 = ref(storage, `challengesResolveds/${id}/${userData.email}`);
                                uploadBytes(storageRef3, sendChallengeFile.files[0]).then((snapshot) => {
                                    uploadsCompleteds = uploadsCompleteds + 50
                                    activeLoading(uploadsCompleteds)
                                });
                            }
                        } else {
                            alertThis("Atividade já enviada", "")
                        }
                    })
                })
            }
        }
        challengeSection.style.display = "none"
        challengeWindow.style.display = "flex"
    })
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