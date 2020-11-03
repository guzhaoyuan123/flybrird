const State = cc.Enum({
    /** 游戏开始前的准备状态 */
    Ready: -1,
    /** 小鸟上升中 */
    Rise: -1,
    /** 小鸟自由落体中 */
    FreeFall: -1,
    /** 小鸟碰撞到管道坠落中 */
    Drop: -1,
    /** 小鸟已坠落到地面静止 */
    Dead: -1,
});

cc.Class({
    statics: {
        State: State
    },

    extends: cc.Component,

    properties: {
        /** 上抛初速度，单位：像素/秒 */
        initRiseSpeed: 800,
        /** 重力加速度，单位：像素/秒的平方 */
        gravity: 1000,
        /** 小鸟的状态 */
        state: {
            default: State.Ready,
            type: State,
        },
        /** 地面节点 */
        ground: {
            default: null,
            type: cc.Node
        },
    },

    init(game) {
        this.game = game;
        this.state = State.Ready;
        this.currentSpeed = 0;//初始化当前的速度
        this.anim = this.getComponent(cc.Animation);//获取动画组件
    },
    update(dt) {
        if (this.state === State.Ready || this.state === State.Dead) {//如果是住呢比或者死亡状态则停止计算
            return;
        }
        this._updatePosition(dt);
        this._updateState(dt);
    },
    _updatePosition(dt) {
        var flying = this.state === State.Rise
            || this.state === State.FreeFall
            || this.state === State.Drop;//判断小鸟是否处于飞行状态
        if (flying) {//如果处于飞行状态
            var h = cc.director.getVisibleSize().height / 2;
            if (this.node.y >= h) {//当小鸟的高度超过上边的时候，让小鸟的位置和速度降下来
                this.node.y = h - 1;
                this.currentSpeed = -1;
            } else {
                this.currentSpeed -= dt * this.gravity;//根据预先设置好的重力计算当前的速度
                this.node.y += dt * this.currentSpeed;//根据计算出来的y轴速度，计算出当前小鸟的位置
            }
        }
    },

    _updateState(dt) {
        switch (this.state) {
            case State.Rise://当当前状态是飞起的时候，如果速度小于零了，则转换为自由下落状态
                if (this.currentSpeed < 0) {
                    this.state = State.FreeFall;
                    this._runFallAction();
                }
                break;
        }
    },
    //起飞函数
    rise() {
        this.state = State.Rise;
        this.currentSpeed = this.initRiseSpeed;
        this._runRiseAction();
    },
    //开始起飞
    startFly() {
        this.anim.stop("birdFlapping");
        this.rise();
    },
    //向上飞的角度偏移
    _runRiseAction() {
        this.node.stopAllActions();
        let jumpAction = cc.rotateTo(0.3, -30).easing(cc.easeCubicActionOut());
        this.node.runAction(jumpAction);
    },

    //下落的角度偏移
    _runFallAction(duration = 0.6) {
        this.node.stopAllActions();
        let dropAction = cc.rotateTo(duration, 90).easing(cc.easeCubicActionIn());
        this.node.runAction(dropAction);
    },

    //当小鸟碰撞到管道的时候坠落的角度偏移
    _runDropAction() {
        if (this.currentSpeed > 0) {
            this.currentSpeed = 0;
        }
        this._runFallAction(0.4);
    }
});
