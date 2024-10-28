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
let lessonMask = document.getElementById('lessonMask')
let lessonVideo = document.getElementById("lessonVideo")
let lessonExtraFile = document.getElementById('lessonExtraFile');
let selectClassRoom = document.querySelectorAll(".createLessonSection__selectClassRoom")
let lessonSelected = []
let createLessonBtn = document.getElementById("createLessonBtn")
let uploadsCompleteds = 0

selectClassRoom.forEach(element => {
    element.onclick = function () {
        if (element.classList.contains("active")) {
            element.classList.remove("active")
            lessonSelected.splice(lessonSelected.indexOf(`${element.id.replace("lessonFor", "")}`), 1)
        } else {
            element.classList.add("active")
            lessonSelected.push(`${element.id.replace("lessonFor", "")}`)
        }
    }
});

lessonMask.onchange = function () {
    if (lessonMask.files && lessonMask.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            document.getElementById('lessonPreviewImg').src = e.target.result;
            lessonMask.parentNode.style.background = "#1e1e1e"
        }
        reader.readAsDataURL(lessonMask.files[0]);
    }
}

lessonVideo.onchange = function () {
    let videoPreview = document.getElementById('lessonPreviewVideo')
    if (lessonVideo.files && lessonVideo.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            videoPreview.src = e.target.result;
            videoPreview.autoplay = true
            videoPreview.loop = true
            videoPreview.muted = true
            lessonVideo.parentNode.style.background = "#1e1e1e"
        }
        reader.readAsDataURL(lessonVideo.files[0]);
    }
}


lessonExtraFile.onchange = function () {
    let previewLessonExtraFile = document.getElementById('previewLessonExtraFile');

    if (lessonExtraFile.files && lessonExtraFile.files.length > 0) {
        previewLessonExtraFile.innerHTML = `<ion-icon style="color: #f00;" name="trash-outline"></ion-icon> ${lessonExtraFile.files[0].name}`
        previewLessonExtraFile.children[0].onclick = function () {
            lessonExtraFile.value = '';
            previewLessonExtraFile.innerHTML = '';
        }
    } else {
        previewLessonExtraFile.innerHTML = '';
    }
}

createLessonBtn.onclick = async function () {
    let lessonIntroValue = document.getElementById("lessonIntro").value
    let lessonTitleValue = document.getElementById("lessonTitle").value
    let lessonMaskSrc = document.getElementById('lessonPreviewImg').src
    let lessonVideoSrc = document.getElementById('lessonPreviewVideo').src
    let lessonExtraFile = document.getElementById('lessonExtraFile').files[0]
    let lessonCategoryValue = document.getElementById("lessonCategory").value
    let existsExtraFile = false
    if (lessonExtraFile == undefined) {
        existsExtraFile = false
    } else {
        existsExtraFile = true
    }
    createLessonBtn.disabled = true
    if (lessonTitleValue != "" && lessonIntroValue != "" && lessonMaskSrc != window.location.href && lessonVideoSrc != window.location.href && lessonCategoryValue != "" && lessonSelected.length != 0) {
        uploadsCompleteds = 0
        activeLoading(uploadsCompleteds)
        let docRef = await addDoc(collection(db, `${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_lessons`), {
            lessonIntro: `${lessonIntroValue}`,
            lessonTitle: `${lessonTitleValue}`,
            lessonCategory: `${lessonCategoryValue}`,
            lessonClass: lessonSelected,
            existsExtraFile: existsExtraFile
        });
        uploadsCompleteds = uploadsCompleteds + 25
        activeLoading(uploadsCompleteds)
        if (uploadsCompleteds == 100) {
            alertThis("Aula criada com sucesso", "sucess")
            createLessonBtn.disabled = false
            clearInputs()
        }        

        let storageRef = ref(storage, `${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_lessons/${docRef.id}/mask`);
        uploadString(storageRef, lessonMaskSrc, 'data_url').then((snapshot) => {
            uploadsCompleteds = uploadsCompleteds + 25
            activeLoading(uploadsCompleteds)
            if (uploadsCompleteds == 100) {
                alertThis("Aula criada com sucesso", "sucess")
                createLessonBtn.disabled = false
                clearInputs()
            }
        });


        let storageRef2 = ref(storage, `${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_lessons/${docRef.id}/video`);
        uploadString(storageRef2, lessonVideoSrc, 'data_url').then((snapshot) => {
            uploadsCompleteds = uploadsCompleteds + 25
            activeLoading(uploadsCompleteds)
            if (uploadsCompleteds == 100) {
                alertThis("Aula criada com sucesso", "sucess")
                createLessonBtn.disabled = false
                clearInputs()
            }
        });
        if (lessonExtraFile != undefined) {
            const storageRef3 = ref(storage, `${localStorage.getItem("schoolIndex") != undefined ? `${localStorage.getItem("schoolIndex")}` : "0"}_lessons/${docRef.id}/extraFile`);
            uploadBytes(storageRef3, lessonExtraFile).then((snapshot) => {
                uploadsCompleteds = uploadsCompleteds + 25
                activeLoading(uploadsCompleteds)
                if (uploadsCompleteds == 100) {
                    alertThis("Aula criada com sucesso", "sucess")
                    createLessonBtn.disabled = false
                    clearInputs()
                }
            });
        } else {
            uploadsCompleteds = uploadsCompleteds + 25
            activeLoading(uploadsCompleteds)
            if (uploadsCompleteds == 100) {
                alertThis("Aula criada com sucesso", "sucess")
                createLessonBtn.disabled = false
                clearInputs()
            }
        }
    } else {
        alertThis("Preencha todos os campos", "")
        createLessonBtn.disabled = false
    }
}



function clearInputs() {
    document.getElementById("lessonTitle").value = ""
    document.getElementById('lessonPreviewImg').src = ""
    document.getElementById('lessonPreviewVideo').src = ""
    document.getElementById('lessonExtraFile').value = ''
    document.getElementById("previewLessonExtraFile").innerHTML = '';
    lessonSelected = []
    selectClassRoom.forEach(element => {
        element.classList.remove("active")
    });
    lessonMask.parentNode.style.background = "#fff"
    lessonVideo.parentNode.style.background = "#fff"
}



