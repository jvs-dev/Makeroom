import { getComments, postComment, getThisComment } from "../../scripts/postGetcoments"
import { actualUserData, thisUserData, actualUserEmail } from "../../scripts/returnUserInfos"
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot, addDoc, collection, query, where, getDocs, serverTimestamp, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadString, deleteObject, uploadBytesResumable, getDownloadURL, uploadBytes } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { deleteThis } from "../../scripts/deleteThis";
import { alertThis } from "../../components/alerts/alert";
import { activeConfirmSection } from "../../components/confirmSection/confirmSection";
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

let lessonWindow = document.getElementById("lessonWindow")
let homeSection = document.getElementById("homeSection")
let closeLessonWindow = document.getElementById("closeLessonWindow")

closeLessonWindow.onclick = () => {
    homeSection.style.display = "flex"
    lessonWindow.style.display = "none"
    lessonWindow.children[2].src = ``
    lessonWindow.children[5].children[1].children[0].innerHTML = ""
}

async function loadLessons() {
    actualUserData().then(async (UserData) => {
        let LessonProjectsDiv = document.getElementById("LessonProjectsDiv")
        let LessonComponentsDiv = document.getElementById("LessonComponentsDiv")
        let LessonCircuitsDiv = document.getElementById("LessonCircuitsDiv")
        LessonProjectsDiv.innerHTML = ""
        LessonComponentsDiv.innerHTML = ""
        LessonCircuitsDiv.innerHTML = ""
        let q = query(collection(db, "lessons"), where("lessonCategory", "!=", ""));
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
                    switch (doc.data().lessonCategory) {
                        case "Projeto":
                            LessonProjectsDiv.insertAdjacentElement("beforeend", article)
                            break;
                        case "Componente":
                            LessonComponentsDiv.insertAdjacentElement("beforeend", article)
                            break;
                        case "Circuito":
                            LessonCircuitsDiv.insertAdjacentElement("beforeend", article)
                            break;
                    }
                    article.classList.add("projectCard")
                    article.innerHTML = `
                        ${UserData.admin == true ? `<button class="projectCard__deleteLesson" type="button"><ion-icon name="trash-outline"></ion-icon></button>` : ``}
                        <img src="${url}" alt="cover" class="projectCard__cover">
                        <div class="projectCard__imgMask">                            
                            <p class="projectCard__title">${doc.data().lessonTitle}</p>
                            <span class="projectCard__span" ${signatureToAcess == 1 ? `style="background: #0d8a4f;"` : `style="background: var(--primary-color);"`}>${signatureToAcess == 1 ? "Grátis" : "Assinatura"}</span>
                        </div>
                    `
                    article.onclick = () => {
                        loadLessonIntro(doc.data(), doc.id, url)
                    }
                    if (UserData.admin == true) {
                        article.children[0].onclick = (evt) => {
                            evt.stopPropagation()
                            activeConfirmSection("Deseja excluir esta aula?", "Esta ação não poderá ser desfeita", "#f00", "sad").then(res => {
                                if (res == "confirmed") {
                                    deleteThis("lessons", `${doc.id}`).then(res => {
                                        alertThis("Aula deletada com sucesso", "sucess")
                                    })
                                }
                            })
                        }
                    }
                })
                .catch((error) => {
                    // Handle any errors
                });
        });
    })
}

function getLessonVideo(id) {
    return new Promise(async resolve => {
        getDownloadURL(ref(storage, `lessons/${id}/video`))
            .then((url) => {
                const xhr = new XMLHttpRequest();
                xhr.responseType = 'blob';
                xhr.onload = (event) => {
                    const blob = xhr.response;
                };
                xhr.open('GET', url);
                xhr.send();
                resolve(url)
            })
            .catch((error) => {
                // Handle any errors
            });
    })
}

function loadLessonIntro(obj, id, url) {
    let pressTime;
    let backgroundAnimation;
    let i = 0
    let lessonIntroduction = document.getElementById("lessonIntroduction")
    lessonIntroduction.children[0].textContent = `${obj.lessonIntro}`
    lessonIntroduction.children[1].ontouchstart = function () {
        pressTime = setTimeout(() => {
            lessonIntroduction.children[1].style.background = `linear-gradient(0deg, var(--primary-color), var(--white) 0%)`
            i = 0
            lessonIntroduction.style.opacity = "0"
            lessonIntroduction.style.display = "none"
            clearTimeout(pressTime);
            clearInterval(backgroundAnimation)
            lessonWindowData(obj, id, url)
            lessonIntroduction.children[1].ontouchstart = function () { }
            lessonIntroduction.children[1].ontouchend = function () { }
        }, 3000);
        backgroundAnimation = setInterval(() => {
            i = i + 1.5
            lessonIntroduction.children[1].style.background = `linear-gradient(0deg, var(--primary-color), var(--white) ${i}%)`
        }, 20);
    }
    lessonIntroduction.children[1].ontouchend = function () {
        clearTimeout(pressTime);
        clearInterval(backgroundAnimation)
        lessonIntroduction.children[1].style.background = `linear-gradient(0deg, var(--primary-color), var(--white) 0%)`
        i = 0
    }
    lessonIntroduction.style.opacity = "1"
    setTimeout(() => {
        lessonIntroduction.style.display = "flex"
        homeSection.style.display = "none"
    }, 500);

}

