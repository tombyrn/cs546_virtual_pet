const healthBar = document.getElementById("healthBar")
const foodBar = document.getElementById("foodBar")
const happinessBar = document.getElementById("happinessBar")
const cleanlinessBar = document.getElementById("cleanlinessBar")

const feedButton = document.getElementById('feedButton')
const cleanButton = document.getElementById('cleanButton')
const playButton = document.getElementById('playButton')

const canvas = document.getElementById('canvas')

let params = {
    type: Two.Types.canvas,
    fullscreen: false,
    fitted: true,
    autostart: true,
}

let elem = document.getElementById('pen');
let two = new Two(params).appendTo(elem);
  
let width = 300
let height = 300

let x = two.width/2
let y = two.height - (height/2)

let col = 4
let row = 1
let framerate = 3

let green_sprite = '/public/designs/green_guy.webp'
let blue_sprite = '/public/designs/blue_guy.webp'
let purple_sprite = '/public/designs/purple_guy.webp'

const sprite = new Two.Sprite(green_sprite, x, y, col, row, framerate)
sprite.scale = 1
sprite.play();

two.add(sprite);

function init(){
    healthBar.value = 100
    foodBar.value = 0;
    happinessBar.value = 0;
    cleanlinessBar.value = 0;
}

feedButton.onclick = () => {
    foodBar.value++;
}
playButton.onclick = () => {
    happinessBar.value++;
}
cleanButton.onclick = () => {
    cleanlinessBar.value++;
}

init()