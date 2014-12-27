Key = function (game, x, y, doorSet) {
    Phaser.Sprite.call(this, game, x, y, 'key');
    this.doorSet = doorSet;
    game.add.existing(this);
};

Key.prototype = Object.create(Phaser.Sprite.prototype);
Key.prototype.constructor = Key;

var game = new Phaser.Game(320, 480, Phaser.CANVAS, 'game-screen');

var NORTH = 0;
var SOUTH = 1;
var EAST = 2;
var WEST = 3;

var score;
var player;
var princess;
var cursors;
var map;
var hearts;
var text;
var enemies;
var emitter;
var up = false;
var right = false;
var down = false;
var left = false;
var face = SOUTH;
var doors;
var keysArray = [];
var chest;
var endingText;

var respawnPosition = createPoint(5, 2);
var heartPositions =  [
    createPoint(1.5, 19.5),
    createPoint(7.5, 19.5),
    createPoint(2, 36)
];
var enemyPositions = [
    createPoint(15, 20),
    createPoint(17, 20),
    createPoint(4, 13),
    createPoint(15, 23),
    createPoint(4, 36)
];
var emitterPosition = createPoint(42.5, 0);
var keyPositions = [
    createPoint(2, 15),
    createPoint(23, 2),
    createPoint(1.5, 29)
];
var doorPositions = [
    [
        createPoint(7, 17),
        createPoint(8, 17)],
    [
        createPoint(15, 20),
        createPoint(16, 20),
        createPoint(17, 20),
        createPoint(3, 19),
        createPoint(3, 20)],
    [
        createPoint(26, 19),
        createPoint(27, 19),
        createPoint(28, 19)]
];

var princessPosition = createPoint(42.5, 12);

var chestPosition = createPoint(40, 10);

