import { actualUserData, thisUserData, actualUserEmail } from "../../scripts/returnUserInfos"
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot, addDoc, collection, query, where, getDoc, getDocs, serverTimestamp, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadString, deleteObject, uploadBytesResumable, getDownloadURL, uploadBytes } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { monitorCollectionUpdates } from "../../scripts/returnDataInfos";
import { alertThis } from "../../components/alerts/alert";
import { activeConfirmSection } from "../../components/confirmSection/confirmSection";
import { deleteThis } from "../../scripts/deleteThis";
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

confirmAddUserTeamBtn.onclick = function () {    teamSearchUserDiv.style.display = ""
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
        // Add document ID to the team data
        teamsArray.push({
            id: doc.id,
            ...doc.data()
        })
    });
    const sortedTeams = teamsArray.sort((a, b) => b.teamPoints - a.teamPoints);
    const rankedTeams = sortedTeams.map((team, index) => ({
        id: team.id,
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
                
                // Add action buttons for admins
                actualUserData().then(currentUserData => {
                    if (currentUserData.admin == true) {
                        addAdminActionButtons(article, teams, currentUserData)
                    }
                })
                
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

// Function to add admin action buttons (edit and delete) - shared between loadMyTeams and loadTeams
function addAdminActionButtons(article, teamData, userData) {
    // Create container for action buttons
    let actionContainer = document.createElement("div")
    article.insertAdjacentElement("beforeend", actionContainer)
    actionContainer.classList.add("teamsCard__actions")
    
    // Add edit button
    let editBtn = document.createElement("button")
    actionContainer.appendChild(editBtn)
    editBtn.classList.add("teamsCard__editBtn")
    editBtn.innerHTML = `<ion-icon name="create-outline"></ion-icon>`
    editBtn.onclick = (evt) => {
        evt.stopPropagation()
        openEditTeamModal(teamData)
    }
    
    // Add delete button
    let deleteBtn = document.createElement("button")
    actionContainer.appendChild(deleteBtn)
    deleteBtn.classList.add("teamsCard__deleteBtn")
    deleteBtn.innerHTML = `<ion-icon name="trash-outline"></ion-icon>`
    deleteBtn.onclick = (evt) => {
        evt.stopPropagation()
        activeConfirmSection("Deseja excluir este time?", "Esta ação não poderá ser desfeita", "#f00", "sad").then(res => {
            if (res == "confirmed") {
                // Delete the team using its document ID
                deleteThis(`${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_teams`, teamData.id).then(res => {
                    alertThis("Time deletado com sucesso", "sucess")
                    loadTeams() // Reload the teams list
                    actualUserData().then(loadMyTeams) // Reload my teams list
                })
            }
        })
    }
}

async function loadTeams() {
    actualUserData().then(async (userData) => {
        let firtsAllTeamsDiv = document.getElementById("firtsAllTeamsDiv");
        let allTeamsDiv = document.getElementById("allTeamsDiv");
        firtsAllTeamsDiv.innerHTML = ""
        let teamsArray = []
        const querySnapshot = await getDocs(collection(db, `${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_teams`));
        querySnapshot.forEach((doc) => {
            // For admins, show all teams; for regular users, filter by class and room
            if (userData.admin == true || (doc.data().teamclass == userData.class && doc.data().teamRoom == userData.room)) {
                // Add document ID to the team data
                teamsArray.push({
                    id: doc.id,
                    ...doc.data()
                })
            }
        })
        const sortedTeams = teamsArray.sort((a, b) => b.teamPoints - a.teamPoints);
        const rankedTeams = sortedTeams.map((team, index) => ({
            id: team.id,
            teamPosition: index + 1,
            teamUsers: team.teamUsers,
            teamName: team.teamName,
            teamPoints: team.teamPoints,
            teamclass: team.teamclass,
            teamRoom: team.teamRoom
        }));
        firtsAllTeamsDiv.innerHTML = ""
        allTeamsDiv.innerHTML = ""
        
        // Function to create a team card
        function createTeamCard(teamData, isTopThree) {
            let article = document.createElement("article")
            article.classList.add("teamsCard")
            
            if (isTopThree) {
                firtsAllTeamsDiv.insertAdjacentElement("beforeend", article)
            } else {
                allTeamsDiv.insertAdjacentElement("beforeend", article)
            }
            
            article.innerHTML = `
                <div class="teamsCard__div--1">
                    <p class="teamsCard__name">${teamData.teamName}</p>
                    <div class="teamsCard__div--2">
                    </div>
                </div>
                <div class="teamsCard__div--3">
                    <span class="teamsCard__position">${teamData.teamPosition}º</span>
                    <p class="teamsCard__points">${teamData.teamPoints} Pontos</p>
                </div>`
            
            article.classList.add(`position-${teamData.teamPosition}`)
            loadUserPhoto(teamData.teamUsers, article.children[0].children[1])
            
            // Add action buttons for admins
            if (userData.admin == true) {
                addAdminActionButtons(article, teamData, userData)
            }
            
            return article
        }
        
        // Create cards for top 3 teams
        for (let index = 0; index < 3; index++) {
            if (rankedTeams[index] != undefined) {
                createTeamCard(rankedTeams[index], true)
            }
        }
        
        // Create cards for remaining teams
        rankedTeams.forEach(element => {
            if (element.teamPosition > 3) {
                createTeamCard(element, false)
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

let currentEditedTeam = null;
let currentTeamMembers = [];

function openEditTeamModal(teamData) {
    currentEditedTeam = teamData;
    currentTeamMembers = [...teamData.teamUsers]; // Make a copy of the team members
    
    // Create modal overlay
    let modalOverlay = document.createElement("div");
    modalOverlay.className = "team-edit-modal-overlay";
    document.body.appendChild(modalOverlay);
    
    // Create modal content
    let modalContent = document.createElement("div");
    modalContent.className = "team-edit-modal";
    modalOverlay.appendChild(modalContent);
    
    // Modal header
    let modalHeader = document.createElement("div");
    modalHeader.className = "team-edit-modal-header";
    modalHeader.innerHTML = `
        <h2>Editar Time: ${teamData.teamName}</h2>
        <button class="team-edit-modal-close">&times;</button>
    `;
    modalContent.appendChild(modalHeader);
    
    // Modal body
    let modalBody = document.createElement("div");
    modalBody.className = "team-edit-modal-body";
    modalBody.innerHTML = `
        <div class="team-edit-form">
            <div class="team-edit-field">
                <label for="editTeamName">Nome do Time:</label>
                <input type="text" id="editTeamName" value="${teamData.teamName}">
            </div>
            <div class="team-edit-field">
                <label for="editTeamPoints">Pontos do Time:</label>
                <input type="number" id="editTeamPoints" value="${teamData.teamPoints}" min="0">
            </div>
            <div class="team-edit-field">
                <label for="editTeamClass">Turma:</label>
                <select id="editTeamClass">
                    <option value="1" ${teamData.teamclass === "1" ? "selected" : ""}>1°</option>
                    <option value="2" ${teamData.teamclass === "2" ? "selected" : ""}>2°</option>
                    <option value="3" ${teamData.teamclass === "3" ? "selected" : ""}>3°</option>
                    <option value="4" ${teamData.teamclass === "4" ? "selected" : ""}>4°</option>
                    <option value="5" ${teamData.teamclass === "5" ? "selected" : ""}>5°</option>
                    <option value="6" ${teamData.teamclass === "6" ? "selected" : ""}>6°</option>
                    <option value="7" ${teamData.teamclass === "7" ? "selected" : ""}>7°</option>
                </select>
            </div>
            <div class="team-edit-field">
                <label for="editTeamRoom">Sala:</label>
                <select id="editTeamRoom">
                    <option value="A" ${teamData.teamRoom === "A" ? "selected" : ""}>A</option>
                    <option value="B" ${teamData.teamRoom === "B" ? "selected" : ""}>B</option>
                    <option value="C" ${teamData.teamRoom === "C" ? "selected" : ""}>C</option>
                </select>
            </div>
            <div class="team-edit-members">
                <h3>Membros do Time:</h3>
                <div id="editTeamMembersList"></div>
                <button type="button" id="addTeamMemberBtn">Adicionar Membro</button>
            </div>
        </div>
    `;
    modalContent.appendChild(modalBody);
    
    // Modal footer
    let modalFooter = document.createElement("div");
    modalFooter.className = "team-edit-modal-footer";
    modalFooter.innerHTML = `
        <button type="button" id="saveTeamChanges">Salvar Alterações</button>
        <button type="button" id="cancelTeamEdit">Cancelar</button>
    `;
    modalContent.appendChild(modalFooter);
    
    // Load team members
    loadTeamMembersForEdit();
    
    // Use setTimeout to ensure DOM is fully rendered before attaching event listeners
    setTimeout(() => {
        // Event listeners
        modalContent.querySelector(".team-edit-modal-close").onclick = closeModal;
        modalContent.querySelector("#cancelTeamEdit").onclick = closeModal;
        modalContent.querySelector("#saveTeamChanges").onclick = saveTeamChanges;
        modalContent.querySelector("#addTeamMemberBtn").onclick = openAddMemberModal;
    }, 0);
    
    // Close modal when clicking outside
    modalOverlay.onclick = function(event) {
        if (event.target === modalOverlay) {
            closeModal();
        }
    };
    
    function closeModal() {
        document.body.removeChild(modalOverlay);
        currentEditedTeam = null;
        currentTeamMembers = [];
    }
}

function loadTeamMembersForEdit() {
    let membersList = document.getElementById("editTeamMembersList");
    membersList.innerHTML = "";
    
    currentTeamMembers.forEach((member, index) => {
        let memberDiv = document.createElement("div");
        memberDiv.className = "team-member-item";
        memberDiv.innerHTML = `
            <div class="team-member-info">
                <div><strong>${member.name}</strong></div>
                <div><small>${member.email}</small></div>
            </div>
            <div class="team-member-actions">
                <select class="member-role-select" data-index="${index}">
                    <option value="null" ${member.specialization === null ? "selected" : ""}>Sem função</option>
                    <option value="Programador" ${member.specialization === "Programador" ? "selected" : ""}>Programador</option>
                    <option value="Lider" ${member.specialization === "Lider" ? "selected" : ""}>Lider</option>
                    <option value="Designer" ${member.specialization === "Designer" ? "selected" : ""}>Designer</option>
                    <option value="Montador" ${member.specialization === "Montador" ? "selected" : ""}>Montador</option>
                    <option value="Organizador" ${member.specialization === "Organizador" ? "selected" : ""}>Organizador</option>
                    <option value="Vice lider" ${member.specialization === "Vice lider" ? "selected" : ""}>Vice lider</option>
                </select>
                <button type="button" class="remove-member-btn" data-index="${index}">Remover</button>
            </div>
        `;
        membersList.appendChild(memberDiv);
    });
    
    // Add event listeners for role changes and removal
    document.querySelectorAll(".member-role-select").forEach(select => {
        select.onchange = function() {
            updateMemberRole(select.dataset.index, select.value);
        };
    });
    
    document.querySelectorAll(".remove-member-btn").forEach(button => {
        button.onclick = function() {
            removeTeamMember(button.dataset.index);
        };
    });
}

function updateMemberRole(index, role) {
    if (currentTeamMembers[index]) {
        currentTeamMembers[index].specialization = role === "null" ? null : role;
    }
}

function removeTeamMember(index) {
    currentTeamMembers.splice(index, 1);
    loadTeamMembersForEdit(); // Reload the member list
}

function saveTeamChanges() {
    if (!currentEditedTeam) return;
    
    // Get updated values
    let updatedName = document.getElementById("editTeamName").value;
    let updatedPoints = parseInt(document.getElementById("editTeamPoints").value) || 0;
    let updatedClass = document.getElementById("editTeamClass").value;
    let updatedRoom = document.getElementById("editTeamRoom").value;
    
    // Validate inputs
    if (!updatedName.trim()) {
        alertThis("Por favor, informe o nome do time", "error");
        return;
    }
    
    // Ensure points is a non-negative number
    if (updatedPoints < 0) {
        updatedPoints = 0;
    }
    
    // Update team in Firestore
    const teamRef = doc(db, `${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_teams`, currentEditedTeam.id);
    updateDoc(teamRef, {
        teamName: updatedName,
        teamPoints: updatedPoints,
        teamclass: updatedClass,
        teamRoom: updatedRoom,
        teamUsers: currentTeamMembers
    }).then(() => {
        alertThis("Time atualizado com sucesso!", "sucess");
        // Close modal
        document.querySelector(".team-edit-modal-overlay").click();
        // Reload teams
        loadTeams();
        actualUserData().then(loadMyTeams);
    }).catch((error) => {
        alertThis("Erro ao atualizar time: " + error.message, "error");
    });
}

// Global variables for the user selection interface
let globalUserSelectionCallback = null;
let globalSelectedUsers = [];

// Function to show the global user selection interface
function showGlobalUserSelection(callback) {
    globalUserSelectionCallback = callback;
    globalSelectedUsers = [];
    
    const overlay = document.getElementById("globalUserSelectionOverlay");
    const userList = document.getElementById("globalUserList");
    
    // Clear the user list
    userList.innerHTML = "";
    
    // Show the overlay
    overlay.style.display = "flex";
    
    // Load users
    loadGlobalUsers();
}

// Function to hide the global user selection interface
function hideGlobalUserSelection() {
    const overlay = document.getElementById("globalUserSelectionOverlay");
    overlay.style.display = "none";
    globalUserSelectionCallback = null;
    globalSelectedUsers = [];
}

// Function to load users for the global selection interface
function loadGlobalUsers() {
    const userList = document.getElementById("globalUserList");
    userList.innerHTML = "<p>Carregando usuários...</p>";
    
    getDocs(collection(db, `${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_users`))
        .then((querySnapshot) => {
            userList.innerHTML = "";
            
            if (querySnapshot.empty) {
                userList.innerHTML = "<p>Nenhum usuário encontrado.</p>";
                return;
            }
            
            querySnapshot.forEach((usersData) => {
                const userData = usersData.data();
                
                let userElement = document.createElement("div");
                userElement.className = "global-user-selection-user";
                userElement.innerHTML = `
                    <img class="global-user-selection-user-img" src="" alt="">
                    <div class="global-user-selection-user-info">
                        <p class="global-user-selection-user-name">${userData.name}</p>
                        <p class="global-user-selection-user-email">${userData.email}</p>
                        <span class="global-user-selection-user-classroom">${userData.class}${userData.room}</span>
                    </div>
                `;
                
                // Set user image
                if (userData.noPhoto == true) {
                    userElement.querySelector(".global-user-selection-user-img").src = "https://img.freepik.com/vetores-gratis/ilustracao-do-icone-da-lampada_53876-43730.jpg?w=740&t=st=1705192551~exp=1705193151~hmac=3347369c888609a6def2a1cd13bfb02dc519c8fbc965419dd1b5f091ef79982d";
                } else {
                    getDownloadURL(ref(storage, `${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_users/${userData.email}/photo`))
                        .then((url) => {
                            userElement.querySelector(".global-user-selection-user-img").src = url;
                        })
                        .catch((error) => {
                            userElement.querySelector(".global-user-selection-user-img").src = "https://img.freepik.com/vetores-gratis/ilustracao-do-icone-da-lampada_53876-43730.jpg?w=740&t=st=1705192551~exp=1705193151~hmac=3347369c888609a6def2a1cd13bfb02dc519c8fbc965419dd1b5f091ef79982d";
                        });
                }
                
                // Check if user is already selected
                const isSelected = globalSelectedUsers.some(user => user.email === userData.email);
                if (isSelected) {
                    userElement.classList.add("active");
                }
                
                // Add click event
                userElement.onclick = function() {
                    const userObj = {
                        email: userData.email,
                        name: userData.name,
                        classRoom: `${userData.class}${userData.room}`,
                        specialization: null
                    };
                    
                    // Toggle selection
                    const selectedIndex = globalSelectedUsers.findIndex(user => user.email === userData.email);
                    if (selectedIndex >= 0) {
                        // Remove from selection
                        globalSelectedUsers.splice(selectedIndex, 1);
                        userElement.classList.remove("active");
                    } else {
                        // Add to selection
                        globalSelectedUsers.push(userObj);
                        userElement.classList.add("active");
                    }
                };
                
                userList.appendChild(userElement);
            });
        })
        .catch((error) => {
            console.error("Error loading users:", error);
            userList.innerHTML = "<p>Erro ao carregar usuários.</p>";
        });
}

// Event listeners for global user selection interface
document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.getElementById("globalUserSelectionOverlay");
    const closeBtn = document.getElementById("closeGlobalUserSelection");
    const cancelBtn = document.getElementById("cancelGlobalUserSelection");
    const confirmBtn = document.getElementById("confirmGlobalUserSelection");
    
    if (overlay && closeBtn && cancelBtn && confirmBtn) {
        // Close button
        closeBtn.onclick = function() {
            hideGlobalUserSelection();
        };
        
        // Cancel button
        cancelBtn.onclick = function() {
            hideGlobalUserSelection();
        };
        
        // Confirm button
        confirmBtn.onclick = function() {
            if (globalUserSelectionCallback) {
                globalUserSelectionCallback(globalSelectedUsers);
            }
            hideGlobalUserSelection();
        };
        
        // Close when clicking outside
        overlay.onclick = function(event) {
            if (event.target === overlay) {
                hideGlobalUserSelection();
            }
        };
    }
});

// Update the openAddMemberModal function to use the global user selection
function openAddMemberModal() {
    // Show the global user selection interface
    showGlobalUserSelection(function(selectedUsers) {
        // Add selected users to the team
        selectedUsers.forEach(person => {
            // Check if user is already in the team
            const isAlreadyInTeam = currentTeamMembers.some(member => member.email === person.email);
            if (!isAlreadyInTeam) {
                currentTeamMembers.push({
                    email: person.email,
                    name: person.name,
                    classRoom: person.classRoom,
                    specialization: null
                });
            }
        });
        
        // Reload the member list
        loadTeamMembersForEdit();
    });
}
