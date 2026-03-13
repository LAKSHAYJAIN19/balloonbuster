import './style.css'
import { initScore } from './game/ScoreManager'
import StartScreen from "./game/StartScreen"
import { startBalloonGame} from "./game/BalloonManager";

function startGame(selectedKey){

    console.log("Shoot key selected:", selectedKey)

    window.shootKey = selectedKey

    initScore()

    // start gameplay
    startBalloonGame()

}

new StartScreen(startGame)