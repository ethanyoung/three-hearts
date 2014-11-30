var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'game-screen', { preload: preload, create: create, update: update, render: render })

function preload() {
    game.load.tilemap('map', 'assets/tilemaps/maps/collision_test.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('hero', 'assets/hero.png');
    game.load.image('ground_1x1', 'assets/tilemaps/tiles/walls_1x1.png');
    game.load.image('walls_1x2', 'assets/tilemaps/tiles/walls_1x1.png');
    game.load.image('tiles2', 'assets/tilemaps/tiles/walls_1x1.png');
    game.load.image('heart', 'assets/heart.png');
}

var hero;
var cursors;
var map;
var hearts;
var text;

function create() {
    game.physics.startSystem(Phaser.Physics.P2JS);
	game.stage.backgroundColor = '#018E0E';
    game.physics.p2.defaultRestitution = 0.8;

    map = game.add.tilemap('map');

    map.addTilesetImage('ground_1x1');
    map.addTilesetImage('walls_1x2');
    map.addTilesetImage('tiles2');

    layer = map.createLayer('Tile Layer 1');
    layer.resizeWorld();
    map.setCollisionBetween(1, 12);
    game.physics.p2.convertTilemap(map, layer);

	hero = game.add.sprite(200, 200, 'hero');
	game.physics.p2.enable(hero);
    hero.body.setZeroDamping();
    hero.body.fixedRotation = true;

    hearts = game.add.group();
    hearts.enableBody = true;
    hearts.physicsBodyType = Phaser.Physics.P2JS;
    hearts.create(500, 500, 'heart');
    hearts.create(300, 150, 'heart');
    hearts.create(600, 100, 'heart');

    game.camera.follow(hero);

    game.physics.p2.setBoundsToWorld(true, true, true, true, false);

	cursors = game.input.keyboard.createCursorKeys();

    text = game.add.text(16, 16, 'Get the heart!');
}

function update() {
	hero.body.setZeroVelocity();

    if (cursors.left.isDown)
    {
    	hero.body.moveLeft(200);
    }
    else if (cursors.right.isDown)
    {
    	hero.body.moveRight(200);
    }

    if (cursors.up.isDown)
    {
    	hero.body.moveUp(200);
    }
    else if (cursors.down.isDown)
    {
    	hero.body.moveDown(200);
    }

    checkHearts();
}

function render() {

}

function checkHearts() {
    hearts.forEach(function(heart){
        if (checkOverlap(hero, heart)) {
            text.text = 'You got one heart!';
            heart.kill();
        }
    }, this);
}

function checkOverlap(spriteA, spriteB) {
    var boundsA = spriteA.getBounds();
    var boundsB = spriteB.getBounds();

    return Phaser.Rectangle.intersects(boundsA, boundsB);
}
