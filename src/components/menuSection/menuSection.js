import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot, addDoc, collection, query, where, getDocs, serverTimestamp, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadString, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
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

import { alternatePage } from "../../scripts/alternatePages"
import { actualUserData } from "../../scripts/returnUserInfos"
let menuToggle = document.querySelectorAll(".header__menuToggle")
let menuSection = document.getElementById("menuSection")
let body = document.querySelector("body")
let AdminAdds = document.getElementById("AdminAdds")
let switchSchool = document.getElementById("switchSchool")
let logOutBtn = document.getElementById("logOutBtn")

onAuthStateChanged(auth, (user) => {
    if (user) {
        const uid = user.uid;
        if (window.innerWidth > 600) {
            let menuSideUlToggle = document.getElementById("menuSideUlToggle")
            let menuSideUl = document.getElementById("menuSideUl")
            logOutBtn.parentElement.style.display = "none"
            actualUserData().then(userData => {
                if (userData.admin == true) {
                    menuSideUlToggle.style.display = "flex"
                    menuSideUlToggle.onclick = function () {
                        if (menuSideUl.style.display == "flex") {
                            menuSideUl.style.transform = "translateX(-50px)"
                            menuSideUl.style.opacity = "0"
                            menuSideUlToggle.style.rotate = "0deg"
                            setTimeout(() => {
                                menuSideUl.style.display = "none"
                            }, 200);
                        } else {
                            menuSideUlToggle.style.rotate = "180deg"
                            menuSideUl.style.display = "flex"
                            setTimeout(() => {
                                menuSideUl.style.transform = "translateX(195px)"
                                menuSideUl.style.opacity = "1"
                            }, 1);
                        }
                    }
                } else {
                    menuSideUlToggle.style.display = "none"
                    menuSideUlToggle.onclick = function () { }
                }
            })
        }
    }
})
function unColor(btn) {
    let adminBtn = document.querySelectorAll(".menuSection__adminBtn")
    let allBtns = document.querySelectorAll(".menuSection__btn")
    adminBtn.forEach(element => {
        element.classList.remove("active")
    });
    allBtns.forEach(element => {
        element.classList.remove("active")
    });
    btn.classList.add("active")
}

function unColorAll() {
    let adminBtn = document.querySelectorAll(".menuSection__adminBtn")
    let allBtns = document.querySelectorAll(".menuSection__btn")
    adminBtn.forEach(element => {
        element.classList.remove("active")
    });
    allBtns.forEach(element => {
        element.classList.remove("active")
    });
}

document.getElementById("goToAddContent").onclick = function () {
    AdminAdds.style.transform = "translateX(0vw)"
}

document.getElementById("closeAddContent").onclick = function () {
    AdminAdds.style.transform = "translateX(100vw)"
}

document.querySelectorAll(".header__logo").forEach(element => {
    element.onclick = function () {
        if (window.innerWidth < 600) {
            menuToggle.forEach(menuBtn => {
                alternatePage(document.getElementById("homeSection"))
                menuBtn.classList.remove("active")
                menuSection.style.transform = "translateX(100vw)"
                body.style.overflowY = "auto"
                unColor(document.getElementById("goToHome"))
            });
        }
    }
});

document.getElementById("goToHome").onclick = function () {
    menuToggle.forEach(menuBtn => {
        if (menuBtn.classList.contains("active") || window.innerWidth > 600) {
            alternatePage(document.getElementById("homeSection"))
            if (window.innerWidth < 600) {
                menuBtn.classList.remove("active")
                menuSection.style.transform = "translateX(100vw)"
            }
            body.style.overflowY = "auto"
            unColor(document.getElementById("goToHome"))
        }
    });
}

document.getElementById("goToRanking").onclick = function () {
    menuToggle.forEach(menuBtn => {
        if (menuBtn.classList.contains("active") || window.innerWidth > 600) {
            alternatePage(document.getElementById("rankingSection"))
            if (window.innerWidth < 600) {
                menuBtn.classList.remove("active")
                menuSection.style.transform = "translateX(100vw)"
            }
            body.style.overflowY = "auto"
            unColor(document.getElementById("goToRanking"))
        }
    });
}

document.getElementById("goToTeams").onclick = function () {
    menuToggle.forEach(menuBtn => {
        if (menuBtn.classList.contains("active") || window.innerWidth > 600) {
            alternatePage(document.getElementById("teamSection"))
            if (window.innerWidth < 600) {
                menuBtn.classList.remove("active")
                menuSection.style.transform = "translateX(100vw)"
            }
            body.style.overflowY = "auto"
            unColor(document.getElementById("goToTeams"))
        }
    });
}

document.getElementById("goToStore").onclick = function () {
    menuToggle.forEach(menuBtn => {
        if (menuBtn.classList.contains("active") || window.innerWidth > 600) {
            alternatePage(document.getElementById("storeSection"))
            if (window.innerWidth < 600) {
                menuBtn.classList.remove("active")
                menuSection.style.transform = "translateX(100vw)"
            }
            body.style.overflowY = "auto"
            unColor(document.getElementById("goToStore"))
        }
    });
}