function getLessonExtraFile(id) {
    return new Promise(async resolve => {
        getDownloadURL(ref(storage, `lessons/${id}/extraFile`))
            .then((url) => {
                const xhr = new XMLHttpRequest();
                xhr.responseType = 'blob';
                xhr.onload = (event) => {
                    const blob = xhr.response;
                };
                xhr.open('GET', url);
                xhr.send();
                resolve(url)
            })
            .catch((error) => {
                // Handle any errors
            });
    })
}

function lessonWindowData(obj, id, url) {
    actualUserEmail().then(actualUser => {
        lessonWindow.children[1].textContent = `${obj.lessonTitle}`
        if (obj.existsExtraFile == false) {
            lessonWindow.children[4].innerHTML = `<p class="lessonWindow__notExtraFile">Sem anexos</p>`
        } else {
            lessonWindow.children[4].innerHTML = `<button class="lessonWindow__extraFileDownload">Baixar Arquivo</button>`
            lessonWindow.children[4].children[0].onclick = function () {
                getLessonExtraFile(id).then(fileUrl => {
                    window.location.href = fileUrl
                })
            }
        }
        getLessonVideo(id).then(videoUrl => {
            lessonWindow.children[2].src = `${videoUrl}`
            lessonWindow.children[2].autoplay = true
        })
        lessonWindow.children[3].children[0].onclick = function () {
            lessonWindow.children[3].children[0].classList.add("active")
            lessonWindow.children[3].children[1].classList.remove("active")
            lessonWindow.children[4].style.display = "none"
            lessonWindow.children[5].style.display = ""
        }
        lessonWindow.children[3].children[1].onclick = function () {
            lessonWindow.children[3].children[1].classList.add("active")
            lessonWindow.children[3].children[0].classList.remove("active")
            lessonWindow.children[4].style.display = "flex"
            lessonWindow.children[5].style.display = "none"
        }
        lessonWindow.children[5].children[1].children[0].innerHTML = ""
        loadComents(lessonWindow.children[5].children[1].children[0], obj, id, url)
        lessonWindow.children[5].children[1].children[1].children[0].children[2].onclick = function () {
            if (lessonWindow.children[5].children[1].children[1].children[0].children[1].value.replace(" ", "") != "") {
                postComment("lessons", id, actualUser, lessonWindow.children[5].children[1].children[1].children[0].children[1].value).then(posted => {
                    lessonWindow.children[5].children[1].children[1].children[0].children[1].value = ""
                    unrefreshLoadComents(lessonWindow.children[5].children[1].children[0], obj, id, posted, url)
                })
            }
        }
        homeSection.style.display = "none"
        lessonWindow.style.display = "flex"
    })
}

function loadComents(section, obj, id, url) {
    section.innerHTML = ""
    actualUserEmail().then(actualUser => {
        section.innerHTML = ""
        getComments("lessons", `${id}`).then(coment => {
            coment.forEach(element => {
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
                        getDownloadURL(ref(storage, `users/${element.email}/photo`))
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
            })
        })
    })
}

function unrefreshLoadComents(section, obj, id, postId, url) {
    actualUserEmail().then(actualUser => {
        getThisComment("lessons", id, postId).then(element => {
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
                    getDownloadURL(ref(storage, `users/${element.email}/photo`))
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
        })
    })
}


onAuthStateChanged(auth, (user) => {
    if (user) {
        const uid = user.uid;
        actualUserData().then(actualUser => {
            let coverUrl = ""
            if (actualUser.noPhoto == true) {
                document.getElementById("homeUserImg").src = "https://img.freepik.com/vetores-gratis/ilustracao-do-icone-da-lampada_53876-43730.jpg?w=740&t=st=1705192551~exp=1705193151~hmac=3347369c888609a6def2a1cd13bfb02dc519c8fbc965419dd1b5f091ef79982d"
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
                        document.getElementById("homeUserImg").src = `${url}`
                    })
            }
            if (actualUser.noCover == true) {
                coverUrl = "https://images.pexels.com/photos/7869091/pexels-photo-7869091.jpeg?auto=compress&cs=tinysrgb&w=600"
            }
            document.getElementById("homeUserName").innerHTML = `${actualUser.name}`
            document.getElementById("homeUserSignature").innerHTML = `Assinatura: ${actualUser.signature}`
            document.getElementById("homeUserCover").style.backgroundImage = `linear-gradient(0deg, rgba(250, 250, 250, 0.88), rgba(250, 250, 250, 0.88)), url(${coverUrl})`
            document.getElementById("homeViewPerfil").onclick = function () {
                homeSection.style.display = "none"
                document.getElementById("perfilSection").style.display = "flex"
            }
        })
        loadLessons()
    }
});