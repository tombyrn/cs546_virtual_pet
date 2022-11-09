const healthBar = document.getElementById("healthBar")
const foodBar = document.getElementById("foodBar")
const happinessBar = document.getElementById("happinessBar")
const cleanlinessBar = document.getElementById("cleanlinessBar")

const feedButton = document.getElementById('feedButton')
const cleanButton = document.getElementById('cleanButton')
const playButton = document.getElementById('playButton')

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