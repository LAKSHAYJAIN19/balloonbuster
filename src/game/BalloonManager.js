import { increaseScore } from "./ScoreManager"
import { getScore } from "./ScoreManager"
import {resetScore} from "./ScoreManager";
import { resetBonus } from "./ScoreManager"
import { getScoreMessage } from "./ScoreMessageManager"
import { audioManager } from "./AudioManager"
import StartScreen from "./StartScreen"
import { initScore } from "./ScoreManager"
import basketBackImage from "../assets/basket_backk.png"
import basketFrontImage from "../assets/basket_frontt.png"
import {saveScore, renderLeaderboard, getPlayerRankMessage} from "./LeaderboardManager"
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
let particles = []
let floatingTexts = []
let missed = 0
let maxMiss = 15

let speedMultiplier = 1
let spawnRate = 1000
let spawnInterval
let gameRunning = true
let gameStartTime = 0
let difficultyInterval
const missCounter = document.getElementById("missLeft")
missCounter.innerText = maxMiss

/* ---------------- BASKET SYSTEM ---------------- */

const basketBack = new Image()
basketBack.src = basketBackImage

const basketFront = new Image()
basketFront.src = basketFrontImage

let basket = {
    width: 400,
    height: 130,
    x: canvas.width / 2 - 150,
    y: canvas.height - 130
}

let basketSlots = []

function drawBasket(){

    if(basketBack.complete){
        ctx.drawImage(basketBack, basket.x, basket.y, basket.width, basket.height)
    }
    const balloonsPerRow = 5
    for(let i=0;i<basketSlots.length;i++){

        const row = Math.floor(i / balloonsPerRow)
        const col = i % balloonsPerRow

        const spacingX = basket.width / (balloonsPerRow + 1.4)
        const rowOffset = (row % 2) * (spacingX / 2.2)
        const x = basket.x + spacingX * (col + 1) + rowOffset
        const y = basket.y + basket.height - 100 - row * 20

        ctx.beginPath()

        ctx.arc(
            x + basketSlots[i].offsetX,
            y + basketSlots[i].offsetY,
            24,
            0,
            Math.PI*2
        )

        ctx.fillStyle = basketSlots[i].color
        ctx.fill()


    }
    if(basketFront.complete){
        ctx.drawImage(basketFront, basket.x, basket.y, basket.width, basket.height)
    }

}


