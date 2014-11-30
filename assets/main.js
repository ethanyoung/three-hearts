var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'game-screen', { preload: preload, create: create, update: update, render: render })

function preload() {
    game.load.tilemap('map', 'assets/tilemaps/maps/collision_test.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('hero', 'assets/hero.png');
    game.load.image('ground_1x1', 'assets/tilemaps/tiles/walls_1x1.png');
    game.load.image('walls_1x2', 'assets/tilemaps/tiles/walls_1x1.png');
    game.load.image('tiles2', 'assets/tilemaps/tiles/walls_1x1.png');
}

var hero;
var cursors;
var map;

function create() {
    game.physics.startSystem(Phaser.Physics.P2JS);
	game.stage.backgroundColor = '#55AE3A';
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
    game.camera.follow(hero);
	hero.body.setZeroDamping();
	hero.body.fixedRotation = true;

    game.physics.p2.setBoundsToWorld(true, true, true, true, false);

	cursors = game.input.keyboard.createCursorKeys();
}

function update() {
	hero.body.setZeroVelocity();

    if (cursors.left.isDown)
    {
    	hero.body.moveLeft(400);
    }
    else if (cursors.right.isDown)
    {
    	hero.body.moveRight(400);
    }

    if (cursors.up.isDown)
    {
    	hero.body.moveUp(400);
    }
    else if (cursors.down.isDown)
    {
    	hero.body.moveDown(400);
    }
}

function render() {

}
