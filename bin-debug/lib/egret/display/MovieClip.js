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
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../context/MainContext.ts"/>
/// <reference path="../context/Ticker.ts"/>
/// <reference path="Bitmap.ts"/>
/// <reference path="DisplayObjectContainer.ts"/>
/// <reference path="SpriteSheet.ts"/>
/// <reference path="Texture.ts"/>
/// <reference path="../utils/Logger.ts"/>
var egret;
(function (egret) {
    var MovieClip = (function (_super) {
        __extends(MovieClip, _super);
        function MovieClip(data, texture) {
            _super.call(this);
            this.frameRate = 60;
            if (texture != null && texture instanceof egret.Texture) {
                egret.Logger.warning("MovieClip#constructor接口参数已经变更，请尽快调整用法为 new MovieClip(new DefaultMovieClipDelegate(data,texture))");
                this.delegate = new DefaultMovieClipDelegate(data, texture);
            } else {
                this.delegate = data;
            }
            this.delegate.setMovieClip(this);
        }
        /**
        * 播放指定动画
        * @param frameName
        */
        MovieClip.prototype.gotoAndPlay = function (frameName) {
            this.delegate.gotoAndPlay(frameName);
        };

        /**
        * 播放并暂停指定动画
        * @param frameName
        */
        MovieClip.prototype.gotoAndStop = function (frameName) {
            this.delegate.gotoAndStop(frameName);
        };

        /**
        * 暂停动画
        */
        MovieClip.prototype.stop = function () {
            this.delegate.stop();
        };

        MovieClip.prototype.dispose = function () {
            this.delegate.dispose();
        };

        /**
        * 方法名改为 dispose
        * @deprecated
        */
        MovieClip.prototype.release = function () {
            egret.Logger.warning("MovieClip#release方法即将废弃");
            this.dispose();
        };

        /**
        * @deprecated
        */
        MovieClip.prototype.getCurrentFrameIndex = function () {
            egret.Logger.warning("MovieClip#getCurrentFrameIndex方法即将废弃");
            return this.delegate["_currentFrameIndex"];
        };

        /**
        * @deprecated
        */
        MovieClip.prototype.getTotalFrame = function () {
            egret.Logger.warning("MovieClip#getTotalFrame方法即将废弃");
            return this.delegate["_totalFrame"];
        };

        /**
        * @deprecated
        */
        MovieClip.prototype.setInterval = function (value) {
            egret.Logger.warning("MovieClip#setInterval方法即将废弃,请使用MovieClip#frameRate代替");
            this.frameRate = 60 / value;
        };

        /**
        * @deprecated
        */
        MovieClip.prototype.getIsPlaying = function () {
            egret.Logger.warning("MovieClip#getIsPlaying方法即将废弃");
            return this.delegate["isPlaying"];
        };
        return MovieClip;
    })(egret.DisplayObjectContainer);
    egret.MovieClip = MovieClip;

    var DefaultMovieClipDelegate = (function () {
        function DefaultMovieClipDelegate(data, texture) {
            this.data = data;
            this._totalFrame = 0;
            this._passTime = 0;
            this._currentFrameIndex = 0;
            this._isPlaying = false;
            this._frameData = data;
            this._spriteSheet = new egret.SpriteSheet(texture);
        }
        DefaultMovieClipDelegate.prototype.setMovieClip = function (movieClip) {
            this.movieClip = movieClip;
            this.bitmap = new egret.Bitmap();
            this.movieClip.addChild(this.bitmap);
        };

        DefaultMovieClipDelegate.prototype.gotoAndPlay = function (frameName) {
            this.checkHasFrame(frameName);
            this._isPlaying = true;
            this._currentFrameIndex = 0;
            this._currentFrameName = frameName;

            this.playNextFrame();
            this._passTime = 0;
            egret.Ticker.getInstance().register(this.update, this);
            this._totalFrame = this._frameData.frames[frameName].totalFrame;
        };

        DefaultMovieClipDelegate.prototype.gotoAndStop = function (frameName) {
            this.checkHasFrame(frameName);
            this.stop();
            this._passTime = 0;
            this._currentFrameIndex = 0;
            this._currentFrameName = frameName;
            this._totalFrame = this._frameData.frames[frameName].totalFrame;
            this.playNextFrame();
        };

        DefaultMovieClipDelegate.prototype.stop = function () {
            this._isPlaying = false;
            egret.Ticker.getInstance().unregister(this.update, this);
        };

        DefaultMovieClipDelegate.prototype.dispose = function () {
        };

        DefaultMovieClipDelegate.prototype.checkHasFrame = function (name) {
            if (this._frameData.frames[name] == undefined) {
                egret.Logger.fatal("MovieClip没有对应的frame：", name);
            }
        };

        DefaultMovieClipDelegate.prototype.update = function (advancedTime) {
            var oneFrameTime = 1000 / this.movieClip.frameRate;
            var last = this._passTime % oneFrameTime;
            var num = Math.floor((last + advancedTime) / oneFrameTime);
            while (num >= 1) {
                if (num == 1) {
                    this.playNextFrame();
                } else {
                    this.playNextFrame(false);
                }
                num--;
            }
            this._passTime += advancedTime;
        };

        DefaultMovieClipDelegate.prototype.playNextFrame = function (needShow) {
            if (typeof needShow === "undefined") { needShow = true; }
            var frameData = this._frameData.frames[this._currentFrameName].childrenFrame[this._currentFrameIndex];
            if (needShow) {
                var texture = this.getTexture(frameData.res);
                var bitmap = this.bitmap;
                bitmap.x = frameData.x;
                bitmap.y = frameData.y;
                bitmap.texture = texture;
            }

            if (frameData.action != null) {
                this.movieClip.dispatchEventWith(frameData.action);
            }

            this._currentFrameIndex++;
            if (this._currentFrameIndex == this._totalFrame) {
                this._currentFrameIndex = 0;
            }
        };

        DefaultMovieClipDelegate.prototype.getTexture = function (name) {
            var resData = this._frameData.res[name];
            var texture = this._spriteSheet.getTexture(name);
            if (!texture) {
                texture = this._spriteSheet.createTexture(name, resData.x, resData.y, resData.w, resData.h);
            }
            return texture;
        };
        return DefaultMovieClipDelegate;
    })();
    egret.DefaultMovieClipDelegate = DefaultMovieClipDelegate;
})(egret || (egret = {}));
