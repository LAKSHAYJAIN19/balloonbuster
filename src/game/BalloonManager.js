import { increaseScore } from "./ScoreManager"
import { getScore } from "./ScoreManager"
const canvas = document.getElementById("gameCanvas")
const ctx = canvas.getContext("2d")
const balloonTypes = [
    { color: "yellow", hits: 1 , points: 1},
    { color: "orange", hits: 2 , points: 2},
    { color: "pink", hits: 3 , points: 3},
    { color: "blue", hits: 4 , points: 4},
    { color: "red", hits: 5 , points: 5}
]
canvas.width = window.innerWidth
canvas.height = window.innerHeight

let balloons = []

let missed = 0
let maxMiss = 15

let speedMultiplier = 1
let spawnRate = 1000
let spawnInterval
let gameRunning = true

const missCounter = document.getElementById("missLeft")
missCounter.innerText = maxMiss

function spawnBalloon(){

    spawnInterval = setInterval(()=>{

        if(!gameRunning) return

        const type = balloonTypes[Math.floor(Math.random() * balloonTypes.length)]

        let balloon = {
            x: Math.random() * canvas.width,
            y: -50,
            size: 40,
            speed: 2 * speedMultiplier,
            color: type.color,
            hitsLeft: type.hits,
            points: type.points
        }

        balloons.push(balloon)

    }, spawnRate)

}

function drawBalloons(){

    ctx.clearRect(0,0,canvas.width,canvas.height)

    for(let i = balloons.length-1; i >= 0; i--){

        const balloon = balloons[i]

        ctx.beginPath()
        ctx.arc(balloon.x,balloon.y,balloon.size,0,Math.PI*2)
        ctx.fillStyle=balloon.color
        ctx.fill()

        ctx.fillStyle = "black"
        const pointText = balloon.points === 1 ? "point" : "points"
        ctx.font = "bold 14px Arial"
        ctx.fillText("+" + balloon.points +" "+pointText, balloon.x, balloon.y -5)
        ctx.font = "12px Arial"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        const hitText = balloon.hitsLeft === 1 ? "hit" : "hits"
        ctx.fillText(balloon.hitsLeft+" "+hitText, balloon.x, balloon.y+12)
        balloon.y += balloon.speed

        if(balloon.y > canvas.height){

            balloons.splice(i,1)

            missed++

            let remaining = maxMiss - missed

            if(remaining <= 0){

                missCounter.innerText = "0"
                setTimeout(() => {
                    gameOver()
                }, 50)

            }else{

                missCounter.innerText = `${remaining}`

            }

        }

    }

    if(gameRunning){

        requestAnimationFrame(drawBalloons)

    }

}

function gameOver(){

    gameRunning = false

    clearInterval(spawnInterval)

    const screen = document.getElementById("gameOverScreen")
    const finalScore = document.getElementById("finalScore")

    finalScore.innerText = getScore()

    screen.style.display = "flex"

}

let lastMouseX = 0
let lastMouseY = 0

canvas.addEventListener("mousemove", (event) => {

    lastMouseX = event.clientX
    lastMouseY = event.clientY

})
let canShoot = true
window.addEventListener("keydown",(event)=>{

    if(!gameRunning) return

    if(event.key !== window.shootKey) return

    if(!canShoot) return

    canShoot = false

    const mouseX = lastMouseX
    const mouseY = lastMouseY

    for(let i = balloons.length - 1; i >= 0; i--){

        const balloon = balloons[i]

        const distance = Math.sqrt(
            (mouseX - balloon.x)**2 +
            (mouseY - balloon.y)**2
        )

        if(distance < balloon.size){

            balloon.hitsLeft--

            balloon.size -= 3

            if(balloon.hitsLeft <= 0){

                balloons.splice(i,1)

                increaseScore(balloon.points)

            }

        }

    }

})

window.addEventListener("keyup",(event)=>{

    if(event.key === window.shootKey){

        canShoot = true

    }

})

function increaseDifficulty(){

    setInterval(()=>{

        speedMultiplier += 0.3

        if(spawnRate > 300){

            spawnRate -= 100

        }

    },15000)

}

export function startBalloonGame(){

    spawnBalloon()

    increaseDifficulty()

    drawBalloons()

}

document.getElementById("playAgainBtn").addEventListener("click", () => {

    location.reload()

})