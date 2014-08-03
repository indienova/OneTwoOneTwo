/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

class GameApp extends egret.DisplayObjectContainer{

    private stageW:number;
    private stageH:number;

    private darkLogo:egret.Bitmap;
    private normalLogo:egret.Bitmap;
    private touchSign:egret.Bitmap;

    private loadingView:LoadingUI;

    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE,this.onAddToStage,this);
    }

    private onAddToStage(event:egret.Event){
        // 设置加载进度界面
        // Setup loading interface
        this.loadingView  = new LoadingUI();
        this.stage.addChild(this.loadingView);
        this.touchEnabled = true;

        // 取得 Stage 尺寸
        // Get Stage sizes
        this.stageW = this.stage.stageWidth;
        this.stageH = this.stage.stageHeight;

        // 初始化 Resource 资源加载库
        // Initialize Resource library
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE,this.onConfigComplete,this);
        RES.loadConfig("resource/resource.json","resource/");
    }

    /**
     * 配置文件加载完成,开始预加载 preload 资源组
     * Configuration loaded, start loading preload resource group
     */
    private onConfigComplete(event:RES.ResourceEvent):void{
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE,this.onConfigComplete,this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE,this.onResourceLoadComplete,this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS,this.onResourceProgress,this);
        RES.loadGroup("preload");
    }

    /**
     * preload 资源组加载完成
     * preload resource group loaded
     */
    private onResourceLoadComplete(event:RES.ResourceEvent):void {
        if(event.groupName=="preload"){
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE,this.onResourceLoadComplete,this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS,this.onResourceProgress,this);
            this.createGameScene();
        }
    }

    /**
     * preload 资源组加载进度
     * preload resource group loading progress
     */
    private onResourceProgress(event:RES.ResourceEvent):void {
        if(event.groupName=="preload"){
            this.loadingView.setProgress(event.itemsLoaded,event.itemsTotal);
        }
    }

    /**
     * 创建游戏场景
     * Create game scene
     */
    private createGameScene():void{
        var sheet:egret.SpriteSheet = RES.getRes("gameSheet");

        // 添加 Logo 的两个不同状态（暗底和正常的）
        // Add two status files of logo (dark & normal)
        this.darkLogo = new egret.Bitmap();
        this.darkLogo.texture = sheet.getTexture("logoDark");
        this.darkLogo.alpha = 0;
        this.centerObject(this.darkLogo);
        this.addChild(this.darkLogo);

        this.normalLogo = new egret.Bitmap();
        this.normalLogo.texture = sheet.getTexture("logoNormal");
        this.normalLogo.alpha = 0;
        this.centerObject(this.normalLogo);
        this.addChild(this.normalLogo);

        this.touchSign = new egret.Bitmap();
        this.touchSign.texture = sheet.getTexture("touchStart");
        this.touchSign.alpha = 0;
        this.centerObject(this.touchSign);
        this.touchSign.y = this.stageH - 150;
        this.addChild(this.touchSign);

        egret.Tween.get(this.darkLogo).to({"alpha":1}, 1200).wait(200).call(this.showLogo, this);
    }

    /**
     * 显示 logo
     * Show logo
     */
    private showLogo():void {
        egret.Tween.get(this.normalLogo).to({"alpha":1}, 1200).wait(200);
        egret.Tween.get(this.touchSign).to({"alpha":1}, 1500).call(this.waitingForTouch, this);
    }

    /**
     * 触摸事件处理
     * Handle touch event
     */
    private waitingForTouch():void {
        egret.Tween.removeAllTweens();
        this.removeChild(this.darkLogo);
        this.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onScreenTouched, this);
    }

    private onScreenTouched(e:egret.TouchEvent):void {
        this.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onScreenTouched, this);

        var mainGame:MainGame = new MainGame(this.stageW, this.stageH);
        this.addChild(mainGame);
        mainGame.test();
    }

    private centerObject(obj:egret.DisplayObject):void {
        obj.anchorX = obj.anchorY = 0.5;
        obj.x = this.stageW / 2;
        obj.y = this.stageH / 2;
    }

    /**
     * 根据 name 关键字创建一个 Bitmap 对象。name 属性请参考 resources/resource.json 配置文件的内容
     * Create a Bitmap object according to the keyword 'name'.
     * The name property is defined in configuration file: resources/resource.json
     */
    private createBitmapByName(name:string):egret.Bitmap {
        var result:egret.Bitmap = new egret.Bitmap();
        var texture:egret.Texture = RES.getRes(name);
        result.texture = texture;
        return result;
    }
}


