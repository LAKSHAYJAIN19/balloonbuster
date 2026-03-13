class GunManager {

    constructor() {
        this.shootKey = null
    }

    setShootKey(key) {

        this.shootKey = key

        window.addEventListener("keydown", (e) => {

            if (e.key === this.shootKey) {
                this.shoot()
            }

        })

    }

    shoot() {
        console.log("Shoot triggered")
        // add bullet logic here
    }

}

export default new GunManager()