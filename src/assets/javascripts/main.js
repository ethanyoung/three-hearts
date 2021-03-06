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

var TILE_WIDTH = 32;
var TILE_HEIGHT = 32;

var score;
var player;
var princess;
var cursors;
var map;
var hearts;
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
var invitText;
var resultText;
var timer;
var timerText;
var mainStyle;
var promtText;
var trees;
var win = false;

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

var princessPosition = createPoint(40.5, 8);

var chestPosition = createPoint(55, 25);

var treePositions = [createPoint(26, 22), createPoint(26, 23)];

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
        game.load.spritesheet('tree', 'assets/tilemaps/tiles/tiles.png', 32, 32, 1);

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

        trees = game.add.group();
        for (var i = 0; i < treePositions.length; i++) {
            var tree = trees.create(treePositions[i].x, treePositions[i].y, 'tree');
            game.physics.enable(tree);
            tree.body.immovable = true;
        }

        game.camera.follow(player);

        cursors = game.input.keyboard.createCursorKeys();

        mainStyle = { font: "30px Sans-serif", fill: "#000000" };

        timer = game.time.create(false);
        timer.start();

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
        game.physics.arcade.collide(player, princess, this.promtChest, null, this);
        game.physics.arcade.collide(player, chest, this.openChest, null, this);
        game.physics.arcade.collide(player, trees);

        for (var i = 0; i < keysArray.length; i++) {
            game.physics.arcade.overlap(player, keysArray[i], this.getKey, null, this);
        }

        player.body.velocity.x = 0;
        player.body.velocity.y = 0;

        if (resultText == null) {
            this.processMoving();
        }

        if (score == 3) {
            this.beforeGoodGame();
        }

        if(win) {
        	this.goodEnding();
        }
    },

    getHeart: function(player, heart) {
        score += 1;
        heart.body.enable = false;
        var tweenTime = Phaser.Timer.SECOND * 0.5;
        game.add.tween(heart.scale).to( { x: 2, y: 2 }, tweenTime, Phaser.Easing.Linear.None, true, 0, 1000, true);
        game.add.tween(heart).to( { alpha: 0 }, tweenTime, Phaser.Easing.Linear.None, true, 0, 1000, true);
        game.add.tween(heart.position).to( { x: heart.position.x - heart.width / 2, y: heart.position.y - heart.height / 2}, tweenTime, Phaser.Easing.Linear.None, true, 0, 1000, true );
        game.time.events.add(tweenTime, function() { heart.kill(); }, this);
    },

    // render: function() {
    //     game.debug.spriteInfo(player, 32, 32);
    //     game.debug.text(timer.seconds, 32, 32);
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
        }

        if (chest == null) {
            chest = game.add.sprite(chestPosition.x, chestPosition.y, 'chest');
            game.physics.enable(chest);
            chest.body.immovable = true;
        }

        trees.destroy();
    },

    goodGame: function() {
        if (timerText == null) {
            btnUp.destroy();
            btnRight.destroy();
            btnDown.destroy();
            btnLeft.destroy();

            if (emitter == null){
                emitter = game.add.emitter(player.position.x, player.position.y - 32 * 9, 200);
                emitter.makeParticles(['star', 'diamond', 'flower']);
                emitter.gravity = 200;
                emitter.start(false, 5000, 20);
            }

            player.animations.stop();
            player.frame = 0;

            timer.pause();
            seconds = Math.floor(timer.seconds % 60);
            minutes = Math.floor(timer.ms / Phaser.Timer.MINUTE);
            if(seconds < 10) {
                seconds = '0' + seconds;
            }
            if(minutes < 10) {
                minutes = '0' + minutes;
            }

            timerText = game.add.text(game.width / 2, game.height / 2 - 32, '', mainStyle);
            timerText.text = minutes + ':' + seconds;
            timerText.fixedToCamera = true;
            timerText.anchor.set(0.5);
            var tweenTime = Phaser.Timer.SECOND / 2;
            game.add.tween(timerText.scale).to( { x: 1.5, y: 1.5 }, tweenTime, Phaser.Easing.Linear.None, true, 0, 1000, true);

            var ratio = this.computeRatio();
            resultText = game.add.text(game.width / 2, game.height / 2 + 32, "You've overtaken\n" + ratio + '%\nof the players', mainStyle);
            resultText.anchor.set(0.5);
            resultText.align = 'center';
            resultText.fixedToCamera = true;

            game.camera.unfollow();
            win = true;
        }
    },

    goodEnding: function() {
    	if (game.camera.y < TILE_HEIGHT * 25) {
    		game.camera.y += 2;
    	}
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
        if (invitText == null){

            if (promtText != null) {
                promtText.destroy();
            }

            var whiteStyle = { font: "30px Sans-serif", fill: "#ffffff" };
            invitText = game.add.text(game.width / 2, 32, "Got treasure!", whiteStyle);
            invitText.anchor.set(0.5);
            invitText.align = 'center';
            invitText.fixedToCamera = true;

            this.goodGame();
        }
    },

    computeRatio: function() {
        seconds = timer.seconds
        if(seconds < 180) {
            return Math.round((1 - seconds / 120) * 100);
        }
        else {
            return 1;
        }
            
    },

    updateTimer: function() {

    },

    processMoving: function() {
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
    },

    promtChest: function() {
    if (promtText == null) {
        var whiteStyle = { font: "30px Sans-serif", fill: "#ffffff" };
        promtText = game.add.text(game.width / 2, 32, "Go to east！", whiteStyle);
        promtText.anchor.set(0.5);
        promtText.align = 'center';
        promtText.fixedToCamera = true;}
    }
};

game.state.add('main', mainState);
game.state.start('main');

function createPoint(tileIndexX , tileIndexY) {
    return new Phaser.Point(tileIndexX * TILE_WIDTH, tileIndexY * TILE_HEIGHT);
}
