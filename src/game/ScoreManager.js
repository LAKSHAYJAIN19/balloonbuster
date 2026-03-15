import { showBonusText } from "./BalloonManager"
let score = 0
let highScore = 0

let streakScore = 0
let nextBonusThreshold = 20
let currentBonus = 6

export function initScore(){

    const stored = sessionStorage.getItem("highScore")

    highScore = stored ? parseInt(stored) : 0

    document.getElementById("score").innerText = score
    document.getElementById("highScore").innerText = highScore

}

export function increaseScore(points){

    score+= points
    streakScore += points
    checkBonus()
    document.getElementById("score").innerText = score

    if(score > highScore){

        highScore = score

        sessionStorage.setItem("highScore", highScore)

        document.getElementById("highScore").innerText = highScore
    }

}
function checkBonus(){

    if(streakScore >= nextBonusThreshold){

        score += currentBonus

        // show updated score
        document.getElementById("score").innerText = score

        showBonusText(currentBonus)
        nextBonusThreshold += 10
        currentBonus += 1

    }

}
export function resetBonus(){

    streakScore = 0
    nextBonusThreshold = 20
    currentBonus = 6

}
export function resetScore(){

    score = 0

    document.getElementById("score").innerText = 0
}

export function getScore(){
    return score
}