document.getElementById("goToStock").onclick = function () {
    menuToggle.forEach(menuBtn => {
        if (menuBtn.classList.contains("active") || window.innerWidth > 600) {
            alternatePage(document.getElementById("stockSection"))
            if (window.innerWidth < 600) {
                menuBtn.classList.remove("active")
                menuSection.style.transform = "translateX(100vw)"
            }
            body.style.overflowY = "auto"
            unColor(document.getElementById("goToStock"))
        }
    });
}

document.getElementById("goToCreateAccount").onclick = function () {
    menuToggle.forEach(menuBtn => {
        if (menuBtn.classList.contains("active") || window.innerWidth > 600) {
            alternatePage(document.getElementById("createAccountSection"))
            if (window.innerWidth < 600) {
                menuBtn.classList.remove("active")
                menuSection.style.transform = "translateX(100vw)"
            }
            body.style.overflowY = "auto"
            unColorAll()
            setTimeout(() => {
                AdminAdds.style.transform = "translateX(100vw)"
            }, 200);
        }
    });
}

document.getElementById("goTocreateLesson").onclick = function () {
    menuToggle.forEach(menuBtn => {
        if (menuBtn.classList.contains("active") || window.innerWidth > 600) {
            alternatePage(document.getElementById("createLessonSection"))
            if (window.innerWidth < 600) {
                menuBtn.classList.remove("active")
                menuSection.style.transform = "translateX(100vw)"
            }
            body.style.overflowY = "auto"
            unColorAll()
            setTimeout(() => {
                AdminAdds.style.transform = "translateX(100vw)"
            }, 200);
        }
    });
}
document.getElementById("goToCreateStockItem").onclick = function () {
    menuToggle.forEach(menuBtn => {
        if (menuBtn.classList.contains("active") || window.innerWidth > 600) {
            alternatePage(document.getElementById("createStockItem"))
            if (window.innerWidth < 600) {
                menuBtn.classList.remove("active")
                menuSection.style.transform = "translateX(100vw)"
            }
            body.style.overflowY = "auto"
            unColorAll()
            setTimeout(() => {
                AdminAdds.style.transform = "translateX(100vw)"
            }, 200);
        }
    });
}

document.getElementById("goToCreateStoreItem").onclick = function () {
    menuToggle.forEach(menuBtn => {
        if (menuBtn.classList.contains("active") || window.innerWidth > 600) {
            alternatePage(document.getElementById("createStoreItem"))
            if (window.innerWidth < 600) {
                menuBtn.classList.remove("active")
                menuSection.style.transform = "translateX(100vw)"
            }
            body.style.overflowY = "auto"
            unColorAll()
            setTimeout(() => {
                AdminAdds.style.transform = "translateX(100vw)"
            }, 200);
        }
    });
}

document.getElementById("goToBuyeds").onclick = function () {
    menuToggle.forEach(menuBtn => {
        if (menuBtn.classList.contains("active") || window.innerWidth > 600) {
            alternatePage(document.getElementById("buyedsSection"))
            if (window.innerWidth < 600) {
                menuBtn.classList.remove("active")
                menuSection.style.transform = "translateX(100vw)"
            }
            body.style.overflowY = "auto"
            unColor(document.getElementById("goToBuyeds"))
        }
    });
}

document.getElementById("goToFolders").onclick = function () {
    menuToggle.forEach(menuBtn => {
        if (menuBtn.classList.contains("active") || window.innerWidth > 600) {
            alternatePage(document.getElementById("notesSection"))
            if (window.innerWidth < 600) {
                menuBtn.classList.remove("active")
                menuSection.style.transform = "translateX(100vw)"
            }
            body.style.overflowY = "auto"
            unColor(document.getElementById("goToFolders"))
        }
    });
}

document.getElementById("goToResolvers").onclick = function () {
    menuToggle.forEach(menuBtn => {
        if (menuBtn.classList.contains("active") || window.innerWidth > 600) {
            alternatePage(document.getElementById("resolversSection"))
            if (window.innerWidth < 600) {
                menuBtn.classList.remove("active")
                menuSection.style.transform = "translateX(100vw)"
            }
            body.style.overflowY = "auto"
            unColor(document.getElementById("goToResolvers"))
        }
    });
}

document.getElementById("goToChallenge").onclick = function () {
    menuToggle.forEach(menuBtn => {
        if (menuBtn.classList.contains("active") || window.innerWidth > 600) {
            alternatePage(document.getElementById("challengeSection"))
            if (window.innerWidth < 600) {
                menuBtn.classList.remove("active")
                menuSection.style.transform = "translateX(100vw)"
            }
            body.style.overflowY = "auto"
            unColor(document.getElementById("goToChallenge"))
        }
    });
}

document.getElementById("goToCreateChallenge").onclick = function () {
    menuToggle.forEach(menuBtn => {
        if (menuBtn.classList.contains("active") || window.innerWidth > 600) {
            alternatePage(document.getElementById("createChallenge"))
            if (window.innerWidth < 600) {
                menuBtn.classList.remove("active")
                menuSection.style.transform = "translateX(100vw)"
            }
            body.style.overflowY = "auto"
            unColorAll()
            setTimeout(() => {
                AdminAdds.style.transform = "translateX(100vw)"
            }, 200);
        }
    });
}