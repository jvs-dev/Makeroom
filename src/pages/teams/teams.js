import { actualUserData, thisUserData, actualUserEmail } from "../../scripts/returnUserInfos"
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot, addDoc, collection, query, where, getDoc, getDocs, serverTimestamp, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadString, deleteObject, uploadBytesResumable, getDownloadURL, uploadBytes } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { monitorCollectionUpdates } from "../../scripts/returnDataInfos";
import { alertThis } from "../../components/alerts/alert";
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
const createTeam = document.getElementById("createTeam")
let personSelected = []
let teamSearchUserDiv = document.getElementById("teamSearchUserDiv")
let addPersonToTeam = document.getElementById("addPersonToTeam")
let teamAddUserDiv = document.getElementById("teamAddUserDiv")
let confirmAddUserTeamBtn = document.getElementById("confirmAddUserTeamBtn")
let createTeamPersonUl = document.getElementById("createTeamPersonUl")
let createTeamBtn = document.getElementById("createTeamBtn")
let firtsAllTeamsDiv = document.getElementById("firtsAllTeamsDiv")
let allTeamsDiv = document.getElementById("allTeamsDiv")
let myGroupBtn = document.getElementById("myGroupBtn")
let yourAllTeamsDiv = document.getElementById("yourAllTeamsDiv")
let rankingTeamBtn = document.getElementById("rankingTeamBtn")
let teamSectionTitle = document.getElementById("teamSectionTitle")
let yourTeamDiv = document.getElementById("yourTeamDiv")

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const uid = user.uid;
        actualUserData().then((userData) => {
            if (userData.admin == true) {
                createTeam.style.display = "flex"
                loadTeams()
                loadPersons()
                loadMyTeams(userData)
            } else {
                createTeam.style.margin = "0px 20px"
            }
        })
    }
})

myGroupBtn.onclick = function () {
    firtsAllTeamsDiv.style.display = "none"
    allTeamsDiv.style.display = "none"
    yourTeamDiv.style.display = "none"
    yourAllTeamsDiv.style.display = "flex"
    myGroupBtn.classList.add("active")
    rankingTeamBtn.classList.remove("active")
    teamSectionTitle.textContent = "Suas equipes"
}

rankingTeamBtn.onclick = function () {
    firtsAllTeamsDiv.style.display = "flex"
    allTeamsDiv.style.display = "flex"
    yourAllTeamsDiv.style.display = "none"
    yourTeamDiv.style.display = "none"
    myGroupBtn.classList.remove("active")
    rankingTeamBtn.classList.add("active")
    teamSectionTitle.textContent = "Ranking da turma"
}

addPersonToTeam.onclick = function () {
    teamSearchUserDiv.style.display = "flex"
}

async function loadPersons() {
    teamAddUserDiv.innerHTML = ""
    const querySnapshot = await getDocs(collection(db, `${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_users`));
    querySnapshot.forEach((usersData) => {
        let article = document.createElement("article")
        teamAddUserDiv.insertAdjacentElement("beforeend", article)
        article.classList.add("manageUsersCard")
        article.innerHTML = `
            <img class="manageUsersCard__img" src="" alt="">
            <div class="manageUsersCard__div">
              <p class="manageUsersCard__name">${usersData.data().name}<span class="manageUsersCard__classRoom">${usersData.data().class}${usersData.data().room}</span></p>
              <p class="manageUsersCard__email">${usersData.data().email}</p>
            </div>`
        if (usersData.data().noPhoto == true) {
            article.children[0].src = "https://img.freepik.com/vetores-gratis/ilustracao-do-icone-da-lampada_53876-43730.jpg?w=740&t=st=1705192551~exp=1705193151~hmac=3347369c888609a6def2a1cd13bfb02dc519c8fbc965419dd1b5f091ef79982d"
        } else {
            getDownloadURL(ref(storage, `${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_users/${usersData.data().email}/photo`))
                .then((url) => {
                    let xhr = new XMLHttpRequest();
                    xhr.responseType = 'blob';
                    xhr.onload = (event) => {
                        let blob = xhr.response;
                    };
                    xhr.open('GET', url);
                    xhr.send();
                    article.children[0].src = `${url}`
                })
        }
        personSelected.forEach(element => {
            if (element.email == usersData.data().email) {
                article.classList.add("active")
            }
        });
        article.onclick = function () {
            let objetoAlvo = {
                email: usersData.data().email,
                name: usersData.data().name,
                classRoom: `${usersData.data().class}${usersData.data().room}`,
                specialization: null
            };
            let cardIndex = personSelected.findIndex(obj =>
                obj.email === objetoAlvo.email &&
                obj.name === objetoAlvo.name &&
                obj.classRoom === objetoAlvo.classRoom &&
                obj.specialization === objetoAlvo.specialization
            );
            if (cardIndex >= 0) {
                personSelected.splice(cardIndex, 1);
                article.classList.remove("active")
            } else {
                article.classList.add("active")
                personSelected.push({ email: `${usersData.data().email}`, name: `${usersData.data().name}`, classRoom: `${usersData.data().class}${usersData.data().room}`, specialization: null })
            }
        }
    })
}

