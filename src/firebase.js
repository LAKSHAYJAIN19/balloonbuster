import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
    apiKey: "AIzaSyB5d3tjfPn0kAfJcoDqTecWj8wtcdW5KGQ",
    authDomain: "balloon-shooter-4be63.firebaseapp.com",
    projectId: "balloon-shooter-4be63",
    storageBucket: "balloon-shooter-4be63.firebasestorage.app",
    messagingSenderId: "902412365840",
    appId: "1:902412365840:web:2ad1f19be9bee9c0a41a95"
}

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)