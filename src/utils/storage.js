export function saveHighScore(score){

    let highScore = localStorage.getItem("highScore")

    if(score > highScore){

        localStorage.setItem("highScore",score)

    }

}

export function getHighScore(){

    return localStorage.getItem("highScore") || 0

}