var mainState = {
    preload: function() {
        game.load.tilemap('map', 'assets/tilemaps/maps/main.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.image('tiles', 'assets/tilemaps/tiles/tiles.png');
        game.load.image('heart', 'assets/sprites/heart.png');
        game.load.image('enemy', 'assets/sprites/enemy.png');
        game.load.image('flower', 'assets/sprites/flower.png');
        game.load.image('diamond', 'assets/sprites/diamond.png');
        game.load.image('star', 'assets/sprites/star_particle.png');
        game.load.image('key', 'assets/sprites/key.png');
        game.load.image('door', 'assets/sprites/door.png');
        game.load.image('princess', 'assets/sprites/princess.png');
        game.load.image('chest', 'assets/sprites/chest.png');

        game.load.spritesheet('player', 'assets/sprites/player.png', 28, 32);
        game.load.spritesheet('buttonvertical', 'assets/buttons/button-vertical.png',64,64);
        game.load.spritesheet('buttonhorizontal', 'assets/buttons/button-horizontal.png',96,64);

        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
    },

    create: function() {
        if (!game.device.desktop) {
            game.input.onDown.add(this.fullScreen, this);
        }

        score = 0;

        game.physics.startSystem(Phaser.Physics.ARCADE);

        map = game.add.tilemap('map');
        map.addTilesetImage('tiles');
        layer = map.createLayer('Tile Layer 1');
        layer.resizeWorld();
        map.setCollisionBetween(1, 8);

        player = game.add.sprite(respawnPosition.x, respawnPosition.y, 'player');
        game.physics.enable(player);
        player.body.fixedRotation = true;
        player.body.collideWorldBounds = true;
        player.animations.add('walk_down', [1, 2], 5, true);
        player.animations.add('walk_up', [4, 5], 5, true);
        player.animations.add('walk_left', [7, 8], 5, true);
        player.animations.add('walk_right', [10, 11], 5, true);

        hearts = game.add.group();
        hearts.enableBody = true;
        for (var i = 0; i < heartPositions.length; i++) {
            hearts.create(heartPositions[i].x, heartPositions[i].y, 'heart');
        }

        enemies = game.add.group();
        enemies.enableBody = true;
        for (var i = 0; i < enemyPositions.length; i++) {
            var enemy = enemies.create(enemyPositions[i].x, enemyPositions[i].y, 'enemy');
            if (i >= 2) {
                enemy.body.velocity.x = 200;
            }

            enemy.body.bounce.set(1);
        }

        doors = game.add.group();
        doors.enableBody = true;
        for (var i = 0; i < doorPositions.length; i++) {
        	var doorPosition = doorPositions[i];
        	var doorSet = [];
        	for (var j = 0; j < doorPosition.length; j++) {
	            var door = doors.create(doorPosition[j].x, doorPosition[j].y, 'door');
	            door.body.immovable = true;
	            doorSet.push(door);
        	}

            var key = new Key(game, keyPositions[i].x, keyPositions[i].y, doorSet);
            game.physics.enable(key);
            keysArray.push(key);
        }

        chest = game.add.sprite(chestPosition.x, chestPosition.y, 'chest');
        game.physics.enable(chest);
        chest.body.immovable = true;

        game.camera.follow(player);

        cursors = game.input.keyboard.createCursorKeys();

        var style = { font: "30px Arial", fill: "#000000" };
        text = game.add.text(16, 16, 'Get the three hearts!', style);
        text.fixedToCamera = true;

        btnUp = game.add.button(128, 288, 'buttonvertical', null, this, 0, 1, 0, 1);
        btnUp.fixedToCamera = true;
        btnUp.events.onInputOver.add(function() { up=true; });
        btnUp.events.onInputOut.add(function() { up=false; });
        btnUp.events.onInputDown.add(function() { up=true; });
        btnUp.events.onInputUp.add(function() { up=false; });

        btnLeft = game.add.button(32, 352, 'buttonhorizontal', null, this, 0, 1, 0, 1);
        btnLeft.fixedToCamera = true;
        btnLeft.events.onInputOver.add(function() { left=true; });
        btnLeft.events.onInputOut.add(function() { left=false; });
        btnLeft.events.onInputDown.add(function() { left=true; });
        btnLeft.events.onInputUp.add(function() { left=false; });

        btnDown = game.add.button(128, 416, 'buttonvertical', null, this, 0, 1, 0, 1);
        btnDown.fixedToCamera = true;
        btnDown.events.onInputOver.add(function() { down=true; });
        btnDown.events.onInputOut.add(function() { down=false; });
        btnDown.events.onInputDown.add(function() { down=true; });
        btnDown.events.onInputUp.add(function() { down=false; });

        btnRight = game.add.button(192, 352, 'buttonhorizontal', null, this, 0, 1, 0, 1);
        btnRight.fixedToCamera = true;
        btnRight.events.onInputOver.add(function() { right=true ;});
        btnRight.events.onInputOut.add(function() { right=false ;});
        btnRight.events.onInputDown.add(function() { right=true ;});
        btnRight.events.onInputUp.add(function() { right=false ;});
    },

    update: function() {
        game.physics.arcade.collide(player, layer);
        game.physics.arcade.collide(enemies, layer);
        game.physics.arcade.collide(hearts, layer);
        game.physics.arcade.overlap(player, enemies, this.gameOver, null, this);
        game.physics.arcade.collide(player, doors);
        game.physics.arcade.overlap(player, hearts, this.getHeart, null, this);
        game.physics.arcade.collide(player, princess, this.goodGame, null, this);
        game.physics.arcade.collide(player, chest, this.openChest, null, this);

        for (var i = 0; i < keysArray.length; i++) {
            game.physics.arcade.overlap(player, keysArray[i], this.getKey, null, this);
        }

        player.body.velocity.x = 0;
        player.body.velocity.y = 0;

        if (cursors.left.isDown || left) {
            face = WEST;
            player.body.velocity.x = -200;
            player.animations.play('walk_left');
        }

        else if (cursors.right.isDown || right) {
            face = EAST;
            player.body.velocity.x = 200;
            player.animations.play('walk_right');
        }

        else if (cursors.up.isDown || up) {
            face = NORTH;
            player.body.velocity.y = -200;
            player.animations.play('walk_up');
        }

        else if (cursors.down.isDown || down) {
            face = SOUTH;
            player.body.velocity.y = 200;
            player.animations.play('walk_down');
        }

        else {
            player.animations.stop();
            switch(face) {
                case NORTH:
                    player.frame = 3;
                    break;
                case SOUTH:
                    player.frame = 0;
                    break;
                case WEST:
                    player.frame = 6;
                    break;
                case EAST:
                    player.frame = 9;
                    break;
            }
        }

        if (score == 3) {
            this.beforeGoodGame();
        }
    },

    getHeart: function(player, heart) {
        score += 1;
        text.text = 'You\'ve got ' + score + ' hearts.';
        heart.body.enable = false;
        var tweenTime = Phaser.Timer.SECOND * 0.5;
        game.add.tween(heart.scale).to( { x: 2, y: 2 }, tweenTime, Phaser.Easing.Linear.None, true, 0, 1000, true);
        game.add.tween(heart).to( { alpha: 0 }, tweenTime, Phaser.Easing.Linear.None, true, 0, 1000, true);
        game.add.tween(heart.position).to( { x: heart.position.x - heart.width / 2, y: heart.position.y - heart.height / 2}, tweenTime, Phaser.Easing.Linear.None, true, 0, 1000, true );
        game.time.events.add(tweenTime, function() { heart.kill(); }, this);
    },

    // render: function() {
    //     game.debug.spriteInfo(player, 32, 32);
    // },

    checkOverlap: function(spriteA, spriteB) {
        var boundsA = spriteA.getBounds();
        var boundsB = spriteB.getBounds();

        return Phaser.Rectangle.intersects(boundsA, boundsB);
    },

    gameOver: function(player, enemy) {
        player.kill();
        this.restart();
    },

    restart: function() {
        player.reset(respawnPosition.x, respawnPosition.y);
    },

    beforeGoodGame: function() {
        if (princess == null){
        	enemies.destroy();
            princess = game.add.sprite(princessPosition.x, princessPosition.y, 'princess');
            game.physics.enable(princess);
        	princess.body.immovable = true;
       	 	text.text = 'Go to the EAST!';
        }
    },

    goodGame: function() {
        text.text = 'Congradulations!';
		if (emitter == null){
			emitter = game.add.emitter(princess.position.x, 100, 200);
			emitter.makeParticles(['star', 'diamond', 'flower']);
			emitter.gravity = 200;
			emitter.start(false, 5000, 20);
		}

        player.frame = 0;

        cursors.up.enabled = false;
        cursors.right.enabled = false;
        cursors.down.enabled = false;
        cursors.left.enabled = false;

        btnUp.destroy();
        btnRight.destroy();
        btnDown.destroy();
        btnLeft.destroy();
    },

    fullScreen: function() {
        game.scale.startFullScreen(false);
    },

    getKey: function(player, key) {
        key.kill();

        var tweenTime = Phaser.Timer.SECOND * 0.5;
        for (var i = 0; i < key.doorSet.length; i++) {
            var door = key.doorSet[i];
            game.add.tween(door.scale).to( { x: 0, y: 0 }, tweenTime, Phaser.Easing.Linear.None, true, 0, 1000, true);
            game.add.tween(door.position).to( { x: door.position.x + door.width / 2, y: door.position.y + door.height / 2}, tweenTime, Phaser.Easing.Linear.None, true, 0, 1000, true );
        }

        game.time.events.add(tweenTime, function() {
            key.doorSet.forEach(function(door) {
            door.kill();
            });
        }, this);
    },

    openChest: function(player, chest) {
        text.text = '';
        var style = { font: "22px Sans-serif", fill: "#ffffff" };
        endintText = game.add.text(64, 32, "你获得了\n一份特别邀请!", style);
        endintText.align = 'center';
        endintText.fixedToCamera = true;
    }
};

game.state.add('main', mainState);
game.state.start('main');

function createPoint(tileIndexX , tileIndexY) {
    return new Phaser.Point(tileIndexX * 32, tileIndexY * 32);
}