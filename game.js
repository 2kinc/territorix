function Tile(name, color, description) {
    this.color = color;
    this.description = description;
    this.name = name;
}

var tiles = {
    grass: new Tile('Grass', '#44ee44', 'A tidy grass tile.'),
    water: new Tile('Water', '#4488ff', 'A water tile. Need a boat to cross.')
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
    this.generate = function (rows, cols, start_x, start_y) {
        for (var y = (start_y || 0); y < rows + (start_y || 0); y++) {
            var tr = document.createElement('tr');
            that.el.append(tr);
            for (var x = (start_x || 0); x < cols + (start_x || 0); x++) {
                var td = document.createElement('td');
                td.id = getTileId({ x: x, y: y });
                td.className = 'game-tile';
                tr.appendChild(td);
            }
        }
    }
    this.initialize = function () {
        that.ref.child('tiles').on("child_added", function (snap) {
            var tile = snap.val();
            var coords = snap.key.split(',');
            coords = {
                x: Number(coords[0]),
                y: Number(coords[1])
            };
            var td = document.getElementById(getTileId(coords));
            var info = tiles[tile.type];
            td.innerText = info.name;
            td.style.background = info.color;
            td.title = info.description;
        });
    };
}

var app = firebase;
var db = app.database();
var dbRef = db.ref('territorix').child('main-server');

var renderer = new Renderer('#game-tiles', dbRef);
renderer.generate(10, 10);
renderer.initialize();