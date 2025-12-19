import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { alternatePage } from "./alternatePages";

// Add error handling for Firebase config
const firebaseConfig = {
    apiKey: `${import.meta.env.VITE_API_KEY}`,
    authDomain: `${import.meta.env.VITE_AUTH_DOMAIN}`,
    projectId: `${import.meta.env.VITE_PROJECT_ID}`,
    storageBucket: `${import.meta.env.VITE_STORAGE_BUCKET}`,
    messagingSenderId: `${import.meta.env.VITE_MESSAGING_SENDER_ID}`,
    appId: `${import.meta.env.VITE_APP_ID}`,
};

let auth, app, db, storage;

// Initialize Firebase with error handling
try {
    // Check if Firebase config is valid
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'undefined') {
        console.error('Firebase config is invalid:', firebaseConfig);
        throw new Error('Invalid Firebase configuration');
    }

    app = initializeApp(firebaseConfig);
    auth = getAuth();
    db = getFirestore(app);
    storage = getStorage(app);
} catch (error) {
    console.error('Error initializing Firebase:', error);
    // We'll handle the error in the function itself
}

let i = 0;
let urlParams = new URLSearchParams(window.location.search);
let page = urlParams.get("page");

export function verifyIfUserLogged() {
    // If Firebase failed to initialize, use fallback
    if (!auth) {
        console.warn('Firebase not initialized, using fallback authentication check');
        if (page == "lojamaker") {
            let sections = document.querySelectorAll(".main__section")
            sections.forEach(section => {
                section.style.display = "none"
            });
            document.getElementById("storeSection").style.display = "flex"
        } else {
            let loginSection = document.getElementById("loginSection")
            loginSection.style.display = "flex"
        }
        return;
    }

    // Normal Firebase authentication flow
    onAuthStateChanged(auth, (user) => {
        if (user) {
            if (i == 0) {
                const uid = user.uid;
                let homeSection = document.getElementById("homeSection")
                homeSection.style.display = "flex"
                i++
            }
        } else {
            if (i == 0) {
                if (page == "lojamaker") {
                    console.log("oi");
                    let sections = document.querySelectorAll(".main__section")
                    sections.forEach(section => {
                        section.style.display = "none"
                    });
                    document.getElementById("storeSection").style.display = "flex"
                } else {
                    let loginSection = document.getElementById("loginSection")
                    loginSection.style.display = "flex"
                    i++
                }
            }
        }
    });
}