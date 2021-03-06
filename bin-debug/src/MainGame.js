/**
* Created by motionwalk on 14-8-2.
*/
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/**
* Class MainGame
*/
var MainGame = (function (_super) {
    __extends(MainGame, _super);
    function MainGame(w, h) {
        _super.call(this);
        this.sheet = RES.getRes("gameSheet");
        /**
        * 是否可以交互
        * Is ready to make interaction?
        * @type {boolean}
        */
        this.readyToEngage = false;
        this.drawScale = 50;
        this.score = 0;
        // 游戏用数据
        // Variables for use in the game
        /**
        * 玩家旋转步数，在 1 - 2 之间切换
        * Player rotation steps, switch between 1 and 2 steps
        * @type {number}
        */
        this.rotateSteps = 1;
        this.targetDirection = -1;
        // 三角形检测使用函数
        // For triangle test
        this.sign = function (n) {
            return Math.abs(n) / n;
        };

        // 设置尺寸
        // Set up sizes
        this.stageW = this.size = w;
        this.stageH = h;
        this.boardY = (this.stageH - this.stageW) / 2;
        this.centerPoint = new Point(this.stageW / 2, this.boardY + this.stageW / 2);

        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }
    /**
    * 初始化
    * Initialize
    */
    MainGame.prototype.onAddToStage = function () {
        var i;

        // 设置触摸层
        // Set up touch areas
        this.touchAreas = [];
        for (i = 0; i < 4; i++) {
            var touchArea = new egret.Bitmap();
            touchArea.texture = this.sheet.getTexture("touchArea");
            touchArea.anchorX = 0.5;
            touchArea.anchorY = 1.0;
            touchArea.x = this.stageW / 2;
            touchArea.y = this.boardY + this.stageW / 2;
            touchArea.scaleX = touchArea.scaleY = this.stageW / 300;
            touchArea.rotation = i * 90;
            touchArea.alpha = 0;
            this.touchAreas.push(touchArea);
            this.addChild(this.touchAreas[i]);
        }
        this.initPoints();

        // 设置底线
        // Set up board base lines
        var shp = new egret.Shape();
        shp.graphics.lineStyle(1, 0x555555);
        shp.graphics.moveTo(0, this.boardY);
        shp.graphics.lineTo(this.stageW, this.stageH - this.boardY);
        shp.graphics.moveTo(this.stageW, this.boardY);
        shp.graphics.lineTo(0, this.stageH - this.boardY);
        this.addChild(shp);

        // 设置时间绘制区
        this.timeGraph = new egret.Shape();
        this.timeGraph.anchorX = this.timeGraph.anchorY = 0.5;
        this.timeGraph.x = this.stageW / 2;
        this.timeGraph.y = this.boardY + this.stageW / 2;
        this.addChild(this.timeGraph);

        // 设置敌人
        // Set up enemies
        this.enemies = [];
        for (i = 0; i < 4; i++) {
            var enemy = new egret.Bitmap();
            enemy.texture = this.sheet.getTexture("enemy");
            enemy.anchorX = enemy.anchorY = 0.5;
            var p = this.getEnenmyResetPosition(i);
            enemy.x = p.x;
            enemy.y = p.y;
            enemy.alpha = 0;
            this.enemies.push(enemy);
            this.addChild(this.enemies[i]);
        }

        // 设置玩家
        // Set up player
        this.player = new egret.Bitmap();
        this.player.texture = this.sheet.getTexture("player");
        this.player.anchorX = this.player.anchorY = 0.5;
        this.player.x = this.centerPoint.x;
        this.player.y = this.centerPoint.y;
        this.addChild(this.player);

        // 设置子弹
        // Set up bullet
        this.bullet = new egret.Bitmap();
        this.bullet.texture = this.sheet.getTexture("bullet");
        this.bullet.anchorX = this.bullet.anchorY = 0.5;
        this.bullet.x = this.centerPoint.x;
        this.bullet.y = this.centerPoint.y;
        this.addChild(this.bullet);

        // 设置重玩按钮
        // Set up replay button
        this.touchSign = new egret.Bitmap();
        this.touchSign.texture = this.sheet.getTexture("touchStart");
        this.touchSign.anchorX = this.touchSign.anchorY = 0.5;
        this.touchSign.alpha = 0;
        this.touchSign.x = this.centerPoint.x;
        this.touchSign.y = this.stageH - 120;
        this.addChild(this.touchSign);

        // 设置主介绍
        // Set up main instruction
        this.mainInstruction = new egret.Bitmap();
        this.mainInstruction.texture = this.sheet.getTexture("mainInstruction");
        this.mainInstruction.anchorX = this.mainInstruction.anchorY = 0.5;
        this.mainInstruction.x = this.centerPoint.x;
        this.mainInstruction.y = this.centerPoint.y;
        this.mainInstruction.alpha = 0;
        this.mainInstruction.visible = false;
        this.addChild(this.mainInstruction);

        // 设置得分数字
        // Set up score label
        this.labelScore = new egret.TextField();
        this.labelScore.size = 30;
        this.labelScore.x = 2;
        this.labelScore.y = this.boardY - 50;
        this.addChild(this.labelScore);

        // 计算绘制需要的步长
        // Calculate draw step
        this.drawScaleStep = Math.ceil((this.stageW - this.drawScale) / 80);

        // 创建一个计时器对象
        // Create a Timer object
        this.timer = new egret.Timer(20);

        // 注册事件侦听器
        // Register Timer event listener
        this.timer.addEventListener(egret.TimerEvent.TIMER, this.timerFunc, this);

        // 初始化触摸监听
        // Initialize touch listener
        this.touchEnabled = true;
        this.addEventListener(egret.TouchEvent.TOUCH_END, this.onAreaTouched, this);

        this.setUpGame();
    };

    /**
    * 设置游戏
    * Set up game
    */
    MainGame.prototype.setUpGame = function () {
        var _this = this;
        this.isInTutorial = true;
        this.score = 0;
        this.updateScore();
        this.setupEnemies();

        this.player.visible = false;
        this.bullet.visible = false;
        this.mainInstruction.visible = true;
        this.mainInstruction.touchEnabled = true;
        egret.Tween.get(this.mainInstruction).to({ "alpha": 1, "y": this.mainInstruction.y - 10 }, 300).call(function () {
            _this.mainInstruction.addEventListener(egret.TouchEvent.TOUCH_END, _this.onDismissMainInstruction, _this);
        });
    };

    /**
    * 准备开始游戏
    * Ready to start game
    */
    MainGame.prototype.prepareGame = function () {
        var _this = this;
        this.player.visible = true;
        this.bullet.visible = true;
        this.mainInstruction.visible = false;
        this.mainInstruction.touchEnabled = false;

        // 设置演示方块
        // Set up demo block
        this.demoBlock = new egret.Bitmap;
        this.demoBlock.texture = this.sheet.getTexture("demoBlock");
        this.demoBlock.anchorX = this.demoBlock.anchorY = 0.5;
        this.demoBlock.x = this.stageW / 2;
        this.demoBlock.y = this.boardY + 40;
        this.demoBlock.alpha = 0;
        this.addChild(this.demoBlock);

        // 设置说明
        // Set up instruction
        this.instruction = new egret.Bitmap;
        this.instruction.texture = this.sheet.getTexture("instruction");
        this.instruction.anchorX = this.demoBlock.anchorY = 0.5;
        this.instruction.x = this.stageW / 2;
        this.instruction.y = this.boardY + this.stageW - 100;
        this.instruction.alpha = 0;
        this.addChild(this.instruction);

        egret.Tween.get(this.demoBlock).to({ "alpha": 1, "y": this.boardY + 50 }, 500);

        for (var j = 0; j < 4; j++) {
            egret.Tween.get(this.touchAreas[j]).wait(j * 200).to({ "alpha": 1 }, 300).to({ "alpha": 0 }, 200);
        }

        // 隐掉说明，开始游戏
        // Hide the instruction and start the game
        egret.Tween.get(this.instruction).to({ "alpha": 1 }, 800).wait(600).to({ "alpha": 0 }, 1000).call(function () {
            _this.removeChild(_this.instruction);
            _this.startGame();
        });
    };

    /**
    * 开始游戏
    * Start the game
    */
    MainGame.prototype.startGame = function () {
        this.readyToEngage = true;
        this.timer.start();
    };

    /**
    * 触摸响应，决定方向
    * Response to touch event, determin shoot direction
    * @param {egret.TouchEvent} e
    */
    MainGame.prototype.onAreaTouched = function (e) {
        if (!this.readyToEngage)
            return;

        var direction = -1;
        var touchPoint = new Point(e.stageX, e.stageY);
        for (var i = 0; i < 4; i++) {
            var points = this.points[i];
            if (this.isInsideTriangle(points[0], points[1], points[2], touchPoint)) {
                direction = i; // 0 - up, 1 - right, 2 - down, 3 - left
                break;
            }
        }

        if (direction != -1) {
            egret.Tween.get(this.touchAreas[direction]).to({ "alpha": 1 }, 200).to({ "alpha": 0 }, 100);
            this.player.rotation = direction * 90;
        }
    };

    /**
    * 时钟触发事件
    * Timer update event
    */
    MainGame.prototype.timerFunc = function () {
        this.drawScale += this.drawScaleStep;
        this.timeGraph.graphics.clear();
        this.timeGraph.graphics.lineStyle(2, 0x00AA00);
        this.timeGraph.graphics.drawRect(-this.drawScale, -this.drawScale, this.drawScale * 2, this.drawScale * 2);

        if (this.drawScale * 2 >= this.stageW) {
            this.timeGraph.graphics.clear();
            this.timer.stop();
            this.drawScale = 50;
            this.readyToEngage = false;
            this.rotatePlayer();
        }
    };

    /**
    * 玩家运动
    * Player make a move
    */
    MainGame.prototype.rotatePlayer = function () {
        this.rotateSteps = (this.rotateSteps == 2) ? 1 : 2;
        var rotation = this.player.rotation + this.rotateSteps * 90;
        egret.Tween.get(this.player).to({ "rotation": rotation }, 250 * this.rotateSteps).wait(300).call(this.fireTheLaser, this);
    };

    /**
    * 发动攻击
    * Fire the laser
    */
    MainGame.prototype.fireTheLaser = function () {
        var endPoint;

        this.player.rotation %= 360;
        switch (this.player.rotation) {
            case 0:
                endPoint = new Point(this.centerPoint.x, this.boardY);
                break;
            case 90:
                endPoint = new Point(this.stageW, this.centerPoint.y);
                break;
            case 180:
                endPoint = new Point(this.centerPoint.x, this.centerPoint.y + this.stageW / 2);
                break;
            case 270:
                endPoint = new Point(0, this.centerPoint.y);
                break;
        }

        egret.Tween.get(this.bullet).to({ "x": endPoint.x, "y": endPoint.y }, 250).call(this.checkHit, this);
    };

    MainGame.prototype.checkHit = function () {
        var _this = this;
        // 检查是否击中
        // Check if we hit the target
        this.bullet.alpha = 0;
        this.bullet.x = this.centerPoint.x;
        this.bullet.y = this.centerPoint.y;
        egret.Tween.get(this.bullet).to({ "alpha": 1 }, 200);
        if (this.isInTutorial) {
            if (this.player.rotation == 0) {
                this.demoBlock.texture = this.sheet.getTexture("demoBlockDestroyed");
                this.score++;
                this.updateScore();
                egret.Tween.get(this.demoBlock).to({ "alpha": 0 }, 300).wait(800).call(this.endTutorial, this);
            } else {
                setTimeout(function () {
                    _this.readyToEngage = true;
                    _this.timer.start();
                }, 800);
            }
        } else {
            var direction = (this.player.rotation % 360) / 90;
            if (direction == this.targetDirection) {
                this.enemies[direction].texture = this.sheet.getTexture("enemyDestroyed");
                this.score++;
                this.updateScore();
                for (var i = 0; i < 4; i++) {
                    if (i != 0)
                        egret.Tween.get(this.enemies[i]).to({ "alpha": 0 }, 500);
                    else
                        egret.Tween.get(this.enemies[i]).to({ "alpha": 0 }, 500).call(function () {
                            _this.setupEnemies();
                            _this.toNextRound();
                        });
                }
            } else {
                // GAME OVER
                setTimeout(function () {
                    _this.gameOver();
                }, 800);
            }
        }
    };

    /**
    * 执行下一局
    * Start net round
    */
    MainGame.prototype.toNextRound = function () {
        // 处理敌人显示
        this.targetDirection = Math.floor(Math.random() * 4);
        this.enemies[this.targetDirection].rotation += 180;
        this.enemies[this.targetDirection].rotation %= 360;
        for (var i = 0; i < 4; i++) {
            if (i != 0)
                egret.Tween.get(this.enemies[i]).to({ "alpha": 1 }, 500);
            else
                egret.Tween.get(this.enemies[i]).to({ "alpha": 1 }, 500).call(this.startGame, this);
        }
    };

    MainGame.prototype.updateScore = function () {
        this.labelScore.text = 'Score: ' + this.score;
    };

    /**
    * 结束教学
    * End the tutorial
    */
    MainGame.prototype.endTutorial = function () {
        this.removeChild(this.demoBlock);
        this.isInTutorial = false;
        this.toNextRound();
    };

    /**
    * Game Over
    */
    MainGame.prototype.gameOver = function () {
        this.touchSign.alpha = 1;
        this.touchSign.touchEnabled = true;
        this.touchSign.addEventListener(egret.TouchEvent.TOUCH_END, this.onReplayTouched, this);
    };

    MainGame.prototype.onReplayTouched = function (e) {
        this.touchSign.removeEventListener(egret.TouchEvent.TOUCH_END, this.onReplayTouched, this);
        this.touchSign.touchEnabled = false;
        this.touchSign.alpha = 0;
        for (var i = 0; i < 4; i++) {
            if (i != 3)
                egret.Tween.get(this.enemies[i]).to({ "alpha": 0 }, 500);
            else
                egret.Tween.get(this.enemies[i]).to({ "alpha": 0 }, 500).call(this.setUpGame, this);
        }
    };

    MainGame.prototype.onDismissMainInstruction = function (e) {
        this.mainInstruction.removeEventListener(egret.TouchEvent.TOUCH_END, this.onDismissMainInstruction, this);
        egret.Tween.get(this.mainInstruction).to({ "alpha": 0, "y": this.centerPoint.y }, 300).call(this.prepareGame, this);
    };

    /**
    * 重置敌人
    * Rest enemies
    */
    MainGame.prototype.setupEnemies = function () {
        for (var i = 0; i < 4; i++) {
            var enemy = this.enemies[i];
            enemy.texture = this.sheet.getTexture("enemy");
            enemy.rotation = i * 90;
            var p = this.getEnenmyResetPosition(i);
            enemy.x = p.x;
            enemy.y = p.y;
        }
    };

    /**
    * 取得敌人位置的初始值
    * Get the original location of the enemy
    * @param {number} order    敌人的顺序 (order of the enemy)
    * @returns {Point}
    */
    MainGame.prototype.getEnenmyResetPosition = function (order) {
        var p = new Point(0, 0);
        var enemySize = 50;

        switch (order) {
            case 0:
                p.x = this.centerPoint.x;
                p.y = this.boardY + enemySize;
                break;
            case 1:
                p.x = this.stageW - enemySize;
                p.y = this.centerPoint.y;
                break;
            case 2:
                p.x = this.centerPoint.x;
                p.y = this.boardY + this.stageW - enemySize;
                break;
            case 3:
                p.x = enemySize;
                p.y = this.centerPoint.y;
                break;
        }

        return p;
    };

    /**
    * 初始化区域顶点
    * Initialize area points
    */
    MainGame.prototype.initPoints = function () {
        this.points = [];
        var pointTL = new Point(0, this.boardY);
        var pointTR = new Point(this.stageW, this.boardY);
        var pointBR = new Point(this.stageW, this.boardY + this.stageW);
        var pointBL = new Point(0, this.boardY + this.stageW);
        var pointCollection;
        pointCollection = [];
        pointCollection.push(this.centerPoint);
        pointCollection.push(pointTL);
        pointCollection.push(pointTR);
        this.points.push(pointCollection);
        pointCollection = [];
        pointCollection.push(this.centerPoint);
        pointCollection.push(pointTR);
        pointCollection.push(pointBR);
        this.points.push(pointCollection);
        pointCollection = [];
        pointCollection.push(this.centerPoint);
        pointCollection.push(pointBL);
        pointCollection.push(pointBR);
        this.points.push(pointCollection);
        pointCollection = [];
        pointCollection.push(this.centerPoint);
        pointCollection.push(pointTL);
        pointCollection.push(pointBL);
        this.points.push(pointCollection);
    };

    /**
    * 检查测试点是否在三角区域内
    * Check to see if the test point is in the triangle area
    * @param {Point} A
    * @param {Point} B
    * @param {Point} C
    * @param {Point} P 测试点 (Test point)
    * @returns {boolean}   是否在三角区域内 (Is the point in the triangle area?)
    */
    MainGame.prototype.isInsideTriangle = function (A, B, C, P) {
        var planeAB = (A.x - P.x) * (B.y - P.y) - (B.x - P.x) * (A.y - P.y);
        var planeBC = (B.x - P.x) * (C.y - P.y) - (C.x - P.x) * (B.y - P.y);
        var planeCA = (C.x - P.x) * (A.y - P.y) - (A.x - P.x) * (C.y - P.y);
        return ((this.sign(planeAB) == this.sign(planeBC)) && (this.sign(planeBC) == this.sign(planeCA)));
    };
    return MainGame;
})(egret.DisplayObjectContainer);

/**
* Class Point
*/
var Point = (function () {
    function Point(xValue, yValue) {
        this.x = xValue;
        this.y = yValue;
    }
    return Point;
})();
