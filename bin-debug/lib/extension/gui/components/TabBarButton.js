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
var egret;
(function (egret) {
    /**
    * @class egret.TabBarButton
    * @classdesc
    * 选项卡组件的按钮条目
    * @extends egret.ToggleButtonBase
    * @implements egret.IItemRenderer
    */
    var TabBarButton = (function (_super) {
        __extends(TabBarButton, _super);
        /**
        * @method egret.TabBarButton#constructor
        */
        function TabBarButton() {
            _super.call(this);
            this._allowDeselection = true;
            this.hostComponentKey = "egret.TabBarButton";
        }
        Object.defineProperty(TabBarButton.prototype, "allowDeselection", {
            /**
            * 如果为 true，用户单击当前选定的按钮时即会将其取消选择。
            * 如果为 false，用户必须选择不同的按钮才可取消选择当前选定的按钮。
            * @member egret.TabBarButton#allowDeselection
            */
            get: function () {
                return this._allowDeselection;
            },
            set: function (value) {
                this._allowDeselection = value;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(TabBarButton.prototype, "data", {
            /**
            * @member egret.TabBarButton#data
            */
            get: function () {
                return this._data;
            },
            set: function (value) {
                this._data = value;
                this.dispatchEventWith("dataChange");
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(TabBarButton.prototype, "itemIndex", {
            /**
            * @member egret.TabBarButton#itemIndex
            */
            get: function () {
                return this._itemIndex;
            },
            set: function (value) {
                this._itemIndex = value;
            },
            enumerable: true,
            configurable: true
        });


        /**
        * @inheritDoc
        */
        TabBarButton.prototype._setLabel = function (value) {
            if (value != this._getLabel()) {
                _super.prototype._setLabel.call(this, value);

                if (this.labelDisplay)
                    this.labelDisplay.text = this._getLabel();
            }
        };

        /**
        * @method egret.TabBarButton#buttonReleased
        */
        TabBarButton.prototype.buttonReleased = function () {
            if (this.selected && !this.allowDeselection)
                return;

            _super.prototype.buttonReleased.call(this);
        };
        return TabBarButton;
    })(egret.ToggleButtonBase);
    egret.TabBarButton = TabBarButton;
})(egret || (egret = {}));
