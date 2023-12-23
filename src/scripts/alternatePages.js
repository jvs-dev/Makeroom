import { removeIntroduction } from "../components/introduction/introduction"
let introductionSection = document.getElementById("introductionSection")
let introductionText1 = document.getElementById("introductionText1")
let introductionText2 = document.getElementById("introductionText2")
let introductionLoader = document.getElementById("introductionLoader")
let introductionLogo = document.getElementById("introductionLogo")

export function alternatePage(page) {
    let sections = document.querySelectorAll(".main__section")
    sections.forEach(section => {
        section.style.display = "none"
    });
    page.style.display = "flex"
}

export function logoAlternateAnimation(page) {
    introductionSection.style.display = "flex"
    setTimeout(() => {
        introductionSection.style.opacity = "1"
        setTimeout(() => {
            introductionLogo.style.width = ""
            introductionSection.style.height = ""
            introductionSection.style.width = ""
            introductionSection.style.margin = ""
            setTimeout(() => {
                introductionLoader.classList.add("active");
                let sections = document.querySelectorAll(".main__section")
                sections.forEach(section => {
                    section.style.display = "none"
                });
                page.style.display = "flex"
                setTimeout(() => {
                    removeIntroduction()
                }, 1000);
            }, 500);
        }, 500);
    }, 1);
}
