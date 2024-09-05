export function activeConfirmSection(title, text, color, sadHappy) {
    return new Promise(resolve => {
        let confirmSection = document.getElementById("confirmSection")
        confirmSection.style.display = "flex"
        confirmSection.children[0].children[1].textContent = `${title}`
        confirmSection.children[0].children[1].style.color = `${color}`
        confirmSection.children[0].children[2].textContent = `${text}`
        confirmSection.children[0].children[2].style.color = `${color}`
        confirmSection.children[0].children[4].style.background = `${color}`
        if (sadHappy == "sad") {
            confirmSection.children[0].children[3].src = `/Pequeno gil triste.gif`
        } else {
            confirmSection.children[0].children[3].src = `/Pequeno gil_2.gif`
        }
        setTimeout(() => {
            confirmSection.style.opacity = "1"
            confirmSection.children[0].children[0].onclick = () => {
                confirmSection.style.opacity = "0"
                setTimeout(() => {
                    confirmSection.style.display = "none"
                    resolve("closed")
                }, 500);
            }
            confirmSection.children[0].children[4].onclick = () => {
                confirmSection.style.opacity = "0"
                setTimeout(() => {
                    confirmSection.style.display = "none"
                    resolve("confirmed")
                }, 500);
            }
        }, 1);
    })
}