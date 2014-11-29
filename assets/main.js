var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'game-screen', { preload: preload, create: create, update: update })

function preload() {
	game.stage.backgroundColor = '#71c5cf';
	game.load.image('hero', 'assets/hero.png');
}

var hero;
var cursors;

function create() {
	game.physics.startSystem(Phaser.Physics.P2JS);

	game.physics.p2.defaultRestitution = 0.8;

	hero = game.add.sprite(200, 200, 'hero');

	game.physics.p2.enable(hero);

	hero.body.setZeroDamping();
	hero.body.fixedRotation = true;

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

