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
var WEST = 3

var score;
var player;
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

var respawnPosition = createPoint(5, 2);
var heartPositions =  [
    createPoint(1, 18.5),
    createPoint(8.5, 18.5),
    createPoint(3, 36)
];
var enemyPositions = [
    createPoint(27, 19.5),
    createPoint(25, 19.5),
    createPoint(4, 13),
    createPoint(25, 23),
    createPoint(4, 36)
];
var emitterPosition = createPoint(1400, 32);
var keyPositions = [ 
    createPoint(2, 15),
    createPoint(23, 5),
    createPoint(1, 25.5)
];
var doorPositions = [ 
    [   
        createPoint(8, 17), 
        createPoint(9, 17)],
    [
        createPoint(25, 20),
        createPoint(26, 20),
        createPoint(27, 20),
        createPoint(3, 18),
        createPoint(3, 19)],
    [
        createPoint(40, 14),
        createPoint(40, 15),
        createPoint(40, 16)]
];

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
        map.setCollisionBetween(1, 6);

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

        game.camera.follow(player);

        cursors = game.input.keyboard.createCursorKeys();

        var style = { font: "30px Arial", fill: "#000000" };
        text = game.add.text(16, 16, 'Get the three hearts!', style);
        text.fixedToCamera = true;

        buttonup = game.add.button(128, 288, 'buttonvertical', null, this, 0, 1, 0, 1);
        buttonup.fixedToCamera = true;
        buttonup.events.onInputOver.add(function(){up=true;});
        buttonup.events.onInputOut.add(function(){up=false;});
        buttonup.events.onInputDown.add(function(){up=true;});
        buttonup.events.onInputUp.add(function(){up=false;});

        buttonleft = game.add.button(32, 352, 'buttonhorizontal', null, this, 0, 1, 0, 1);
        buttonleft.fixedToCamera = true;
        buttonleft.events.onInputOver.add(function(){left=true;});
        buttonleft.events.onInputOut.add(function(){left=false;});
        buttonleft.events.onInputDown.add(function(){left=true;});
        buttonleft.events.onInputUp.add(function(){left=false;});

        buttondown = game.add.button(128, 416, 'buttonvertical', null, this, 0, 1, 0, 1);
        buttondown.fixedToCamera = true;
        buttondown.events.onInputOver.add(function(){down=true;});
        buttondown.events.onInputOut.add(function(){down=false;});
        buttondown.events.onInputDown.add(function(){down=true;});
        buttondown.events.onInputUp.add(function(){down=false;});

        buttonright = game.add.button(192, 352, 'buttonhorizontal', null, this, 0, 1, 0, 1);
        buttonright.fixedToCamera = true;
        buttonright.events.onInputOver.add(function(){right=true;});
        buttonright.events.onInputOut.add(function(){right=false;});
        buttonright.events.onInputDown.add(function(){right=true;});
        buttonright.events.onInputUp.add(function(){right=false;});
    },

    update: function() {
        game.physics.arcade.collide(player, layer);
        game.physics.arcade.collide(enemies, layer);
        game.physics.arcade.collide(hearts, layer);
        game.physics.arcade.overlap(player, enemies, this.gameOver, null, this);
        game.physics.arcade.collide(player, doors);
        game.physics.arcade.overlap(player, hearts, this.getHeart, null, this);

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

        if (score == 3 && emitter == null) {
            this.goodGame();
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

    goodGame: function() {
        enemies.destroy();
        emitter = game.add.emitter(1400, 100, 200);
        emitter.makeParticles(['star', 'diamond', 'flower']);
        emitter.gravity = 200;
        emitter.start(false, 5000, 20);
        text.text = 'Go to the EAST!';
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
};

game.state.add('main', mainState);
game.state.start('main');

function createPoint(tileIndexX , tileIndexY) {
    return new Phaser.Point(tileIndexX * 32, tileIndexY * 32);
}