confirmAddUserTeamBtn.onclick = function () {
    teamSearchUserDiv.style.display = ""
    createTeamPersonUl.innerHTML = ""
    personSelected.forEach((element, index) => {
        let li = document.createElement("li")
        createTeamPersonUl.insertAdjacentElement("beforeend", li)
        li.classList.add("createTeam__li")
        li.innerHTML = `
            <div>
                <button type="button" class="createTeam__removePerson">
                    <ion-icon name="close-circle-outline"></ion-icon>
                </button>
                <p class="createTeam__personName">${element.name}<span class="manageUsersCard__classRoom">${element.classRoom}</span></p>
            </div>
            <select class="createTeam__select">
                <option value="null">Sem função</option>
                <option value="Programador">Programador</option>
                <option value="Lider">Lider</option>
                <option value="Designer">Designer</option>
                <option value="Montador">Montador</option>
                <option value="Organizador">Organizador</option>
                <option value="Vice lider">Vice lider</option>
            </select>`
        li.children[1].oninput = function () {
            personSelected[index].specialization = `${li.children[1].value}`
            console.log(li.children[1].value);
        }
        li.children[0].children[0].onclick = function () {
            li.parentNode.removeChild(li);
            personSelected.splice(index, 1);
            loadPersons()
        }
    });
}

createTeamBtn.onclick = function () {
    if (document.getElementById("createTeamName").value != "" && document.getElementById("createTeamClass").value != "" && document.getElementById("createTeamRoom").value != "") {
        if (personSelected.length > 0) {
            createTeamBtn.disabled = true
            registerTeam()
        } else {
            alertThis("Adicione integrantes para continuar", "error")
        }
    } else {
        alertThis("Preencha todos os campos", "error")
    }

}

async function loadMyTeams(userData) {
    let teamsArray = []
    const querySnapshot = await getDocs(collection(db, `${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_teams`));
    querySnapshot.forEach((doc) => {
        teamsArray.push(doc.data())
    });
    const sortedTeams = teamsArray.sort((a, b) => b.teamPoints - a.teamPoints);
    const rankedTeams = sortedTeams.map((team, index) => ({
        teamPosition: index + 1,
        teamUsers: team.teamUsers,
        teamName: team.teamName,
        teamPoints: team.teamPoints,
        teamclass: team.teamclass,
        teamRoom: team.teamRoom
    }));
    yourAllTeamsDiv.innerHTML = ""
    rankedTeams.forEach(teams => {
        teams.teamUsers.forEach(element => {
            if (element.email == userData.email) {
                let article = document.createElement("article")
                yourAllTeamsDiv.insertAdjacentElement("beforeend", article)
                article.classList.add("teamsCard")
                article.innerHTML = `
                        <div class="teamsCard__div--1">
                            <p class="teamsCard__name">${teams.teamName}</p>
                            <div class="teamsCard__div--2">
            
                            </div>
                        </div>
                        <span class="teamsCard__span"><ion-icon name="arrow-forward-outline"></ion-icon></span>`
                loadUserPhoto(teams.teamUsers, article.children[0].children[1])
                article.onclick = function () {
                    yourTeamDiv.children[0].children[0].textContent = `${teams.teamPosition}º Lugar`
                    yourTeamDiv.children[0].children[1].textContent = `${teams.teamPoints} Pontos`
                    teamSectionTitle.textContent = `${teams.teamName}`
                    yourAllTeamsDiv.style.display = "none"
                    yourTeamDiv.style.display = "flex"
                    yourTeamDiv.children[1].innerHTML = ""
                    teams.teamUsers.forEach(person => {
                        let personCard = document.createElement("article")
                        yourTeamDiv.children[1].insertAdjacentElement("beforeend", personCard)
                        personCard.classList.add("yourTeamDiv__teamUsersCard")
                        personCard.innerHTML = `
                        <img class="teamUsersCard__img" src="" alt="">
                        <p class="teamUsersCard__p">${person.specialization}</p>
                        `
                        returnUserPhoto(person.email, personCard.children[0])
                    });
                }
            }
        });
    });
}



