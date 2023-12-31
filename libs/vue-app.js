
const PageList = {
    Page1: {
        template: `
        <form id="page1">
            <fieldset v-show="step1">
                <label for="nameField" class="white-title"><h1>請輸入名字</h1></label>
                <div class="box">
                    <input type="text" placeholder="請輸入名字" id="nameField" v-model="nameField">
                    <input class="button button-black button-large" type="submit" value="好，開始！" @click="setName">
                </div>
            </fieldset>
            <fieldset v-show="step2" class="box">
                <label for="nameField"><h3>嗨～<span style="color: #000;">{{nameField}}</span> <br> 請選擇關卡</h3></label>
                <button class="button button-outline button-large" @click="goGame('1')">初級</button>
                <button class="button button-outline button-large" @click="goGame('2')">中級</button>
                <button class="button button-outline button-large" @click="goGame('3')">高級</button>
            </fieldset>
        </form>
        `,
        data: function () {
            return {
                step1: true,
                step2: false,
                nameField: ''
            };
        },
        methods: {
            setName() {
                if (!this.nameField) return alert('你沒有填寫名字！！')
                Cookies.set('name', this.nameField)
                this.step1 = false
                this.step2 = true
            },
            goGame(key) {
                this.$router.push('/page2');
            }
        }
    },
    Page2: {
        template: '<div id="phaser-1"></div>',
        data () {
            return {
                show: true,
            };
        },
        mounted () {
            this.initPhaser();
        },
        destroyed () {
            this.destroyPhaser();
        },
        methods: {
            initPhaser () {
                var config = {
                    type: Phaser.AUTO,
                    width: 800,
                    height: 600,
                    scene: {
                        preload: preload,
                        create: create,
                        update: update,
                    },
                    physics: {
                        default: 'arcade',
                        arcade: {
                            gravity: { y: 300 },
                            debug: false,
                        },
                    },
                };
    
                this.game = new Phaser.Game(config);
    
                var player;
                var stars;
                var bombs;
                var platforms;
                var cursors;
                var score = 0;
                var gameOver = false;
                var scoreText;
                let option = {
                    answer: null,
                    other: [{
                        n: 'aa.jpg',
                        s: 0.3,
                        isA: 0
                    }, {
                        n: 'bb.jpg',
                        s: 0.1,
                        isA: 0
                    }, {
                        n: 'cc.jpg',
                        s: 0.2,
                        isA: 1
                    }],
                };
    
                function preload () {
                    this.load.image('sky', 'assets/sky.png');
                    this.load.image('ground', 'assets/platform.png');
    
                    this.load.image('bomb', 'assets/bomb.png');
                    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
    
                    option.other.forEach((v) => this.load.image(v.n, `assets/${v.n}`))
                }
    
                function create () {
                    // 把背景放進去
                    this.add.image(400, 300, 'sky');
    
                    // 平台組包含地面和我們可以跳上的 2 個壁架
                    platforms = this.physics.add.staticGroup();
    
                    // 這裡我們創建地面。
                    // 縮放以適應遊戲的寬度（原始精靈大小為 400x32）
                    platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    
                    // 建立懸浮的的地板
                    platforms.create(600, 400, 'ground');
                    platforms.create(50, 250, 'ground');
                    platforms.create(750, 220, 'ground');
    
                    // 建立選項
                    option.answer = this.add.image(720, 322, 'target').setScale(0.2);
                    option.other.sort(() => 0.5 - Math.random()).forEach((v, i) => {
                        let addr = [{ x: 720, y: 135 }, { x: 55, y: 185 }, { x: 720, y: 322 }]
                        if (v.isA) {
                            option[`answer`] = this.add.image(addr[i].x, addr[i].y, v.n).setScale(v.s);
                            return
                        }
                        option[v.n] = this.add.image(addr[i].x, addr[i].y, v.n).setScale(v.s);
                    })
    
                    // 玩家及其設定
                    player = this.physics.add.sprite(100, 450, 'dude');
    
                    // 玩家物理屬性。 讓小傢伙稍微彈跳一下。
                    player.setBounce(0.2);
                    player.setCollideWorldBounds(true);
    
                    // 建利勝利訊息，但初始時不可見
                    victoryText = this.add.text(340, 200, '答案正確!', { fontSize: '32px', fill: '#fff' });
                    victoryText.setVisible(false);
    
                    loseText = this.add.text(340, 200, '答案錯誤!', { fontSize: '32px', fill: '#fff' });
                    loseText.setVisible(false);
    
                    // 我們的玩家動畫，轉彎、向左行走和向右行走。
                    this.anims.create({
                        key: 'left',
                        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
                        frameRate: 10,
                        repeat: -1,
                    });
    
                    this.anims.create({
                        key: 'turn',
                        frames: [{ key: 'dude', frame: 4 }],
                        frameRate: 20,
                    });
    
                    this.anims.create({
                        key: 'right',
                        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
                        frameRate: 10,
                        repeat: -1,
                    });
    
                    // 輸入事件
                    cursors = this.input.keyboard.createCursorKeys();
    
                    // 畫面點擊事件
                    this.graphics = this.add.graphics();
                    this.input.addPointer(3);
    
                    // 需要收集一些星星，總共 12 個，沿著 x 軸均勻分佈，間隔 70 像素
                    // stars = this.physics.add.group({
                    //     key: 'star',
                    //     repeat: 11,
                    //     setXY: { x: 12, y: 0, stepX: 70 },
                    // });
    
                    // stars.children.iterate(function (child) {
                    //     //  給每顆星星稍微不同的反彈 (Give each star a slightly different bounce)
                    //     child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
                    // });
    
                    // 炸彈
                    bombs = this.physics.add.group();
    
                    //  分數設計
                    scoreText = this.add.text(16, 16, '選擇聽到的內容 🔊', { fontSize: '32px', fill: '#000' });
    
                    //  將玩家和星星與平台碰撞
                    this.physics.add.collider(player, platforms);
                    // this.physics.add.collider(stars, platforms);
                    this.physics.add.collider(bombs, platforms);
    
                    // 檢查玩家是否與任何星星重疊，如果他呼叫了collectStar函數
                    // this.physics.add.overlap(player, stars, collectStar, null, this);
    
                    this.physics.add.collider(player, bombs, hitBomb, null, this);
    
                    addBomb();
                }
    
                function update () {
                    if (gameOver) {
                        return;
                    }
    
                    if (cursors.left.isDown) {
                        player.setVelocityX(-160);
                        player.anims.play('left', true);
                    } else if (cursors.right.isDown) {
                        player.setVelocityX(160);
                        player.anims.play('right', true);
                    } else {
                        player.setVelocityX(0);
                        player.anims.play('turn');
                    }
    
                    if (cursors.up.isDown && player.body.touching.down) {
                        player.setVelocityY(-330);
                    }
    
                    // 跳起來的部分
                    if (this.input.pointer1.isDown && player.body.touching.down) {
                        player.setVelocityY(-330);
                    }
    
                    if (this.input.pointer1.isDown) {
                        if (this.input.pointer1.x > player.x) {
                            player.setVelocityX(160);
                            player.anims.play('right', true);
                        } else if (this.input.pointer1.x < player.x) {
                            player.setVelocityX(-160);
                            player.anims.play('left', true);
                        } else {
                            player.setVelocityX(0);
                            player.anims.play('turn');
                        }
                    }
    
                    if (Phaser.Geom.Intersects.RectangleToRectangle(player.getBounds(), option.answer.getBounds())) {
                        console.log('Victory! You reached the target!');
                        victoryText.setVisible(true);
                        setTimeout(() => {
                            this.scene.restart();
                            // 隐藏胜利消息
                            victoryText.setVisible(false);
    
                            // 重置玩家位置
                            player.x = 100;
                            player.y = 450;
                        }, 2000); // 2秒后重置游戏，你可以根据需要调整时间
                    }
    
                    option.other.forEach((v) => {
                        if (v.isA) return
                        if (Phaser.Geom.Intersects.RectangleToRectangle(player.getBounds(), option[v.n].getBounds())) {
                            loseText.setVisible(true);
                            this.physics.pause();
                            player.setTint(0xff0000);
                            player.anims.play('turn');
                            gameOver = true;
                            setTimeout(() => {
                                this.scene.restart();
                                // 隐藏胜利消息
                                loseText.setVisible(false);
    
                                this.physics.resume();
                                gameOver = false;
                                player.setTint(0xffffff);
                                // 重置玩家位置
                                player.x = 100;
                                player.y = 450;
                            }, 2000); // 2秒后重置游戏，你可以根据需要调整时间
                        }
                        this.load.image(v.n, `assets/${v.n}`)
                    })
                }
    
                function collectStar (player, star) {
                    console.log('New!!');
                    star.disableBody(true, true);
                    //  新增和更新分數
                    score += 10;
                    scoreText.setText('Score: ' + score);
    
                    if (stars.countActive(true) === 0) {
                        //  收集新一批星星
                        stars.children.iterate(function (child) {
                            child.enableBody(true, child.x, 0, true, true);
                        });
    
                        var x = player.x < 400 ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
    
                        var bomb = bombs.create(x, 16, 'bomb');
                        bomb.setBounce(1);
                        bomb.setCollideWorldBounds(true);
                        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
                        bomb.allowGravity = false;
                    }
                }
    
                function hitBomb (player, bomb) {
                    this.physics.pause();
                    player.setTint(0xff0000);
                    player.anims.play('turn');
                    gameOver = true;
                }
    
                function addBomb () {
                    let x = Phaser.Math.Between(0, 400);
                    let bomb = bombs.create(x, 16, 'bomb');
                    bomb.setBounce(1);
                    bomb.setCollideWorldBounds(true);
                    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
                    bomb.allowGravity = false;
                }
            },
            destroyPhaser () {
                this.game.destroy(true);
            }
        },
    },
    Page3: {
        template: '<div id="phaser-x"></div>',
        mounted () {
            this.initPhaser();
        },
        destroyed () {
            this.destroyPhaser();
        },
        methods: {
            initPhaser () {
                this.game = new Phaser.Game({
                    type: Phaser.AUTO,
                    width: 800,
                    height: 600,
                    scene: {
                        preload: preload,
                        create: create,
                        update: update,
                    },
                });
    
                function preload () {
                }
                function create () {
                }
                function update () {
                }
            },
            destroyPhaser () {
                this.game.destroy(true);
            }
        },
    },
    PageDefault: {
        template: '<div id="phaser-x"></div>',
        mounted () {
            this.initPhaser();
        },
        destroyed () {
            this.destroyPhaser();
        },
        methods: {
            initPhaser () {
                this.msSpeed = speed;
                this.value = 0;
                this.game = new Phaser.Game({
                    type: Phaser.AUTO,
                    width: 800,
                    height: 600,
                    scene: {
                        preload: preload,
                        create: create,
                        update: update,
                    },
                });
    
                function preload () {
                }
                function create () {
                }
                function update () {
                }
            },
            destroyPhaser () {
                this.game.destroy(true);
            },
            moveLeft(delta) {
                if (this.value > 0) { this.reset(); }
                this.value -= this.msSpeed * delta;
                if (this.value < -1) { this.value = -1; }
            },
        
            moveRight(delta) {
                if (this.value < 0) { this.reset(); }
                this.value += this.msSpeed * delta;
                if (this.value > 1) { this.value = 1; }
            },
        
            reset() {
                this.value = 0;
            }
        },
    }
}

const routes = [];

for (const [key, value] of Object.entries(PageList)) {
    routes.push({
        path: `/${key}`.toLowerCase(), component: value
    })
}

const router = new VueRouter({
    routes
});

new Vue({
    el: '#app',
    router
});
