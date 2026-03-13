import { spawnBalloon } from './BalloonManager'
import { increaseDifficulty } from './DifficultyManager'

let gameInterval

export function startGame() {

    spawnBalloon()

    gameInterval = setInterval(() => {
        increaseDifficulty()
    },15000)

}