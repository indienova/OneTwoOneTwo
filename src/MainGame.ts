/**
 * Created by motionwalk on 14-8-2.
 */
class MainGame extends egret.DisplayObjectContainer {

    private stageW:number;
    private stageH:number;

    public constructor(w:number, h:number) {
        super();
        console.log('Main Game');
        this.stageW = w;
        this.stageH = h;
    }

    public test():void {
        console.log(this.stageW, this.stageH);
    }
}