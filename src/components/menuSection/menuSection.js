import { alternatePage } from "../../scripts/alternatePages"
let goToHome = document.getElementById("goToHome")
let menuToggle = document.querySelectorAll(".header__menuToggle")
let menuSection = document.getElementById("menuSection")
let body = document.querySelector("body")

goToHome.onclick = function () {
    menuToggle.forEach(menuBtn => {
        if (menuBtn.classList.contains("active")) {
            alternatePage(document.getElementById("homeSection"))
            menuBtn.classList.remove("active")
            menuSection.style.transform = "translateX(100vw)"
            body.style.overflowY = "auto"
        }
    });
}