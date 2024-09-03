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

export function monitorCollectionUpdates(collectionPath, callback) {
    const collectionRef = collection(db, collectionPath);
    let isProcessing = false;
    onSnapshot(collectionRef, (snapshot) => {
        if (isProcessing) return;
        isProcessing = true;
        const changes = snapshot.docChanges();
        let modifiedDocs = [];
        changes.forEach((change) => {
            if (change.type === "added") {
                modifiedDocs.push(change.doc.data());
            }
            if (change.type === "modified") {
                modifiedDocs.push(change.doc.data());
            }
            if (change.type === "removed") {
                modifiedDocs.push(change.doc.data());
            }
        });
        if (modifiedDocs.length > 0) {
            callback(modifiedDocs);
        }
        isProcessing = false;
    });
}

export function monitorDocumentUpdates(docPath, callback) {
    const docRef = doc(db, docPath);
    onSnapshot(docRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
            callback(docSnapshot.data());
        } else {
            callback("error");
        }
    });
}