function spawnBalloon(){

    clearInterval(spawnInterval) // ✅ prevent stacking

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
function createBurst(x, y, color){

    audioManager.playPop()
    for(let i = 0; i < 15; i++){

        particles.push({
            x: x,
            y: y,
            size: Math.random() * 4 + 2,
            speedX: (Math.random() - 0.5) * 6,
            speedY: (Math.random() - 0.5) * 6,
            life: 30,
            color: color
        })

    }

}
function createFloatingBonus(text, x, y){

    floatingTexts.push({
        text: text,
        x: x,
        y: y,
        life: 60,
        alpha: 1
    })

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

        if(balloon.y+balloon.size > basket.y+ basket.height*0.6){

            if(basketSlots.length < maxMiss){
                audioManager.playDrop()
                basketSlots.push({
                    color: balloon.color,
                    offsetX: Math.random()*8 - 4,
                    offsetY: Math.random()*6 - 3
                })
            }
            resetBonus()
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
    drawBasket()
    drawFloatingTexts()
    if(gameRunning){
        drawParticles()
        requestAnimationFrame(drawBalloons)

    }

}
function drawFloatingTexts(){

    for(let i = floatingTexts.length - 1; i >= 0; i--){

        const t = floatingTexts[i]

        ctx.globalAlpha = t.alpha
        ctx.fillStyle = `hsl(${Math.random()*60 + 40}, 100%, 60%)`
        ctx.font = "bold 22px Arial"
        ctx.textAlign = "center"

        ctx.fillText(t.text, t.x, t.y)

        ctx.globalAlpha = 1

        t.y -= 0.7
        t.life--
        t.alpha -= 0.015

        if(t.life <= 0){
            floatingTexts.splice(i,1)
        }

    }

}
function drawParticles(){

    for(let i = particles.length - 1; i >= 0; i--){

        const p = particles[i]

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.fill()
        p.speedY += 0.1
        p.x += p.speedX
        p.y += p.speedY
        p.life--

        if(p.life <= 0){
            particles.splice(i,1)
        }

    }

}

async function gameOver(){

    audioManager.stopBgMusic()
    resetRankMessage()
    console.log("GAME OVER TRIGGERED")
    gameRunning = false

    clearInterval(spawnInterval)
    clearInterval(difficultyInterval)

    const screen = document.getElementById("gameOverScreen")
    const finalScore = document.getElementById("finalScore")
    const messageBox = document.getElementById("scoreMessage")

    const score = getScore()
    const duration = (Date.now() - gameStartTime) / 1000 // ⏱️ in seconds
    finalScore.innerText = score
    messageBox.innerText = getScoreMessage(score)
    await renderLeaderboard()

    screen.style.display = "flex"

    const nameInput = document.getElementById("playerName")
    const errorText = document.getElementById("nameError")
    const saveBtn = document.getElementById("saveScoreBtn")

    saveBtn.disabled = false // reset button state

    saveBtn.onclick = async () => {

        const name = nameInput.value.trim()

        if(!name){
            errorText.innerText = "Please enter your name"
            return
        }

        errorText.innerText = ""

        const result = await saveScore(name, score, duration)

        if (result) {
            await renderLeaderboard()

            const message = await getPlayerRankMessage(result.id)
            displayRankMessage(message)
        }

        nameInput.value = ""
        saveBtn.disabled = true
    }

    nameInput.oninput = () => {
        errorText.innerText = ""
    }

    document.getElementById("copyScoreBtn").onclick = async () => {
        const btn = document.getElementById("copyScoreBtn")
        try {
            await navigator.clipboard.writeText(getShareText(score))
            btn.innerText = "✅ Copied!"
            btn.disabled = true
            setTimeout(() => {
                btn.innerText = "📋 Copy Score"
                btn.disabled = false
            }, 1500)
        } catch {
            btn.innerText = "❌ Failed"

            setTimeout(() => {
                btn.innerText = "📋 Copy Score"
            }, 1500)
        }
    }

    document.getElementById("whatsappShareBtn").onclick = () => {
        const text = encodeURIComponent(getShareText(score))
        window.open(`https://wa.me/?text=${text}`, "_blank")
    }

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

                createBurst(balloon.x, balloon.y, balloon.color)
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

    clearInterval(difficultyInterval)

    difficultyInterval = setInterval(()=>{

        speedMultiplier += 0.3

        if(spawnRate > 300){
            spawnRate -= 100
        }

    },15000)

}


document.getElementById("playAgainBtn").addEventListener("click", () => {

    document.getElementById("gameOverScreen").style.display = "none"

    // ✅ Restore description
    const description = document.getElementById("gameDescription")
    if (description) {
        description.style.display = ""
    }

    // ✅ Restore footer
    const footer = document.getElementById("footer")
    if (footer) {
        footer.style.display = ""
    }

    resetGameState()

    window.shootKey = null

    new StartScreen((selectedKey) => {

        window.shootKey = selectedKey
        initScore()
        startBalloonGame()

    })


})
export function showBonusText(bonus){

    createFloatingBonus("BONUS +" + bonus, canvas.width/2, canvas.height/2)

}
function getShareText(score) {
    return `I scored ${score} in Balloon Shooter!\nCan you beat me? \nPlay now: https://balloonbuster-nine.vercel.app/`
}

function resetGameState(){

    clearInterval(spawnInterval)
    clearInterval(difficultyInterval)


    resetScore()

    balloons = []
    particles = []
    floatingTexts = []
    basketSlots = []

    ctx.clearRect(0, 0, canvas.width, canvas.height)


    missed = 0
    speedMultiplier = 1
    spawnRate = 1000


    gameRunning = true

    gameStartTime = Date.now()


    missCounter.innerText = maxMiss

    resetBonus()
    document.getElementById("playerName").value = ""
    document.getElementById("saveScoreBtn").disabled = false

    console.log("✅ FULL GAME RESET DONE")
}

function displayRankMessage(message) {
    const el = document.getElementById("rankMessage")

    if (!el) return

    el.innerText = message
}
function resetRankMessage() {
    const el = document.getElementById("rankMessage")
    if (el) el.innerText = "Submit your score to see your rank 👇"
}
export function startBalloonGame(){

    audioManager.playBgMusic()
    gameStartTime = Date.now()
    spawnBalloon()
    increaseDifficulty()
    drawBalloons()

}
