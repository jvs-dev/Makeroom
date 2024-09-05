import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot, addDoc, collection, getDoc, query, where, getDocs, serverTimestamp, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadString, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
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

function actualDate() {
    var data = new Date();
    var dia = resetDate(data.getDate());
    var mes = resetDate(data.getMonth() + 1);
    var ano = resetDate(data.getFullYear() % 100);
    return dia + '/' + mes + '/' + ano;
}
function resetDate(numero) {
    return numero < 10 ? '0' + numero : numero;
}
function actualTime() {
    var data = new Date();
    var horas = resetTime(data.getHours());
    var minutos = resetTime(data.getMinutes());
    return horas + ':' + minutos;
}
function resetTime(numero) {
    return numero < 10 ? '0' + numero : numero;
}

var horaAtualFormatada = actualTime();
let dataAtualFormatada = actualDate();





export async function postComment(databaseName, id, email, text) {
    return new Promise(async resolve => {
        const docRef = await addDoc(collection(db, `${databaseName}`, `${id}`, "coments"), {
            timestamp: serverTimestamp(),
            date: `${dataAtualFormatada}`,
            time: `${horaAtualFormatada}`,
            email: `${email}`,
            text: `${text}`
        });
        resolve(docRef.id);
    })
}


export async function getThisComment(databaseName, id, comentId) {
    return new Promise(async resolve => {
        const docRef = doc(db, `${databaseName}`, `${id}`, "coments", `${comentId}`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            resolve(docSnap.data())
        } else {
            resolve("No such document!");
        }
    })
}