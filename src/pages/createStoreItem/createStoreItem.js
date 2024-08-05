import { activeLoading } from "../../components/uploadingSection/uploadingSection"
import { alertThis } from "../../components/alerts/alert"
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot, addDoc, collection, query, where, getDocs, serverTimestamp, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadString, deleteObject, uploadBytesResumable, getDownloadURL, uploadBytes } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
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

let storeItemImageFile = document.getElementById('storeItemImage')
let createStoreItemBtn = document.getElementById("createStoreItemBtn")

storeItemImageFile.onchange = function () {
    if (storeItemImageFile.files && storeItemImageFile.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            document.getElementById('storeItemPreviewImg').src = e.target.result;
            storeItemImageFile.parentNode.style.background = "#000"
        }
        reader.readAsDataURL(storeItemImageFile.files[0]);
    }
}

createStoreItemBtn.onclick = async function () {
    let storeItemName = document.getElementById("storeItemName").value
    let storeItemImage = document.getElementById('storeItemPreviewImg').src
    let storeItemPrice = document.getElementById("storeItemPrice").value
    createStoreItemBtn.disabled = true
    if (storeItemName != "" && storeItemImage != window.location.href && storeItemPrice != "") {
        let uploadsCompleteds = 0
        activeLoading(uploadsCompleteds)
        let docRef = await addDoc(collection(db, "store"), {
            name: `${storeItemName}`,
            price: Number(storeItemPrice),
        });
        uploadsCompleteds = uploadsCompleteds + 50
        activeLoading(uploadsCompleteds)
        if (uploadsCompleteds == 100) {
            alertThis("Aula criada com sucesso", "sucess")
            createStoreItemBtn.disabled = false
            clearInputs()
        }

        let storageRef = ref(storage, `store/${docRef.id}/image`);
        uploadString(storageRef, storeItemImage, 'data_url').then((snapshot) => {
            uploadsCompleteds = uploadsCompleteds + 50
            activeLoading(uploadsCompleteds)
            if (uploadsCompleteds == 100) {
                alertThis("Aula criada com sucesso", "sucess")
                createStoreItemBtn.disabled = false
                clearInputs()
            }
        });
    } else {
        alertThis("Preencha todos os campos", "")
        createStoreItemBtn.disabled = false
    }
}


function clearInputs() {
    let storeItemImage = document.getElementById('storeItemPreviewImg')
    document.getElementById("storeItemName").value = ""
    document.getElementById("storeItemPrice").value = ""
    storeItemImage.src = ""
    storeItemImage.parentNode.style.background = "#fff"
}