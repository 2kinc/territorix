function Tile(name, color, description) {
    this.name = name;
    this.color = color;
    this.description = description;
}

const TILE = {
    0: new Tile('Grass', '#44ee44', 'A tidy grass tile.'),
    1: new Tile('Water', '#4488ff', 'A water tile. Need a boat to cross.'),
    2: new Tile('Sand', '#fff176', 'sand.')
}

var world = new World(document.querySelector('#game'), 'white', innerWidth, innerHeight, 0, 0, { x: 0, y: 0 });
world.start();

function getTileId(coords) {
    return tileIdSign(coords.x) + ',' + tileIdSign(coords.y);
}

function tileIdSign(n) {
    return String(Math.abs(n)) + (n < 0 ? "n" : "");
}

var app = firebase;
var db = app.database();
var dbRef = db.ref('territorix').child('main-server');
noise.seed(Math.random());
var input = {
    keys: {},
    clientX: 0,
    clientY: 0,
    mouseDown: false,
    mouseLeft: false,
    keyListener: function (e) {
        var bool = (e.type == 'keydown');
        input.keys[e.key.toLowerCase()] = bool;
    },
    mouseListener: function (e) {
        input.mouseLeft = false;
        if (e.type == 'mousemove') {
            input.clientX = e.clientX;
            input.clientY = e.clientY;
            input.mouseX = e.clientX + world.cam.x / world.cam.zoom; //work in progress, zoom is messed up
            input.mouseY = e.clientY + world.cam.y / world.cam.zoom; //without zoom it is still fine
        }
        else if (e.type == 'mousedown') {
            input.mouseDown = true;
        }
        else if (e.type == 'mouseup') {
            input.mouseDown = false;
        }
        else if (e.type == 'mouseleave') {
            input.mouseDown = false;
            input.mouseLeft = true;
        }
    }
};

document.onkeydown = input.keyListener;
document.onkeyup = input.keyListener;
document.onmousedown = input.mouseListener;
document.onmouseup = input.mouseListener;
document.onmousemove = input.mouseListener;
document.onmouseleave = input.mouseListener;

dbRef.child('tiles').on("child_added", function (snap) {
    var tile = snap.val();
    var coords = snap.key.split(',');
    coords = {
        x: Number(coords[0]),
        y: Number(coords[1])
    };
    world.set(new world.Rectangle(snap.key, coords.x * 75, coords.y * 75, 75, 75, TILE[tile.type].color));
});

world.update = function () {
    var topLeft = {
        x: Math.floor(world.cam.x / 75) - 1,
        y: Math.floor(world.cam.y / 75) - 1
    };
    var bottomRight = {
        x: Math.ceil((world.cam.x + (world.width / world.cam.zoom)) / 75) + 1,
        y: Math.ceil((world.cam.y + (world.height / world.cam.zoom)) / 75) + 1
    };
    var keys = {};
    for (var x = topLeft.x; x < bottomRight.x; x++) {
        for (var y = topLeft.y; y < bottomRight.y; y++) {
            var id = getTileId({ x, y });
            var noiseValue = noise.simplex2(x / 25, y / 25);
            var tile = 0;
            if (noiseValue >= 0.5)
                tile = 0;
            else if (noiseValue >= -0.4)
                tile = 1;
            else if (noiseValue >= -1)
                tile = 2;
            world.set(new world.Rectangle(id, x * 75, y * 75, 75, 75, TILE[tile].color));
            keys[id] = true;
        }
    }
    var offset = 10 / world.cam.zoom;
    if (input.keys['w'] || input.keys['arrowup'])
        world.cam.y -= offset;
    if (input.keys['a'] || input.keys['arrowleft'])
        world.cam.x -= offset;
    if (input.keys['s'] || input.keys['arrowdown'])
        world.cam.y += offset;
    if (input.keys['d'] || input.keys['arrowright'])
        world.cam.x += offset;
    if (input.keys['q'] && world.cam.zoom > 0.3)
        world.cam.zoom -= 0.03;
    if (input.keys['e'] && world.cam.zoom < 5)
        world.cam.zoom += 0.03;
    world.objects.forEach(function (obj) {
        if (!keys[obj.name]) {
            world.objects.delete(obj.name);
        }
    });
}