import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot, addDoc, collection, getDoc, query, where, getDocs, serverTimestamp, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, listAll, uploadString, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
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

export async function deleteThis(database, id) {
    return new Promise(async (resolve) => {
        await deleteDoc(doc(db, `${database}`, `${id}`));
        resolve("deleted")
    })
}

export async function deleteFiles(road) {
    return new Promise(async (resolve) => {
        const desertRef = ref(storage, `${road}`);
        deleteObject(desertRef).then(() => {
            resolve("deleted")
        }).catch((error) => {
            resolve("error")
        });
    })
}

export async function deleteAllFiles(road) {
    return new Promise(async (resolve) => {
        const folderRef = ref(storage, road);
        try {
            const listResult = await listAll(folderRef);
            const deletePromises = listResult.items.map((itemRef) => deleteObject(itemRef));
            await Promise.all(deletePromises);
            resolve("deleted")
        } catch (error) {
            resolve("error")
        }
    })
}

export async function deleteAllsubDocs(dbPath, parentDocPath, subcollectionName) {
    return new Promise(async (resolve) => {
        const subcollectionRef = collection(db, dbPath, parentDocPath, subcollectionName);
        try {
            const querySnapshot = await getDocs(subcollectionRef);
            const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));
            await Promise.all(deletePromises);
            resolve("deleted")
        } catch (error) {
            resolve("error")
        }
    })
}