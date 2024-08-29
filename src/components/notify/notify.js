export function notifyThis(title, text) {
    return new Promise(resolve => {
        let body = document.querySelector("body")
        body.insertAdjacentHTML("beforeend", `
        <article class="notifyCard">
            <ion-icon name="checkmark-sharp" class="notifyCard__icon"></ion-icon>
            <div class="notifyCard__div">
                <p class="notifyCard__title">${title}</p>
                <p class="notifyCard__p">${text}</p>
                <button class="notifyCard__btn"><ion-icon name="close-sharp"></ion-icon></button>
            </div>
        </article>`)
        let notifyCard = document.querySelectorAll(".notifyCard")
        notifyCard.forEach(element => {
            setTimeout(() => {
                element.style.opacity = "1"
                element.children[1].children[2].onclick = function () {
                    element.parentNode.removeChild(element);
                    resolve("closed")
                }
            }, 1);
        });
    })
}