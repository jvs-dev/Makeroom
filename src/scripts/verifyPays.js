import { actualUserData, thisUserData, actualUserEmail } from "./returnUserInfos"
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot, addDoc, collection, query, updateDoc, where, increment, getDoc, getDocs, serverTimestamp, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadString, deleteObject, uploadBytesResumable, getDownloadURL, uploadBytes } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { notifyThis } from '../components/notify/notify';
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

setInterval(async () => {
    let q = query(collection(db, "payments"), where("paymentStatus", "==", "pending"));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        verifyPay(doc.data(), doc.id)
    });
}, 3000);

async function getPayData(id) {
    return new Promise(resolve => {
        let requestBody = {
            payId: id,
        };
        let requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        };
        fetch('https://makeroom-payment.vercel.app/api/getPay', requestOptions)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao enviar requisição: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                resolve(data)
            })
    })
}

async function deletePay(id) {
    await deleteDoc(doc(db, "payments", `${id}`));
}

async function userPayed(userData, id, payData, vouncherData) {
    const paymentRef = doc(db, "payments", `${id}`);
    await updateDoc(paymentRef, {
        paymentStatus: `${payData.result.status}`
    });
    notifyThis(`Pagamento foi confirmado`, `Seus itens serão entregues em breve!`).then(async (res) => {
        if (res == "closed") {
            await updateDoc(paymentRef, {
                noticed: true
            });
        }
    })
    //...
}

function verifyPay(data, id) {
    actualUserData().then((userData) => {
        if (data.payerEmail == userData.email) {
            getPayData(Number(data.paymentId)).then(response => {
                if (response.result != undefined) {
                    if (response.result.status == "cancelled") {
                        deletePay(id)
                    }
                    if (response.result.status == "approved") {
                        userPayed(userData, id, response, data)
                    }
                } else {
                    deletePay(id)
                }
            })
        }
    })
}

async function noticeApproveds() {
    actualUserEmail().then(async (actualEmail) => {
        let q = query(collection(db, "payments"), where("paymentStatus", "==", "approved"));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((payDoc) => {
            if (payDoc.data().noticed == false && actualEmail == payDoc.data().payerEmail) {
                notifyThis(`Pagamento foi confirmado`, `Seus itens serão entregues em breve!`).then(async (res) => {
                    if (res == "closed") {
                        let paymentRef = doc(db, "payments", `${payDoc.id}`);
                        await updateDoc(paymentRef, {
                            noticed: true
                        });
                    }
                })
            }
        })
    })
}
window.addEventListener("load", () => {
    setTimeout(() => {
        noticeApproveds()
    }, 12000);
})