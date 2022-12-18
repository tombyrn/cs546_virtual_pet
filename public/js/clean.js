const pen = document.getElementById('pen');
const backHomeButton = document.getElementById('backHomeButton');
backHomeButton.onclick = () => {
    window.location.replace("/");
}

let sprite;
let green_sprite = '/public/designs/green_guy';
let blue_sprite = '/public/designs/blue_guy';
let purple_sprite = '/public/designs/purple_guy';
let i = 0;
let pet; // will be set to the req.session.pet cookie held by user
let cleanliness;
let two = new Two({type: Two.Types.canvas, fullscreen: false, fitted: true, autostart: true}).appendTo(pen);

function setPet(){
    two.clear();
    two.width = pen.clientWidth;
    two.height = pen.clientHeight;
    let spriteHeight = 300;
    let x = two.width/2;
    let y = two.height - (spriteHeight/2);
    const bgImage = new Two.ImageSequence("/public/designs/bath_setting.png", x, y, 1);

    two.add(bgImage);
    
    let col = 4
    let row = 1
    let framerate = 3
    
    const petSprite = new Two.Sprite(sprite, x, y, col, row, framerate)
    petSprite.scale = 1
    petSprite.play();
    
    two.add(petSprite);
    two.update()

}

function setSprite(){
    if(pet.design === 1)
        sprite = green_sprite
    if(pet.design === 2)
        sprite = blue_sprite
    if(pet.design === 3)
        sprite = purple_sprite

    if(pet.hat != 0)
        sprite+= `_hat${pet.hat}`

    sprite += '.webp'
}

async function updateStatus(){
    await ($.get("/home/getPetInfo", (data) => {
        pet = data.pet;
        cleanliness = pet.cleanliness;
        // console.log(data)
        if(!pet)
            window.location.replace('/home/petDeath')
    }))
}

async function clean(){
    await ($.post('/home/updatePetCleanliness'))
}

const sketch = (s) => {
  s.setup = () => {
    s.createCanvas(pen.clientWidth, pen.clientHeight-3);
    s.background(255, 0);
    s.noStroke();
    s.frameRate(1);
    for(let x = 0; x < 100 - cleanliness/2; x = x+1){
        s.fill('brown');
        s.circle(s.random(0, pen.clientWidth), s.random(0, pen.clientHeight), 75);
    }
    s.textSize(pen.clientWidth / 6);
    s.textAlign(s.CENTER, s.CENTER);
  };
  s.draw = () => {
    s.mouseIsPressed = true;
    if(s.frameCount == 15){
        s.noErase();
        s.clear();
        s.mouseIsPressed = false;
        s.noLoop();
    }

    if(s.isLooping() == false){
        s.fill(0, 102, 153);
        s.text('cleaned!', 300, 100);
        clean();
    }
  };
  s.mouseClicked = () =>{
    s.mouseIsPressed = true;
  }
  s.mouseDragged = () =>{
    s.erase(255, 100);
    s.noStroke();
    s.circle(s.mouseX, s.mouseY, 25);
  }
};

// // pings server every 30 seconds to update the pet info
// setInterval(() => {
//     clean();    
// }, 10000)

async function init(){
    await updateStatus();
    setSprite();
    setPet();
    new p5(sketch, 'dirtOnPet');
}

init();