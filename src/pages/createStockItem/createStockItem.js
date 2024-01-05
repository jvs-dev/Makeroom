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

let StockItemImageFile = document.getElementById('StockItemImage')
let createStockItemBtn = document.getElementById("createStockItemBtn")

StockItemImageFile.onchange = function () {
    if (StockItemImageFile.files && StockItemImageFile.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            document.getElementById('stockItemPreviewImg').src = e.target.result;
            StockItemImageFile.parentNode.style.background = "#000"
        }
        reader.readAsDataURL(StockItemImageFile.files[0]);
    }
}

createStockItemBtn.onclick = async function () {
    let StockItemName = document.getElementById("StockItemName").value
    let StockItemImage = document.getElementById('stockItemPreviewImg').src
    let StockItemQuanty = document.getElementById("StockItemQuanty").value
    createStockItemBtn.disabled = true
    if (StockItemName != "" && StockItemImage != window.location.href && StockItemQuanty != "") {
        let uploadsCompleteds = 0
        activeLoading(uploadsCompleteds)
        let docRef = await addDoc(collection(db, "stockItem"), {
            StockItemName: `${StockItemName}`,
            StockItemQuanty: Number(StockItemQuanty),
        });
        uploadsCompleteds = uploadsCompleteds + 50
        activeLoading(uploadsCompleteds)
        if (uploadsCompleteds == 100) {
            alertThis("Aula criada com sucesso", "sucess")
            createStockItemBtn.disabled = false
            clearInputs()
        }

        let storageRef = ref(storage, `stockItem/${docRef.id}/image`);
        uploadString(storageRef, StockItemImage, 'data_url').then((snapshot) => {
            uploadsCompleteds = uploadsCompleteds + 50
            activeLoading(uploadsCompleteds)
            if (uploadsCompleteds == 100) {
                alertThis("Aula criada com sucesso", "sucess")
                createStockItemBtn.disabled = false
                clearInputs()
            }
        });
    } else {
        alertThis("Preencha todos os campos", "")
        createStockItemBtn.disabled = false
    }
}


function clearInputs() {
    let StockItemImage = document.getElementById('stockItemPreviewImg')
    document.getElementById("StockItemName").value = ""
    document.getElementById("StockItemQuanty").value = ""
    StockItemImage.src = ""
    StockItemImage.parentNode.style.background = "#fff"
}