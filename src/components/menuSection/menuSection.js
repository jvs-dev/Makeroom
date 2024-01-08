import { alternatePage } from "../../scripts/alternatePages"
let menuToggle = document.querySelectorAll(".header__menuToggle")
let menuSection = document.getElementById("menuSection")
let body = document.querySelector("body")
let AdminAdds = document.getElementById("AdminAdds")

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

document.getElementById("goToHome").onclick = function () {
    menuToggle.forEach(menuBtn => {
        if (menuBtn.classList.contains("active")) {
            alternatePage(document.getElementById("homeSection"))
            menuBtn.classList.remove("active")
            menuSection.style.transform = "translateX(100vw)"
            body.style.overflowY = "auto"
            unColor(document.getElementById("goToHome"))
        }
    });
}

document.getElementById("goToRanking").onclick = function () {
    menuToggle.forEach(menuBtn => {
        if (menuBtn.classList.contains("active")) {
            alternatePage(document.getElementById("rankingSection"))
            menuBtn.classList.remove("active")
            menuSection.style.transform = "translateX(100vw)"
            body.style.overflowY = "auto"
            unColor(document.getElementById("goToRanking"))
        }
    });
}

document.getElementById("goToStock").onclick = function () {
    menuToggle.forEach(menuBtn => {
        if (menuBtn.classList.contains("active")) {
            alternatePage(document.getElementById("stockSection"))
            menuBtn.classList.remove("active")
            menuSection.style.transform = "translateX(100vw)"
            body.style.overflowY = "auto"
            unColor(document.getElementById("goToStock"))
        }
    });
}

document.getElementById("goToCreateAccount").onclick = function () {
    menuToggle.forEach(menuBtn => {
        if (menuBtn.classList.contains("active")) {
            alternatePage(document.getElementById("createAccountSection"))
            menuBtn.classList.remove("active")
            menuSection.style.transform = "translateX(100vw)"
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
        if (menuBtn.classList.contains("active")) {
            alternatePage(document.getElementById("createLessonSection"))
            menuBtn.classList.remove("active")
            menuSection.style.transform = "translateX(100vw)"
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
        if (menuBtn.classList.contains("active")) {
            alternatePage(document.getElementById("createStockItem"))
            menuBtn.classList.remove("active")
            menuSection.style.transform = "translateX(100vw)"
            body.style.overflowY = "auto"
            unColorAll()
            setTimeout(() => {
                AdminAdds.style.transform = "translateX(100vw)"
            }, 200);
        }
    });
}

document.getElementById("goToChallenge").onclick = function () {
    menuToggle.forEach(menuBtn => {
        if (menuBtn.classList.contains("active")) {
            alternatePage(document.getElementById("challengeSection"))
            menuBtn.classList.remove("active")
            menuSection.style.transform = "translateX(100vw)"
            body.style.overflowY = "auto"
            unColor(document.getElementById("goToChallenge"))
        }
    });
}

document.getElementById("goToCreateChallenge").onclick = function () {
    menuToggle.forEach(menuBtn => {
        if (menuBtn.classList.contains("active")) {
            alternatePage(document.getElementById("createChallenge"))
            menuBtn.classList.remove("active")
            menuSection.style.transform = "translateX(100vw)"
            body.style.overflowY = "auto"
            unColorAll()
            setTimeout(() => {
                AdminAdds.style.transform = "translateX(100vw)"
            }, 200);
        }
    });
}