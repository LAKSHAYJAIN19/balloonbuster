class AudioManager {
    constructor() {
        // Background music
        this.bgMusic = new Audio("/sounds/bg.mp3");
        this.bgMusic.loop = true
        this.bgMusic.volume = 0.4

        // Pop sound
        this.popSound = new Audio("/sounds/pop.mp3")
        this.popSound.volume = 0.5

        // Drop sound
        this.dropSound = new Audio("/sounds/drop.mp3")
        this.dropSound.preload = "auto"
        this.dropSound.volume = 1
    }

    playBgMusic() {
        this.bgMusic.currentTime = 0
        this.bgMusic.play().catch(() => {})
    }

    stopBgMusic() {
        this.bgMusic.pause()
    }

    playPop() {
        // clone so multiple pops can overlap
        const sound = this.popSound.cloneNode()
        sound.play()
    }

    playDrop() {
        const sound = this.dropSound.cloneNode()

        // 👉 Start from 4.5 seconds
        sound.currentTime = 5

        sound.play().then(() => {
            // 👉 Stop at 5 seconds
            setTimeout(() => {
                sound.pause()
            }, 700)
        }).catch(() => {})
    }
}

export const audioManager = new AudioManager()