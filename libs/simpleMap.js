const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#2d2d2d',
    parent: 'phaser-example',
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 600 }
        }
    },
};

const game = new Phaser.Game(config);
var cursors, pickups, player, layer, tileset, map

function preload() {
    // 加載資源
    this.load.image('tiles', 'assets/tilemaps/tiles/gridtiles.png');
    this.load.tilemapTiledJSON('map', 'assets/tilemaps/maps/simple-map.json');
    this.load.image('player', 'assets/sprites/phaser-dude.png');
}

function create() {
    // 創建遊戲場景
    map = this.make.tilemap({ key: 'map', tileWidth: 32, tileHeight: 32 });
    tileset = map.addTilesetImage('tiles');
    layer = map.createLayer('Level1', tileset);

    map.setCollision([ 20, 48 ]);

    pickups = map.filterTiles(tile => tile.index === 82);

    player = this.add.rectangle(96, 96, 24, 38, 0xffff00);

    this.physics.add.existing(player);

    this.physics.add.collider(player, layer);

    cursors = this.input.keyboard.createCursorKeys();

    cursors.up.on('down', () =>
    {
        if (player.body.blocked.down)
        {
            player.body.setVelocityY(-360);
        }
    }, this);
}

function update() {
    // 遊戲更新邏輯
    player.body.setVelocityX(0);

    if (cursors.left.isDown)
    {
        player.body.setVelocityX(-200);
    }
    else if (cursors.right.isDown)
    {
        player.body.setVelocityX(200);
    }

    this.physics.world.overlapTiles(player, pickups, hitPickup, null, this);
}

function hitPickup (player, tile)
    {
        map.removeTile(tile, 29, false);

        this.pickups = map.filterTiles(tile => tile.index === 82);
    }