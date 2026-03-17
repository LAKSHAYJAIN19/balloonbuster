import { db } from "../firebase.js"
import { collection, addDoc, getDocs, query, orderBy, limit } from "firebase/firestore"

const COLLECTION_NAME = "leaderboard"
const MAX_ENTRIES = 10

// 🔥 GET LEADERBOARD FROM FIREBASE
export async function getLeaderboard() {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            orderBy("score", "desc"),
            limit(MAX_ENTRIES)
        )

        const snapshot = await getDocs(q)

        return snapshot.docs.map(doc => {
            const data = doc.data()

            return {
                name: typeof data.name === "string" ? data.name : "Player",
                score: typeof data.score === "number" ? data.score : 0
            }
        })

    } catch (e) {
        console.error("🔥 Firestore fetch error:", e)
        return []
    }
}

// 🔥 SAVE SCORE TO FIREBASE
export async function saveScore(name, score) {
    try {
        const newEntry = {
            name: name && name.trim() !== "" ? name : "Player",
            score: Number(score),
            createdAt: new Date()
        }

        await addDoc(collection(db, COLLECTION_NAME), newEntry)

        return newEntry.score // used for highlight

    } catch (e) {
        console.error("🔥 Firestore save error:", e)
        return null
    }
}

// 🔥 RENDER LEADERBOARD
export async function renderLeaderboard(currentScore = null) {

    const leaderboard = await getLeaderboard()
    const list = document.getElementById("leaderboardList")

    list.innerHTML = ""

    if (leaderboard.length === 0) {
        const li = document.createElement("li")
        li.innerText = "No scores yet"
        list.appendChild(li)
        return
    }

    leaderboard.forEach((entry, index) => {

        const li = document.createElement("li")

        const name = entry.name
        const score = entry.score

        li.innerText = `${index + 1}. ${name} - ${score}`

        // 🎯 Highlight current player
        if (currentScore !== null && score === currentScore) {
            li.style.color = "gold"
            li.style.fontWeight = "bold"
        }

        list.appendChild(li)
    })
}