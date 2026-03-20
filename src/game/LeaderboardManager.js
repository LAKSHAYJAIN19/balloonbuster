import { db } from "../firebase.js"
import { collection, addDoc, getDocs, query, orderBy, limit, where } from "firebase/firestore"
import { serverTimestamp } from "firebase/firestore"

const COLLECTION_NAME = "leaderboard"
const MAX_ENTRIES = 10

function getTodayDate() {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")

    return `${year}-${month}-${day}` // ✅ ALWAYS matches Firestore
}
// 🔥 GET LEADERBOARD FROM FIREBASE
export async function getLeaderboard() {
    try {
        const today = getTodayDate()
        let snapshot
        let isToday = false

        // 🔥 Try today's leaderboard
        try {
            const todayQuery = query(
                collection(db, COLLECTION_NAME),
                where("date", "==", today),
                orderBy("score", "desc"),
                limit(MAX_ENTRIES)
            )

            snapshot = await getDocs(todayQuery)

            if (!snapshot.empty) {
                isToday = true
            }

        } catch (err) {
            console.warn("⚠️ Daily query failed:", err)
        }

        // 🔁 Fallback to all-time if needed
        if (!snapshot || snapshot.empty) {
            const fallbackQuery = query(
                collection(db, COLLECTION_NAME),
                orderBy("score", "desc"),
                limit(MAX_ENTRIES)
            )

            snapshot = await getDocs(fallbackQuery)
        }

        const data = snapshot.docs.map(doc => {
            const d = doc.data()
            return {
                name: typeof d.name === "string" ? d.name : "Player",
                score: typeof d.score === "number" ? d.score : 0
            }
        })

        return { data, isToday }

    } catch (e) {
        console.error("🔥 Firestore fetch error:", e)
        return { data: [], isToday: false }
    }
}

export async function saveScore(name, score, duration) {
    try {
        const safeScore = Number(score)
        const safeDuration = Number(duration)

        // 🚫 Score validation
        if (
            isNaN(safeScore) ||
            safeScore < 0 ||
            safeScore > 600
        ) {
            console.warn("🚫 Invalid score blocked:", safeScore)
            return null
        }

        // 🚫 Duration validation (FIXED)
        if (
            isNaN(safeDuration) ||
            safeDuration <= 0
        ) {
            console.warn("🚫 Invalid duration:", duration)
            return null
        }

        // 🚫 Anti-cheat (RELAXED)
        const maxScorePerSecond = 10

        if (safeScore / safeDuration > maxScorePerSecond) {
            console.warn("🚫 Suspicious score blocked:", {
                score: safeScore,
                duration: safeDuration
            })
            return null
        }

        const newEntry = {
            name: name && name.trim() !== "" ? name.trim().slice(0, 20) : "Player",
            score: safeScore,
            duration: safeDuration, // ✅ ALWAYS NUMBER NOW
            date: getTodayDate(),
            createdAt: serverTimestamp()
        }

        await addDoc(collection(db, COLLECTION_NAME), newEntry)

        return safeScore

    } catch (e) {
        console.error("🔥 Firestore save error:", e)
        return null
    }
}

// 🔥 RENDER LEADERBOARD
export async function renderLeaderboard() {

    const { data: leaderboard, isToday } = await getLeaderboard()
    const list = document.getElementById("leaderboardList")
    const title = document.getElementById("leaderboardTitle")
    list.innerHTML = ""

    title.innerText = isToday
        ? "Today's Leaderboard"
        : "Top Scores (All Time)"

    if (leaderboard.length === 0) {
        const li = document.createElement("li")
        li.innerText = "No scores yet today."
        list.appendChild(li)
        return
    }

    leaderboard.forEach((entry, index) => {

        const li = document.createElement("li")

        let prefix

        if (index === 0) prefix = "🥇"
        else if (index === 1) prefix = "🥈"
        else if (index === 2) prefix = "🥉"
        else prefix = `${index + 1}.`

        li.innerHTML = `<span>${prefix} ${entry.name}</span><span>${entry.score}</span>`

        // 🎨 Styling for top 3
        if (index === 0) li.style.color = "gold"
        if (index === 1) li.style.color = "silver"
        if (index === 2) li.style.color = "#cd7f32"

        list.appendChild(li)
    })
}