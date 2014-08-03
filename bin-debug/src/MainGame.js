var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/**
* Created by motionwalk on 14-8-2.
*/
var MainGame = (function (_super) {
    __extends(MainGame, _super);
    function MainGame(w, h) {
        _super.call(this);
        console.log('Main Game');
        this.stageW = w;
        this.stageH = h;
    }
    MainGame.prototype.test = function () {
        console.log(this.stageW, this.stageH);
    };
    return MainGame;
})(egret.DisplayObjectContainer);
