let menuToggle = document.querySelectorAll(".header__menuToggle")
let menuSection = document.getElementById("menuSection")
let body = document.querySelector("body")

menuToggle.forEach(menuBtn => {
    menuBtn.onclick = function () {
        if (menuBtn.classList.contains("active")) {
            menuBtn.classList.remove("active")
            menuSection.style.transform = "translateX(100vw)"
            body.style.overflowY = "auto"
        } else {
            menuBtn.classList.add("active")
            menuSection.style.transform = "translateX(0vw)"
            body.style.overflowY = "hidden"
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            })
        }
    }
});
