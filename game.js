function Tile(name, color, description) {
    this.name = name;
    this.color = color;
    this.description = description;
}

const TILE = {
    0: new Tile('Grass', '#44ee44', 'A tidy grass tile.'),
    1: new Tile('Water', '#4488ff', 'A water tile. Need a boat to cross.')
}

var world = new World(document.querySelector('#game'), 'white', innerWidth, innerHeight, 0, 0, { x: 0, y: 0 });
world.start();

function getTileId(coords) {
    return 't_' + tileIdSign(coords.x) + '_' + tileIdSign(coords.y);
}

function tileIdSign(n) {
    return String(Math.abs(n)) + (n < 0 ? "n" : "");
}

var app = firebase;
var db = app.database();
var dbRef = db.ref('territorix').child('main-server');
var input = {
    keys: {},
    clientX: 0,
    clientY: 0,
    mouseDown: false,
    keyListener: function (e) {
        var bool = (e.type == 'keydown');
        input.keys[e.key.toLowerCase()] = bool;
    },
    mouseListener: function (e) {
        if (e.type == 'mousemove') {
            input.clientX = e.clientX;
            input.clientY = e.clientY;
        }
        else if (e.type == 'mousedown') {
            input.mouseDown = true;
        }
        else if (e.type == 'mouseup') {
            input.mouseDown = false;
        }
    }
};

document.onkeydown = input.keyListener;
document.onkeyup = input.keyListener;
document.onmousedown = input.mouseListener;
document.onmouseup = input.mouseListener;
document.onmousemove = input.mouseListener;

dbRef.child('tiles').on("child_added", function (snap) {
    var tile = snap.val();
    var coords = snap.key.split(',');
    coords = {
        x: Number(coords[0]),
        y: Number(coords[1])
    };
    world.set(new world.Rectangle(snap.key, coords.x * 50, coords.y * 50, 50, 50, TILE[tile.type].color));
});

world.update = function () {
    if (input.keys['w'] || input.keys['arrowup'])
        world.cam.y -= 10;
    if (input.keys['a'] || input.keys['arrowleft'])
        world.cam.x -= 10;
    if (input.keys['s'] || input.keys['arrowdown'])
        world.cam.y += 10;
    if (input.keys['d'] || input.keys['arrowright'])
        world.cam.x += 10;
    /*if (input.clientY < 70)
        world.cam.y -= 10;
    if (input.clientX < 70)
        world.cam.x -= 10;
    if (input.clientY > innerHeight - 70)
        world.cam.y += 10;
    if (input.clientX > innerWidth - 70)
        world.cam.x += 10;*/
}