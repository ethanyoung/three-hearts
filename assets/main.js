var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'game-screen', { preload: preload, create: create, update: update, render: render })

function preload() {
    game.load.tilemap('map', 'assets/tilemaps/maps/collision_test.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('player', 'assets/player.png');
    game.load.image('ground_1x1', 'assets/tilemaps/tiles/walls_1x1.png');
    game.load.image('walls_1x2', 'assets/tilemaps/tiles/walls_1x1.png');
    game.load.image('tiles2', 'assets/tilemaps/tiles/walls_1x1.png');
    game.load.image('heart', 'assets/heart.png');
    game.load.image('enemy', 'assets/enemy.png');   
}

var player;
var cursors;
var map;
var hearts;
var text;
var enemies;

function create() {
    score = 0;

    game.physics.startSystem(Phaser.Physics.ARCADE);
	game.stage.backgroundColor = '#018E0E';
    // game.physics.p2.defaultRestitution = 0.8;

    map = game.add.tilemap('map');

    map.addTilesetImage('ground_1x1');
    map.addTilesetImage('walls_1x2');
    map.addTilesetImage('tiles2');

    layer = map.createLayer('Tile Layer 1');
    layer.resizeWorld();
    map.setCollisionBetween(1, 12);

	player = game.add.sprite(200, 200, 'player');
	game.physics.enable(player);
    player.body.fixedRotation = true;
    player.body.collideWorldBounds = true;
    hearts = game.add.group();
    hearts.enableBody = true;
    hearts.create(500, 500, 'heart');
    hearts.create(300, 150, 'heart');
    hearts.create(600, 100, 'heart');

    enemies = game.add.group();
    enemies.enableBody = true;

    var enemy = enemies.create(600, 200, 'enemy');
    enemy.body.velocity.y = 200;
    enemy.body.bounce.set(1);

    game.camera.follow(player);

	cursors = game.input.keyboard.createCursorKeys();

    text = game.add.text(16, 16, 'Get the heart!');
}

function update() {
    game.physics.arcade.collide(player, layer);
    game.physics.arcade.collide(enemies, layer);
    game.physics.arcade.collide(hearts, layer);

	player.body.velocity.x = 0;
    player.body.velocity.y = 0;

    if (cursors.left.isDown)
    {
    	player.body.velocity.x = -200;
    }
    else if (cursors.right.isDown)
    {
    	player.body.velocity.x = 200;
    }

    if (cursors.up.isDown)
    {
    	player.body.velocity.y = -200;
    }
    else if (cursors.down.isDown)
    {
    	player.body.velocity.y = 200;
    }

    checkHearts();
}

function render() {

}

function checkHearts() {
    hearts.forEach(function(heart){
        if (checkOverlap(player, heart)) {
            score += 1;
            text.text = 'You got ' + score + ' heart!';
            heart.kill();
        }
    }, this, true);
}

function checkOverlap(spriteA, spriteB) {
    var boundsA = spriteA.getBounds();
    var boundsB = spriteB.getBounds();

    return Phaser.Rectangle.intersects(boundsA, boundsB);
}
