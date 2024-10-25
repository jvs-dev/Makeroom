import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot, addDoc, collection, query, updateDoc, where, increment, getDoc, arrayUnion, arrayRemove, getDocs, serverTimestamp, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadString, deleteObject, uploadBytesResumable, getDownloadURL, uploadBytes } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { activeLoading } from "../../components/uploadingSection/uploadingSection";
import { activeConfirmSection } from "../../components/confirmSection/confirmSection";
import { deleteAllFiles, deleteAllsubDocs, deleteFiles, deleteThis } from "../../scripts/deleteThis";
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

let notesSearchInput = document.getElementById("notesSearchInput")
let notesAddBtn = document.getElementById("notesAddBtn")
let noteMap = document.getElementById("noteMap")
let notesFirstDiv = document.getElementById("notesFirstDiv")
let notesSubDiv = document.getElementById("notesSubDiv")
let folderNotes = document.getElementById("folderNotes")
let createNote = document.getElementById("createNote")
let thisFolder = null
let backNotesBtn = document.getElementById("backNotesBtn")
let numberOfNotes = 0
let createFolder = document.getElementById("createFolder")
let notesSubFolders = document.getElementById("notesSubFolders")


backNotesBtn.onclick = async function () {
    if (thisFolder != null) {
        const docRef = doc(db, "notes", `${thisFolder}`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            if (docSnap.data().parent == null) {
                thisFolder = null
                noteMap.textContent = `Notas`
                notesSubDiv.style.display = "none"
                notesFirstDiv.style.display = "flex"
            } else {
                thisFolder = docSnap.data().parent
                loadSubFolders(thisFolder)
                loadNotes(thisFolder)
            }
        }
    }
}

createFolder.onclick = async function () {
    let docRef = await addDoc(collection(db, "notes"), {
        folderName: `Subpasta`,
        allNotes: [],
        parent: thisFolder
    });
    loadSubFolders(thisFolder)
}

notesSearchInput.onchange = () => {
    loadFolders()
}

notesSearchInput.oninput = () => {
    if (notesSearchInput.value == "") {
        loadFolders()
    }
}

createNote.onclick = async function () {
    const washingtonRef = doc(db, "notes", `${thisFolder}`);
    await updateDoc(washingtonRef, {
        allNotes: arrayUnion({ text: `Nota ${numberOfNotes}`, status: false })
    });
    loadNotes(thisFolder)
}

async function loadNotes(folderId) {
    folderNotes.innerHTML = ""
    const docRef = doc(db, "notes", `${folderId}`);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        thisFolder = docSnap.id
        loadSubFolders(thisFolder)
        noteMap.textContent = `Notas > ${docSnap.data().folderName}`
        notesSubDiv.style.display = "flex"
        notesFirstDiv.style.display = "none"
        let i = 0
        let arr = docSnap.data().allNotes
        numberOfNotes = docSnap.data().allNotes.length
        docSnap.data().allNotes.forEach((element, index) => {
            let noteCard = document.createElement("article")
            let checkBox = document.createElement("input")
            let textarea = document.createElement("textarea")
            textarea.rows = "3"
            textarea.classList.add("noteCard__p")
            textarea.value = `${element.text}`
            if (element.status == true) {
                textarea.classList.add("resolved")
            }
            checkBox.type = "checkbox"
            checkBox.classList.add("noteCard__check")
            let actualStatus = element.status
            checkBox.checked = actualStatus
            if (actualStatus == true) {
                checkBox.classList.add("resolved")
            } else {
                checkBox.classList.remove("resolved")
            }
            folderNotes.insertAdjacentElement("beforeend", noteCard)
            noteCard.classList.add("noteCard")
            noteCard.classList.add(`index--${i}`)
            switch (i) {
                case 1:
                    i = 0
                    break;
                default:
                    i = 1
                    break;
            }
            noteCard.innerHTML = `                        
                    <div class="noteCard__div">
                        <label class="checkBox container">                            
                            <svg viewBox="-14 5 105 105" height="2em" width="2em">
                            <path
                                d="M 0 16 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 16 L 32 48 L 64 16 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 16"
                                pathLength="575.0541381835938" class="path"></path>
                            </svg>
                        </label>
                        <button class="noteCard__trash" type="button"><ion-icon name="trash-outline"></ion-icon></button>
                    </div>`
            noteCard.children[0].children[0].insertAdjacentElement("afterbegin", checkBox)
            noteCard.insertAdjacentElement("beforeend", textarea)
            textarea.oninput = async function () {
                arr[index] = { status: actualStatus, text: `${textarea.value}` }
                const washingtonRef = doc(db, `notes`, `${thisFolder}`);
                await updateDoc(washingtonRef, {
                    allNotes: arr
                });
            }
            checkBox.onclick = async function () {
                actualStatus = !actualStatus
                arr[index] = { status: actualStatus, text: `${element.text}` }
                const washingtonRef = doc(db, `notes`, `${thisFolder}`);
                await updateDoc(washingtonRef, {
                    allNotes: arr
                });
                noteCard.children[1].classList.remove("resolved")
                noteCard.children[1].classList.add(`${actualStatus == true ? "resolved" : ""}`)
            }
        });
    }

}

