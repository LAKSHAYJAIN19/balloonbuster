import { db } from "../firebase.js"
import {
    collection, addDoc, getDocs, query, orderBy, limit, where, deleteDoc, doc
} from "firebase/firestore"
import { serverTimestamp } from "firebase/firestore"

const COLLECTION_NAME = "leaderboard"
const MAX_ENTRIES = 10

function getTodayDate() {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")

    return `${year}-${month}-${day}`
}

/* ---------------- GET LEADERBOARD ---------------- */

export async function getLeaderboard() {
    try {
        const today = getTodayDate()

        const todayQuery = query(
            collection(db, COLLECTION_NAME),
            where("date", "==", today),
            orderBy("score", "desc"),
            limit(MAX_ENTRIES)
        )

        const todaySnap = await getDocs(todayQuery)

        const allTimeQuery = query(
            collection(db, COLLECTION_NAME),
            orderBy("score", "desc"),
            limit(MAX_ENTRIES)
        )

        const allTimeSnap = await getDocs(allTimeQuery)

        const todayData = todaySnap.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name || "Player",
            score: doc.data().score || 0
        }))

        const allTimeData = allTimeSnap.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name || "Player",
            score: doc.data().score || 0
        }))

        return { todayData, allTimeData }

    } catch (e) {
        console.error("🔥 Firestore fetch error:", e)
        return { todayData: [], allTimeData: [] }
    }
}

/* ---------------- CLEANUP LOGIC ---------------- */

async function cleanupLeaderboard() {

    console.log("🧹 CLEANUP STARTED")

    const today = getTodayDate()

    const todayQuery = query(
        collection(db, COLLECTION_NAME),
        where("date", "==", today),
        orderBy("score", "desc"),
        limit(MAX_ENTRIES)
    )

    const allTimeQuery = query(
        collection(db, COLLECTION_NAME),
        orderBy("score", "desc"),
        limit(MAX_ENTRIES)
    )

    const todaySnap = await getDocs(todayQuery)
    const allTimeSnap = await getDocs(allTimeQuery)

    console.log("📅 Today count:", todaySnap.size)
    console.log("🏆 All-time count:", allTimeSnap.size)

    const keepIds = new Set([
        ...todaySnap.docs.map(d => d.id),
        ...allTimeSnap.docs.map(d => d.id)
    ])

    console.log("✅ Keep IDs:", keepIds)

    const allSnap = await getDocs(collection(db, COLLECTION_NAME))

    console.log("📦 Total docs:", allSnap.size)

    const deletePromises = []

    allSnap.forEach((docSnap) => {

        if (!keepIds.has(docSnap.id)) {

            console.log("❌ Deleting:", docSnap.id)

            deletePromises.push(
                deleteDoc(doc(db, COLLECTION_NAME, docSnap.id))
            )
        }
    })

    await Promise.all(deletePromises)

    console.log("🧹 Cleanup DONE")
}

/* ---------------- SAVE SCORE ---------------- */

export async function saveScore(name, score, duration) {
    try {
        const safeScore = Number(score)
        const safeDuration = Number(duration)

        if (isNaN(safeScore) || safeScore < 0 || safeScore > 600) {
            console.warn("🚫 Invalid score blocked:", safeScore)
            return null
        }

        if (isNaN(safeDuration) || safeDuration <= 0) {
            console.warn("🚫 Invalid duration:", duration)
            return null
        }

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
            duration: safeDuration,
            date: getTodayDate(),
            createdAt: serverTimestamp()
        }

        // ✅ GET DOC ID
        const docRef = await addDoc(collection(db, COLLECTION_NAME), newEntry)

        console.log("✅ Score saved, running cleanup...")

        await cleanupLeaderboard()

        // ✅ RETURN ID + SCORE
        return { id: docRef.id, score: safeScore }

    } catch (e) {
        console.error("🔥 Firestore save error:", e)
        return null
    }
}

/* ---------------- RANK MESSAGE ---------------- */

export async function getPlayerRankMessage(docId) {

    const today = getTodayDate()

    // 📅 Today's leaderboard
    const todayQuery = query(
        collection(db, COLLECTION_NAME),
        where("date", "==", today),
        orderBy("score", "desc"),
        limit(10)
    )

    const todaySnap = await getDocs(todayQuery)

    let todayRank = null
    let inTodayTop10 = false

    todaySnap.docs.forEach((doc, index) => {
        if (doc.id === docId) {
            todayRank = index + 1
            inTodayTop10 = true
        }
    })

    // 🏆 All-time leaderboard
    const allTimeQuery = query(
        collection(db, COLLECTION_NAME),
        orderBy("score", "desc"),
        limit(10)
    )

    const allTimeSnap = await getDocs(allTimeQuery)

    let inAllTimeTop10 = false

    allTimeSnap.docs.forEach((doc) => {
        if (doc.id === docId) {
            inAllTimeTop10 = true
        }
    })

    // 🎯 FINAL MESSAGE
    if (inTodayTop10 && inAllTimeTop10) {
        return "🔥 LEGEND! You made it to BOTH leaderboards!"
    }

    if (inAllTimeTop10) {
        return "🏆 Congrats! You made it to All-Time Top 10!"
    }

    if (inTodayTop10) {
        return `✅ Your Rank Today is #${todayRank}`
    }

    return "😅 Sorry, you couldn't make it to Top 10 today"
}

/* ---------------- RENDER LEADERBOARD ---------------- */

export async function renderLeaderboard() {

    const { todayData, allTimeData } = await getLeaderboard()

    const todayList = document.getElementById("todayLeaderboardList")
    const allTimeList = document.getElementById("allTimeLeaderboardList")

    todayList.innerHTML = ""
    allTimeList.innerHTML = ""

    function renderList(data, listElement) {

        if (data.length === 0) {
            const li = document.createElement("li")
            li.innerText = "No scores yet."
            listElement.appendChild(li)
            return
        }

        data.forEach((entry, index) => {

            const li = document.createElement("li")

            let prefix

            if (index === 0) prefix = "🥇"
            else if (index === 1) prefix = "🥈"
            else if (index === 2) prefix = "🥉"
            else prefix = `${index + 1}.`

            li.innerHTML = `<span>${prefix} ${entry.name}</span><span>${entry.score}</span>`

            if (index === 0) li.style.color = "gold"
            if (index === 1) li.style.color = "silver"
            if (index === 2) li.style.color = "#cd7f32"

            listElement.appendChild(li)
        })
    }

    renderList(todayData, todayList)
    renderList(allTimeData, allTimeList)
}