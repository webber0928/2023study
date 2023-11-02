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
var timerEvents = [];
var hsv;
var graphics;
var text;

function preload() {
    // 加載資源
}

function create() {
    // 創建遊戲場景
    text = this.add.text(32, 32);

    for (let i = 0; i < 32; i++)
    {
        timerEvents.push(this.time.addEvent({ delay: Phaser.Math.Between(1000, 8000), loop: true }));
    }

    hsv = Phaser.Display.Color.HSVColorWheel();

    graphics = this.add.graphics({ x: 240, y: 36 });
}

function update() {
    // 遊戲更新邏輯
    const output = [];

        graphics.clear();

        for (let i = 0; i < timerEvents.length; i++)
        {
            output.push(`Event.progress: ${timerEvents[i].getProgress().toString().substr(0, 4)}`);

            graphics.fillStyle(hsv[i * 8].color, 1);
            graphics.fillRect(0, i * 16, 500 * timerEvents[i].getProgress(), 8);
        }

        text.setText(output);
}