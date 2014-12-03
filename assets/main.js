var game = new Phaser.Game(320, 480, Phaser.CANVAS, 'game-screen');

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
var left= false;

var mainState = {
    preload: function() {
        game.load.tilemap('map', 'assets/tilemaps/maps/collision_test.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.image('player', 'assets/player.png');
        game.load.image('ground_1x1', 'assets/tilemaps/tiles/walls_1x1.png');
        game.load.image('walls_1x2', 'assets/tilemaps/tiles/walls_1x1.png');
        game.load.image('tiles2', 'assets/tilemaps/tiles/walls_1x1.png');
        game.load.image('heart', 'assets/heart.png');
        game.load.image('enemy', 'assets/enemy.png');   
        game.load.image('flower', 'assets/flower.png');
        game.load.image('diamond', 'assets/diamond.png');
        game.load.image('star', 'assets/star_particle.png');

        game.load.spritesheet('buttonvertical', 'assets/buttons/button-vertical.png',64,64);
        game.load.spritesheet('buttonhorizontal', 'assets/buttons/button-horizontal.png',96,64);

        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
    },


    create: function() {
        if (!game.device.desktop) { 
            game.input.onDown.add(fullScreen, this); 
        }

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

        player.body.velocity.x = 0;
        player.body.velocity.y = 0;

        if (cursors.left.isDown || left) {
            player.body.velocity.x = -200;
        }
        else if (cursors.right.isDown || right) {
            player.body.velocity.x = 200;
        }

        else if (cursors.up.isDown || up) {
            player.body.velocity.y = -200;
        }
        else if (cursors.down.isDown || down) {
            player.body.velocity.y = 200;
        }


        this.checkHearts();

        if (score == 3) {
            this.goodGame();
        }
    },

    checkHearts: function() {
        hearts.forEach(function(heart){
            if (this.checkOverlap(player, heart)) {
                score += 1;
                text.text = 'You got ' + score + ' heart!';
                heart.kill();
            }
        }, this, true);
    },

    checkOverlap: function(spriteA, spriteB) {
        var boundsA = spriteA.getBounds();
        var boundsB = spriteB.getBounds();

        return Phaser.Rectangle.intersects(boundsA, boundsB);
    },

    gameOver: function(player, enemy) {
        player.kill();
        restart();
    },

    restart: function() {
        player.reset(200, 200);
    },

    goodGame: function() {
        enemies.destroy();
        emitter = game.add.emitter(1400, 100, 200);
        emitter.makeParticles(['star', 'diamond', 'flower']);
        emitter.gravity = 200;
        particleBurst();
        text.text = 'Go to the EAST!';
    },

    particleBurst: function() {
        emitter.start(true, 5000, 20);
    },

    fullScreen: function() {
        game.scale.startFullScreen(false);
    },
};

game.state.add('main', mainState);
game.state.start('main');