notesAddBtn.onclick = async function () {
    let docRef = await addDoc(collection(db, "notes"), {
        folderName: `${notesSearchInput.value}`,
        allNotes: [],
        parent: thisFolder
    });
    notesSearchInput.value = ""
    loadFolders()
}

async function loadFolders() {
    if (thisFolder == null) {
        let notesDiv = document.getElementById("notesDiv")
        notesDiv.innerHTML = ""
        const querySnapshot = await getDocs(collection(db, "notes"));
        querySnapshot.forEach((noteDoc) => {
            if (noteDoc.data().parent == null) {
                let article = document.createElement("article")
                if (notesSearchInput.value != "") {
                    if (noteDoc.data().folderName.toLowerCase().includes(`${notesSearchInput.value.toLowerCase()}`) == true) {
                        notesDiv.insertAdjacentElement("beforeend", article)
                        article.classList.add("noteFolder")
                    }
                } else {
                    notesDiv.insertAdjacentElement("beforeend", article)
                    article.classList.add("noteFolder")
                }
                article.innerHTML = `
                <ion-icon class="noteFolder__icon" name="folder-open-outline"></ion-icon>
                <p class="noteFolder__text">${noteDoc.data().folderName}</p>
                <div class="noteFolder__div">
                    <ion-icon name="create-outline"></ion-icon>
                    <ion-icon name="trash-outline"></ion-icon>
                </div>
              `
                article.children[2].children[1].onclick = (evt) => {
                    evt.stopPropagation()
                    activeConfirmSection("Deseja realmente apagar?", "Esta ação não poderá ser desfeita", "#f00", "sad").then(async (res) => {
                        if (res == "confirmed") {
                            let uploadsCompleteds = 0
                            const q = query(collection(db, "notes"), where("parent", "==", `${noteDoc.id}`));
                            const querySnapshot = await getDocs(q);
                            querySnapshot.forEach((subDocs) => {
                                deleteThis("notes", `${subDocs.id}`)
                            })
                            activeLoading(uploadsCompleteds)
                            deleteThis("notes", `${noteDoc.id}`).then(res => {
                                uploadsCompleteds = uploadsCompleteds + 100
                                activeLoading(uploadsCompleteds)
                                if (uploadsCompleteds == 100) {
                                    alertThis("Pasta deletada com sucesso", "sucess")
                                    loadFolders()
                                    if (thisFolder != null) {
                                        loadSubFolders(thisFolder)
                                    }
                                }
                            })
                        }
                    })
                }
                article.onclick = () => {
                    loadNotes(noteDoc.id)
                }
            }
        })
    }
}

async function loadSubFolders(folderId) {
    notesSubFolders.innerHTML = ""
    const q = query(collection(db, "notes"), where("parent", "==", `${folderId}`));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        let article = document.createElement("article")
        notesSubFolders.insertAdjacentElement("beforeend", article)
        article.classList.add("noteFolder")
        article.innerHTML = `
                <ion-icon class="noteFolder__icon" name="folder-open-outline"></ion-icon>
                <p class="noteFolder__text">${doc.data().folderName}</p>
                <div class="noteFolder__div">
                    <ion-icon name="create-outline"></ion-icon>
                    <ion-icon name="trash-outline"></ion-icon>
                </div>
              `
        article.children[2].children[1].onclick = (evt) => {
            evt.stopPropagation()
            activeConfirmSection("Deseja realmente apagar?", "Esta ação não poderá ser desfeita", "#f00", "sad").then(async (res) => {
                if (res == "confirmed") {
                    let uploadsCompleteds = 0
                    const q = query(collection(db, "notes"), where("parent", "==", `${doc.id}`));
                    const querySnapshot = await getDocs(q);
                    querySnapshot.forEach((subDocs) => {
                        deleteThis("notes", `${subDocs.id}`)
                    })
                    activeLoading(uploadsCompleteds)
                    deleteThis("notes", `${doc.id}`).then(res => {
                        uploadsCompleteds = uploadsCompleteds + 100
                        activeLoading(uploadsCompleteds)
                        if (uploadsCompleteds == 100) {
                            alertThis("Pasta deletada com sucesso", "sucess")
                            loadFolders()
                            if (thisFolder != null) {
                                loadSubFolders(thisFolder)
                            }
                        }
                    })
                }
            })
        }
        article.onclick = () => {
            loadNotes(doc.id)
        }
    })
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        const uid = user.uid;
        loadFolders()
    }
});