const MAX_ENTRIES = 10

export function getLeaderboard(){

    try {
        const data = localStorage.getItem("leaderboard")
        const parsed = data ? JSON.parse(data) : []

        // 🛡️ Filter out corrupted entries
        return parsed.filter(entry =>
            entry &&
            typeof entry.name === "string" &&
            typeof entry.score === "number"
        )

    } catch (e) {
        console.error("Leaderboard parse error:", e)
        return []
    }

}

export function saveScore(name,score){

    let leaderboard = getLeaderboard()

    const newEntry = {
        name: name && name.trim() !== "" ? name : "Player",
        score: Number(score), // 🛡️ force number
        date: new Date().toLocaleDateString()
    }

    leaderboard.push(newEntry)

    leaderboard.sort((a, b) => b.score - a.score)

    leaderboard = leaderboard.slice(0, MAX_ENTRIES)

    localStorage.setItem("leaderboard", JSON.stringify(leaderboard))

    return leaderboard.findIndex(entry =>
        entry.name === newEntry.name &&
        entry.score === newEntry.score &&
        entry.date === newEntry.date
    )
}

export function renderLeaderboard(currentRank = -1){
    const leaderboard = getLeaderboard()
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

        const name = entry.name || "Player"
        const score = typeof entry.score === "number" ? entry.score : 0

        li.innerText = `${index + 1}. ${name} - ${score}`

        if (currentRank !== -1 && index === currentRank) {
            li.style.color = "gold"
            li.style.fontWeight = "bold"
        }

        list.appendChild(li)
    })
}