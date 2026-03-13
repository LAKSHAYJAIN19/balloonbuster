export default class StartScreen {

    constructor(startGameCallback){

        this.startGameCallback = startGameCallback
        this.selectedKey = null
        this.isCountingDown = false

        this.handleKeyPress = this.handleKeyPress.bind(this)

        this.createUI()

    }

    createUI(){

        this.container = document.createElement("div")
        this.container.className = "start-screen"

        const title = document.createElement("h1")
        title.innerText = "It Gets Boring !!!"
        title.className = "game-title"

        const subtitle = document.createElement("h2")
        subtitle.innerText = "Press any key to choose your shoot button"

        this.keyDisplay = document.createElement("h3")
        this.keyDisplay.className = "key-display"

        this.confirmBtn = document.createElement("button")
        this.confirmBtn.innerText = "Confirm"
        this.confirmBtn.className = "menu-button"

        this.retryBtn = document.createElement("button")
        this.retryBtn.innerText = "Choose Again"
        this.retryBtn.className = "menu-button"

        this.confirmBtn.style.display = "none"
        this.retryBtn.style.display = "none"

        this.buttonContainer = document.createElement("div")
        this.buttonContainer.className = "button-container"

        this.buttonContainer.appendChild(this.confirmBtn)
        this.buttonContainer.appendChild(this.retryBtn)

        this.container.appendChild(title)
        this.container.appendChild(subtitle)
        this.container.appendChild(this.keyDisplay)
        this.container.appendChild(this.buttonContainer)

        document.body.appendChild(this.container)

        window.addEventListener("keydown", this.handleKeyPress)

        this.confirmBtn.onclick = () => {

            this.startCountdown()

        }

        this.retryBtn.onclick = () => {

            this.selectedKey = null
            this.keyDisplay.innerText = ""
            this.confirmBtn.style.display = "none"
            this.retryBtn.style.display = "none"

        }

    }

    handleKeyPress(e){

        if(this.selectedKey || this.isCountingDown) return

        this.selectedKey = e.key

        this.keyDisplay.innerText = "Selected Key : " + this.selectedKey

        this.confirmBtn.style.display = "block"
        this.retryBtn.style.display = "block"

    }

    startCountdown(){

        this.isCountingDown = true

        let count = 3

        window.removeEventListener("keydown", this.handleKeyPress)

        this.container.innerHTML = ""
        this.container.classList.add("countdown-screen")

        const counter = document.createElement("h1")
        counter.className = "countdown"

        const subtitle = document.createElement("h3")
        subtitle.innerText = "Gain as many points as you can"

        this.container.appendChild(counter)
        this.container.appendChild(subtitle)

        counter.innerText = count

        const interval = setInterval(()=>{

            count--

            if(count > 0){

                counter.innerText = count

            }
            else if(count === 0){

                counter.innerText = "GO!"

            }
            else{

                clearInterval(interval)

                document.body.removeChild(this.container)

                this.startGameCallback(this.selectedKey)

            }

        },1000)

    }

}