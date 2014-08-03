/**
 * Created by motionwalk on 14-8-2.
 */
class MainGame extends egret.DisplayObjectContainer {

    private stageW:number;
    private stageH:number;
    private size:number;
    private boardY:number;

    private player:egret.Bitmap;
    private demoBlock:egret.Bitmap;
    private instruction:egret.Bitmap;
    private touchAreas:Array<egret.Bitmap>;
    private points:Array<any>;

    private sheet:egret.SpriteSheet = RES.getRes("gameSheet");

    private readyToEngage:boolean = false;
    private isInTutorial:boolean = true;

    // 时钟动画相关
    // Timer animation related
    private timer:egret.Timer;
    private timeGraph:egret.Shape;
    private drawScale:number = 50;
    private drawScaleStep:number;

    // 游戏用数据
    // Variables for use in the game
    private rotateSteps:number = 1;

    // 三角形检测使用函数
    // For triangle test
    private sign:Function = function(n:number) {
        return Math.abs(n)/n;
    };

    public constructor(w:number, h:number) {
        super();
        // 设置尺寸
        // Set up sizes
        this.stageW = this.size = w;
        this.stageH = h;
        this.boardY = (this.stageH - this.stageW) / 2;

        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    /**
     * 初始化
     * Initialize
     */
    private onAddToStage():void {
        // 设置触摸层
        // Set up touch areas
        this.touchAreas = [ ];
        for (var i=0; i<4; i++) {
            var touchArea:egret.Bitmap = new egret.Bitmap();
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
        var shp:egret.Shape = new egret.Shape();
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

        // 设置玩家
        // Set up player
        this.player = new egret.Bitmap();
        this.player.texture = this.sheet.getTexture("player");
        this.player.anchorX = this.player.anchorY = 0.5;
        this.player.x = this.stageW / 2;
        this.player.y = this.boardY + this.stageW / 2;
        this.addChild(this.player);

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

        egret.Tween.get(this.demoBlock).to({"alpha" : 1, "y" : this.boardY + 50}, 500);

        // 计算绘制需要的步长
        // Calculate draw step
        this.drawScaleStep = Math.ceil((this.stageW - this.drawScale) / 100);

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

        for (var j=0; j<4; j++) {
            egret.Tween.get(this.touchAreas[j]).wait(j*200).to({"alpha" : 1}, 300).to({"alpha" : 0}, 200);
        }

        egret.Tween.get(this.instruction)
            .to({"alpha" : 1}, 800).wait(600)
            .to({"alpha" : 0}, 1000).call(this.startGame, this);
    }

    /**
     * 开始游戏
     * Start the game
     */
    private startGame():void {
        this.timer.start();
        this.readyToEngage = true;
    }

    /**
     * 触摸响应
     * Response to touch event
     * @param {egret.TouchEvent} e
     */
    private onAreaTouched(e:egret.TouchEvent):void {
        if (!this.readyToEngage)
            return;

        var direction:number = -1;
        var touchPoint:Point = new Point(e.stageX, e.stageY);
        for (var i=0; i<4; i++) {
            var points = this.points[i];
            if (this.isInsideTriangle(points[0], points[1], points[2], touchPoint)) {
                direction = i;  // 0 - up, 1 - right, 2 - down, 3 - left
                break;
            }
        }

        if (direction != -1) {
            egret.Tween.get(this.touchAreas[direction]).to({"alpha" : 1}, 200).to({"alpha" : 0}, 100);
            this.player.rotation = direction * 90;
        }
    }

    /**
     * 时钟触发事件
     * Timer update event
     */
    private timerFunc():void {
        this.drawScale += this.drawScaleStep;
        this.timeGraph.graphics.clear();
        this.timeGraph.graphics.lineStyle(2, 0x00AA00);
        this.timeGraph.graphics.drawRect(-this.drawScale, -this.drawScale, this.drawScale*2, this.drawScale*2);

        if (this.drawScale*2 >= this.stageW) {
            this.timeGraph.graphics.clear();
            this.timer.stop();
            this.drawScale = 50;
            this.readyToEngage = false;
            this.rotatePlayer();
        }
    }

    /**
     * 玩家运动
     * Player make a move
     */
    private rotatePlayer():void {
        this.rotateSteps = (this.rotateSteps == 2) ? 1 : 2;
        var rotation = this.player.rotation + this.rotateSteps * 90;
        egret.Tween.get(this.player).to({"rotation" : rotation}, 250 * this.rotateSteps).call(this.fireTheLaser, this);
    }

    /**
     * 发动攻击
     * Fire the laser
     */
    private fireTheLaser():void {
        this.readyToEngage = true;
        this.timer.start();
    }

    /**
     * 初始化区域顶点
     * Initialize area points
     */
    private initPoints():void {
        this.points = [ ];
        var centerPoint = new Point(this.stageW / 2, this.boardY + this.stageW / 2);
        var pointTL = new Point(0, this.boardY);
        var pointTR = new Point(this.stageW, this.boardY);
        var pointBR = new Point(this.stageW, this.boardY + this.stageW);
        var pointBL = new Point(0, this.boardY + this.stageW);
        var pointCollection;
        pointCollection = [ ];
        pointCollection.push(centerPoint);  pointCollection.push(pointTL);  pointCollection.push(pointTR);
        this.points.push(pointCollection);
        pointCollection = [ ];
        pointCollection.push(centerPoint);  pointCollection.push(pointTR);  pointCollection.push(pointBR);
        this.points.push(pointCollection);
        pointCollection = [ ];
        pointCollection.push(centerPoint);  pointCollection.push(pointBL);  pointCollection.push(pointBR);
        this.points.push(pointCollection);
        pointCollection = [ ];
        pointCollection.push(centerPoint);  pointCollection.push(pointTL);  pointCollection.push(pointBL);
        this.points.push(pointCollection);
    }

    /**
     * 检查测试点是否在三角区域内
     * Check to see if the test point is in the triangle area
     * @param {Point} A
     * @param {Point} B
     * @param {Point} C
     * @param {Point} P 测试点 (Test point)
     * @returns {boolean}   是否在三角区域内 (Is the point in the triangle area?)
     */
    private isInsideTriangle(A:Point, B:Point, C:Point, P:Point):boolean {
        var planeAB:number = (A.x - P.x) * (B.y - P.y) - (B.x - P.x) * (A.y - P.y);
        var planeBC:number = (B.x - P.x) * (C.y - P.y) - (C.x - P.x) * (B.y - P.y);
        var planeCA:number = (C.x - P.x) * (A.y - P.y) - (A.x - P.x) * (C.y - P.y);
        return ((this.sign(planeAB) == this.sign(planeBC)) && (this.sign(planeBC) == this.sign(planeCA)));
    }

}