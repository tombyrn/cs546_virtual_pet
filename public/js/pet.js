const healthBar = document.getElementById("healthBar")
const foodBar = document.getElementById("foodBar")
const happinessBar = document.getElementById("happinessBar")
const cleanlinessBar = document.getElementById("cleanlinessBar")
const restBar = document.getElementById("restBar")

const feedButton = document.getElementById('feedButton')
const cleanButton = document.getElementById('cleanButton')
const playButton = document.getElementById('playButton')
const storeButton = document.getElementById('storeButton')
const profileButton = document.getElementById('profileButton')

const pen = document.getElementById('pen')

let params = {
    type: Two.Types.canvas,
    fullscreen: false,
    fitted: true,
    autostart: true,
}

// Create two.js canvas instance inside #pen div
let two = new Two(params).appendTo(pen)
  
let green_sprite = '/public/designs/green_guy'
let blue_sprite = '/public/designs/blue_guy'
let purple_sprite = '/public/designs/purple_guy'

let sprite // will be set to the sprite matching the pet objects design field
let pet // will be set to the req.session.pet cookie held by user

let backgroundNo
let isBackground

// function that creates and adds pet sprite to two.js canvas

function drawBackground(){
    const bgImage = new Two.ImageSequence(`/public/designs/bg${backgroundNo}.png`, two.width/2, two.height/2, 1)
    two.add(bgImage)
}

function drawPet(){
    two.clear()
    two.width = pen.clientWidth
    two.height = pen.clientHeight
    if(isBackground){
        drawBackground()
    }
    
    let spriteWidth = 300
    let spriteHeight = 300
    
    let x = two.width/2
    let y = two.height - (spriteHeight/2)

    let col = 4
    let row = 1
    let framerate = 3
    
    const petSprite = new Two.Sprite(sprite, x, y, col, row, framerate)
    petSprite.scale = 1
    petSprite.play();
    
    two.add(petSprite);
    two.update()
}

// Citation: https://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep
function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

// sets the sprite according to the req.session.pet.design attribute in the user cookie
function setSprite(){
    if(pet.design === "1")
        sprite = green_sprite
    if(pet.design === "2")
        sprite = blue_sprite
    if(pet.design === "3")
        sprite = purple_sprite

    if(pet.hat != 0)
        sprite+= `_hat${pet.hat}`

    sprite += '.webp'
}

// makes an orange circle fall from top middle of canvas to the middle of the sprite
async function feedAnimation(){
    const radius = 10
    const resolution = 100
    const x = two.width/2
    let y = radius*2
    
    let circle = new Two.Circle(x, y, radius, resolution)

    circle.fill = '#FF8000'
    circle.noStroke() // no outline on circle
    
    two.add(circle)

    while(circle.position.y < two.height-75){
        circle.position.y+=1;
        two.update();
        await delay(10)
    }

    two.remove(circle)
    two.update();

}

// event handler for feed button
feedButton.onclick = async () => {
    feedButton.disabled = true

    await feedAnimation()
    // after the feed animation ends update the status
    foodBar.value+=10;
    if(foodBar.value > 100)
        foodBar.value = 100
        
    feedButton.disabled = false
    // send new info to server
    await ($.post('/home/updatePetInfo', {date: Date.now(), foodLevel: foodBar.value, field: "lastFed", isInt: true}))
    await updateStatus()
    console.log('finished~~')
}

playButton.onclick = () => {
    window.location.replace("/home/play");
}
cleanButton.onclick = () => {
    window.location.replace("/home/clean");
}
storeButton.onclick = () => {
    window.location.replace("/home/store");
}
profileButton.onclick = () => {
    window.location.replace("/home/profile");
}

// event handler for resize, keeps canvas inside the #pen div
addEventListener("resize", (event) => {
    two.width = pen.clientWidth;
    two.height = pen.clientHeight;
    if(!feedButton.disabled)
        drawPet()
});

// pings server every 30 seconds to update the pet info
setInterval(() => {
    updateStatus()    
}, 30000)

// ajax get request to server that returns the pets information and updates the status bars accordingly
async function updateStatus(){
    await ($.get("/home/getPetInfo", (data) => {
        pet = data.pet
        console.log(data)
        if(!pet)
            window.location.replace('/home/petDeath')

        backgroundNo = data.background
        isBackground = backgroundNo === 0 ? false : true

        healthBar.value = pet.health
        foodBar.value = pet.food
        cleanlinessBar.value = pet.cleanliness
        happinessBar.value = pet.happiness
        restBar.value = pet.rest
    }))
}

async function init(){
    await updateStatus()
    setSprite()
    drawPet()
}

init()
