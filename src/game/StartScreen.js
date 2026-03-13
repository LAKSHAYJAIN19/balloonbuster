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

        this.container.style.position = "absolute"
        this.container.style.top = "0"
        this.container.style.left = "0"
        this.container.style.width = "100%"
        this.container.style.height = "100%"
        this.container.style.display = "flex"
        this.container.style.flexDirection = "column"
        this.container.style.alignItems = "center"
        this.container.style.justifyContent = "center"
        this.container.style.background = "#111"
        this.container.style.color = "white"

        const title = document.createElement("h1")
        title.innerText = "It Gets Boring !!!"
        title.style.fontSize = "60px"

        const subtitle = document.createElement("h2")
        subtitle.innerText = "Press any key to choose your shoot button"

        this.keyDisplay = document.createElement("h3")

        this.confirmBtn = document.createElement("button")
        this.confirmBtn.innerText = "Confirm"
        this.confirmBtn.style.margin = "10px"

        this.retryBtn = document.createElement("button")
        this.retryBtn.innerText = "Choose Again"

        this.confirmBtn.style.display = "none"
        this.retryBtn.style.display = "none"

        this.container.appendChild(title)
        this.container.appendChild(subtitle)
        this.container.appendChild(this.keyDisplay)
        this.container.appendChild(this.confirmBtn)
        this.container.appendChild(this.retryBtn)

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

        const counter = document.createElement("h1")
        counter.style.fontSize = "80px"

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

                // start the actual game
                this.startGameCallback(this.selectedKey)

            }

        },1000)

    }

}