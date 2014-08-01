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

    private textContainer:egret.Sprite;
    /**
     * 创建游戏场景
     * Create game scene
     */
    private createGameScene():void{
        var sheet:egret.SpriteSheet = RES.getRes("gameSheet");

        // 添加 Logo 的两个不同状态（暗底和正常的）
        // Add two status files of logo (dark & normal)
        var darkLogo:egret.Bitmap = new egret.Bitmap();
        darkLogo.texture = sheet.getTexture("logoDark");
        darkLogo.alpha = 0;
        this.centerObject(darkLogo);
        this.addChild(darkLogo);

        var normalLogo:egret.Bitmap = new egret.Bitmap();
        normalLogo.texture = sheet.getTexture("logoNormal");
        normalLogo.alpha = 0;
        this.centerObject(normalLogo);
        this.addChild(normalLogo);

        // Logo 动画（Fade）
        // Logo animation (Fade)
        var twDark = egret.Tween.get(darkLogo);
        twDark.to({"alpha":1}, 1200);
        twDark.wait(200);
        twDark.call(function(){
            var twNormal = egret.Tween.get(normalLogo);
            twNormal.to({"alpha":1}, 1500);
        });
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


