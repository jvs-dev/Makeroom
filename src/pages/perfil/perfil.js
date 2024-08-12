let homeSection = document.getElementById("homeSection")
let closePerfil = document.getElementById("closePerfil")

closePerfil.onclick = function () {
    homeSection.style.display = "flex"
    document.getElementById("perfilSection").style.display = "none"
}