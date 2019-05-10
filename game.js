function Tile(name, color, description) {
    this.color = color;
    this.description = description;
    this.name = name;
}

var tiles = {
    grass: new Tile('Grass', '#44ee44', 'A tidy grass tile.')
}

function getTileId(coords) {
    return 't_' + tileIdSign(coords.x) + '_' + tileIdSign(coords.y);
}

function tileIdSign(n) {
    return String(Math.abs(n)) + (n < 0 ? "n" : "");
}

function Renderer(el, ref) {
    var that = this;
    this.el = $(el);
    this.ref = ref;
    this.ref.child('tiles').on("child_added", function (snap) {
        var tile = snap.val();
        var coords = snap.key.split(',');
        coords = {
            x: Number(coords[0]),
            y: Number(coords[1])
        };
        var td = document.createElement('td');
        var info = tiles[tile.type];
        td.innerText = info.name;
        td.style.background = info.color;
        td.title = info.description;
        td.id = getTileId(coords);
        that.el.append(td);
    });
}

var app = firebase;
var db = app.database();
var dbRef = db.ref('territorix').child('main-server');

var renderer = new Renderer('#game-tiles', dbRef);