async function loadTeams() {
    actualUserData().then(async (userData) => {
        firtsAllTeamsDiv.innerHTML = ""
        let teamsArray = []
        const querySnapshot = await getDocs(collection(db, `${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_teams`));
        querySnapshot.forEach((doc) => {
            if (doc.data().teamclass == userData.class && doc.data().teamRoom == userData.room) {
                teamsArray.push(doc.data())
            }
        })
        const sortedTeams = teamsArray.sort((a, b) => b.teamPoints - a.teamPoints);
        const rankedTeams = sortedTeams.map((team, index) => ({
            teamPosition: index + 1,
            teamUsers: team.teamUsers,
            teamName: team.teamName,
            teamPoints: team.teamPoints,
            teamclass: team.teamclass,
            teamRoom: team.teamRoom
        }));
        firtsAllTeamsDiv.innerHTML = ""
        allTeamsDiv.innerHTML = ""
        for (let index = 0; index < 3; index++) {
            if (rankedTeams[index] != undefined) {
                let article = document.createElement("article")
                firtsAllTeamsDiv.insertAdjacentElement("beforeend", article)
                article.classList.add("teamsCard")
                article.innerHTML = `
                <div class="teamsCard__div--1">
                    <p class="teamsCard__name">${rankedTeams[index].teamName}</p>
                    <div class="teamsCard__div--2">

                    </div>
                </div>
                <div class="teamsCard__div--3">
                    <span class="teamsCard__position">${rankedTeams[index].teamPosition}º</span>
                    <p class="teamsCard__points">${rankedTeams[index].teamPoints} Pontos</p>
                </div>`
                article.classList.add(`position-${rankedTeams[index].teamPosition}`)
                loadUserPhoto(rankedTeams[index].teamUsers, article.children[0].children[1])
            }
        }

        rankedTeams.forEach(element => {
            if (element.teamPosition > 3) {
                let article = document.createElement("article")
                article.classList.add("teamsCard")
                allTeamsDiv.insertAdjacentElement("beforeend", article)
                article.innerHTML = `                    
                <div class="teamsCard__div--1">
                    <p class="teamsCard__name">${element.teamName}</p>
                    <div class="teamsCard__div--2">

                    </div>
                </div>
                <div class="teamsCard__div--3">
                    <span class="teamsCard__position">${element.teamPosition}º</span>
                    <p class="teamsCard__points">${element.teamPoints} Pontos</p>
                </div>                
                `
                loadUserPhoto(element.teamUsers, article.children[0].children[1])
            }
        });
    })
}


async function loadUserPhoto(usersArray, htmlElement) {
    usersArray.forEach(async (element) => {
        const docRef = doc(db, `${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_users`, `${element.email}`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            if (docSnap.data().noPhoto == true) {
                htmlElement.insertAdjacentHTML("beforeend", `<img src="https://img.freepik.com/vetores-gratis/ilustracao-do-icone-da-lampada_53876-43730.jpg?w=740&t=st=1705192551~exp=1705193151~hmac=3347369c888609a6def2a1cd13bfb02dc519c8fbc965419dd1b5f091ef79982d" class="teamsCard__img">`)
            } else {
                getDownloadURL(ref(storage, `${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_users/${element.email}/photo`))
                    .then((url) => {
                        let xhr = new XMLHttpRequest();
                        xhr.responseType = 'blob';
                        xhr.onload = (event) => {
                            let blob = xhr.response;
                        };
                        xhr.open('GET', url);
                        xhr.send();
                        htmlElement.insertAdjacentHTML("beforeend", `<img src="${url}" class="teamsCard__img">`)
                    })
            }
        }
    });
}


async function returnUserPhoto(email, element) {
    const docRef = doc(db, `${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_users`, `${email}`);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        if (docSnap.data().noPhoto == true) {
            element.src = `https://img.freepik.com/vetores-gratis/ilustracao-do-icone-da-lampada_53876-43730.jpg?w=740&t=st=1705192551~exp=1705193151~hmac=3347369c888609a6def2a1cd13bfb02dc519c8fbc965419dd1b5f091ef79982d`
        } else {
            getDownloadURL(ref(storage, `${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_users/${email}/photo`))
                .then((url) => {
                    let xhr = new XMLHttpRequest();
                    xhr.responseType = 'blob';
                    xhr.onload = (event) => {
                        let blob = xhr.response;
                    };
                    xhr.open('GET', url);
                    xhr.send();
                    element.src = `${url}`
                })
        }
    }
}



async function registerTeam() {
    let docRef = await addDoc(collection(db, `${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_teams`), {
        teamName: `${document.getElementById("createTeamName").value}`,
        teamclass: `${document.getElementById("createTeamClass").value}`,
        teamRoom: `${document.getElementById("createTeamRoom").value}`,
        teamPoints: 0,
        teamUsers: personSelected
    });
    document.getElementById("createTeamName").value = ""
    personSelected = []
    createTeamPersonUl.innerHTML = ""
    alertThis("Conta criada", "sucess")
    loadPersons()
    createTeamBtn.disabled = false
}