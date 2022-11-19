const healthBar = document.getElementById("healthBar")
const foodBar = document.getElementById("foodBar")
const happinessBar = document.getElementById("happinessBar")
const cleanlinessBar = document.getElementById("cleanlinessBar")

const feedButton = document.getElementById('feedButton')
const cleanButton = document.getElementById('cleanButton')
const playButton = document.getElementById('playButton')

const canvas = document.getElementById('canvas')

async function draw(){
    const context = canvas.getContext("2d")

    context.clearRect(0, 0, canvas.width, canvas.height)
    
    const width = 50;
    const height = 50;
    const x = (canvas.width/2) - (width/2)
    const y = (canvas.height - height)
    
    const deltaX = Math.floor(Math.random() * 10)
    context.fillRect(x + deltaX, y, width, height);
    context.drawImage(image, )
    await new Promise(r => setTimeout(r, 800));

    window.requestAnimationFrame(draw);
}

function init(){
    healthBar.value = 100
    foodBar.value = 0;
    happinessBar.value = 0;
    cleanlinessBar.value = 0;
    draw();
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