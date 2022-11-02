//const Two = require('two.js')
//console.log(Two);

const two = new Two({
    type: Two.Types.canvas,
    fullscreen: true,
    autostart: true
}).appendTo(document.body);

const src = './ken-stance.png';

// Positioning
const x = two.width / 2;
const y = two.height / 2;

// Cell size
const width = 78;
const height = 111;

const cols = 10;
const rows = 1;
const frameRate = 20;

const ken = new Two.Sprite(src, x, y, cols, rows, frameRate);
const sprite = new Two.Sprite(src, x, 78, 1, 1);

sprite.stroke = '#ccc';

ken.scale = 250 / width;
ken.play();

two.add(sprite, ken);
