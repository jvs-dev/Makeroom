import {verifyIfUserLogged} from "../../scripts/verifylogin"
let introductionSection = document.getElementById("introductionSection")
let introductionText1 = document.getElementById("introductionText1")
let introductionText2 = document.getElementById("introductionText2")
let introductionLoader = document.getElementById("introductionLoader")
let introductionLogo = document.getElementById("introductionLogo")

function initIntroduction() {
    verifyIfUserLogged()
    return new Promise(resolve => {
        setTimeout(() => {
            introductionText1.style.display = "flex";
            setTimeout(() => {
                introductionText1.style.opacity = "1";
                setTimeout(() => {
                    introductionText1.style.opacity = "0";
                    setTimeout(() => {
                        introductionText1.style.display = "none";
                        setTimeout(() => {
                            setTimeout(() => {
                                introductionText2.style.display = "flex";
                                setTimeout(() => {
                                    introductionText2.style.opacity = "1";
                                    setTimeout(() => {
                                        introductionText2.style.opacity = "0";
                                        setTimeout(() => {
                                            introductionText2.style.display = "none";
                                            setTimeout(() => {
                                                introductionLogo.style.display = "flex";
                                                setTimeout(() => {
                                                    introductionLogo.style.opacity = "1";
                                                    setTimeout(() => {
                                                        introductionLoader.style.display = "flex";
                                                        setTimeout(() => {
                                                            introductionLoader.classList.add("active");
                                                            setTimeout(() => {
                                                                resolve("completed");
                                                            }, 1000);
                                                        }, 1);
                                                    }, 500);
                                                }, 1);
                                            }, 500);
                                        }, 500);
                                    }, 1500);
                                }, 1);
                            }, 1000);
                        }, 100);
                    }, 500);
                }, 1500);
            }, 1);
        }, 2000);
    });
}

export function removeIntroduction() {
    return new Promise(resolve => {
        introductionLoader.classList.remove("active");
        setTimeout(() => {
            introductionLogo.style.width = "60px"
            introductionSection.style.height = "80px"
            introductionSection.style.width = "60px"            
            introductionSection.style.margin = "0px 0px 0px 20px"
            setTimeout(() => {
                introductionSection.style.opacity = "0"
                setTimeout(() => {
                    introductionSection.style.display = "none"
                    resolve("completed")
                }, 500);
            }, 500);
        }, 500);
    })
}

initIntroduction().then(result => {
    setTimeout(() => {
        removeIntroduction()
    }, 500);
})