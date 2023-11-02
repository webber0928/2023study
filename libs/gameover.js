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
    }
};

const game = new Phaser.Game(config);


function preload() {
    // 加載資源
}

function create() {
    // 創建遊戲場景
    const text = this.add.text(400, 300, 'GAME OVER!', { fontFamily: 'Arial', size: 20, color: '#000' }).setOrigin(0.5, 0.5);

        this.tweens.addCounter({
            from: 0,
            to: 1,
            duration: 3000,
            yoyo: true,
            onUpdate: (tween) => {
                const v = tween.getValue();
                const c = 255 * v;

                text.setFontSize(20 + v * 64);
                text.setColor(`rgb(${c}, ${c}, ${c})`);
            }
        });
}

function update() {
    // 遊戲更新邏輯
}