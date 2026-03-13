let score = 0
let highScore = 0

export function initScore(){

    const stored = sessionStorage.getItem("highScore")

    highScore = stored ? parseInt(stored) : 0

    document.getElementById("score").innerText = score
    document.getElementById("highScore").innerText = highScore

}

export function increaseScore(points){

    score+= points

    document.getElementById("score").innerText = score

    if(score > highScore){

        highScore = score

        sessionStorage.setItem("highScore", highScore)

        document.getElementById("highScore").innerText = highScore
    }

}

export function resetScore(){

    score = 0

    document.getElementById("score").innerText = 0
}

export function getScore(){
    return score
}