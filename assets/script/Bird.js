const State =cc.Enum({
    //游戏开始前的准备
    Ready:-1,
    //小鸟上升中
    Rise:-1,
    //小鸟自由落体
    FreeFall:-1,
    //碰撞管道掉落
    Drop:-1,
    //坠落地面静止
    Dead:-1,
})

cc.Class({
    extends: cc.Component,
    statics:{
        State:State
    },
    
    properties: {
        initRiseSpeed:800,
        gravity:1000,
        ground:{
            default:null,
            type:cc.Node
        },
        state:{
            default:State.Ready,
            type:State
        },

        //小鸟向上飞的声音
        riseAudio:{
            default:null,
            url:cc.AudioClip
        },
        //小鸟碰撞到水管后开始坠落的声音
        dropAudio:{
            default:null,
            url:cc.AudioClip
        },
        //小鸟发生碰撞的声音
        hitAudio:{
            default:null,
            url:cc.AudioClip
        },
      
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },
    init(game){
        this.game = game;
        this.state = State.Ready;
        this.currentSpeed = 0;  //初始化当前的速度
        this.anim = this.getComponent(cc.Animation);  //获取动画组件
    },
    update (dt) {
        //如果是住呢比或者死亡状态则停止计算
        if(this.state === State.Ready || this.state === State.Dead){
            return;
        }
        this._updatePosition(dt);
        this._updateState(dt);
        this.detectCollision();
        this.fixBirdFinalPosition();
    },
    

    //在获得状态的时候，我们要定义计算位置的函数，并保持更新。
    _updatePosition(dt){
        var flying = this.state === State.Rise
         || this.state === State.FreeFall
         //判断小鸟是否处于飞行状态
         || this.state === State.Drop;
         //如果处于飞行状态
         if(flying){
             var h = cc.director.getVisibleSize().height / 2;
             //当小鸟的高度超过上边的时候，让小鸟的位置个速度降下来
             if(this.node.y >= h){
                 this.node.y = h - 1;
                 this.currentSpeed = -1;
             }else{
                 //根据预先设置好的重力计算当前的速度
                 this.currentSpeed -= dt * this.gravity;
                 //根据计算出来的y轴速度，计算当前的小鸟的位置
                 this.node.y += dt * this.currentSpeed;
             }
         }
    },

    //计算状态
    _updateState(dt){
        switch(this.state){
            //当当前的状态是飞起的时候，如果速度小于0的了，则转换为自由下落状态
            case State.Rise:
                if(this.currentSpeed <0){
                    this.state = State.FreeFall;
                    this.runFallAction();
                }
                break;
        }
    },

    //起飞
    rise(){
        //修改当前的状态为Rise
        this.state = State.Rise;

        this.runRiseAction();
        //重置速度
        this.currentSpeed = this.initRiseSpeed;

        cc.audioEngine.playEffect(this.riseAudio);
    },

    //开始起飞,同时停止birdFlapping的动画，有冲突
    startFly(){
        this.getNextPipe();
        this.anim.stop("birdFlapping");
        this.rise();
    },
    //设置鸟的偏移  起飞
    runRiseAction(){
        this.node.stopAllActions();
        let jumpAction = cc.rotateTo(0.3,-30).easing(cc.easeCubicActionOut());
        this.node.runAction(jumpAction);
    },
    //下落的角度偏移  下落
    runFallAction(duration = 0.6){
        this.node.stopAllActions();
        let dropAction = cc.rotateTo(duration,90).easing(cc.easeCubicActionIn());
        this.node.runAction(dropAction);

        
    },
    //当小鸟碰撞到管道的时候坠落的角度偏移
    runDropAction(){
        if(this.currentSpeed>=0){
            this.currentSpeed=0;
        }
        this.runFallAction(0.4);
    },
    getNextPipe(){
        this.nextPipe = this.game.pipeManager.getNext();
    },

    detectCollision(){
        if(!this.nextPipe){
            this.getNextPipe();
            return;
        }
        if(this.state=== State.Ready || this.state === State.Dead || this.state === State.Drop){
            return;
        }

        let collideWithPipe = false;
        //检测小鸟与上方管子的碰撞
        if(this.detectCollisionWithBird(this.nextPipe.topPipe)){
            collideWithPipe = true;
        }
        //检测小鸟与下方管子的碰撞
        if(this.detectCollisionWithBird(this.nextPipe.bottomPipe)){
            collideWithPipe = true;
        }
        //检测小鸟与地面的碰撞
        let collideWithGround = false;
        if(this.detectCollisionWithBird(this.ground)){
            collideWithGround = true;
        }

        //碰撞结果
        if(collideWithPipe || collideWithGround){
            cc.audioEngine.playEffect(this.hitAudio);
            if(collideWithGround){   //与地面碰撞
                this.state = State.Dead;
            }else{    //与水管碰撞
                this.state = State.Drop;
                this.runDropAction();
                this.scheduleOnce(()=>{
                    cc.audioEngine.playEffect(this.dropAudio)
                },0.3);
            }

            this.anim.stop();
            this.game.gameOver();
        }else{
            let birdLeft = this.node.x;
            let pipeRight = this.nextPipe.node.x+this.nextPipe.topPipe.width;
            let crossPipe = birdLeft > pipeRight;
            if(crossPipe){
                this.game.gainScore();
                this.getNextPipe();
            }
        }
    },

    detectCollisionWithBird(otherNode){
        return cc.rectIntersectsRect(this.node.getBoundingBoxToWorld(),otherNode.getBoundingBoxToWorld());
    },
    //修正最后落地位置
    fixBirdFinalPosition(){
        if(this.detectCollisionWithBird(this.ground)){
            this.node.y = this.ground.y + this.node.width / 2 +120 ;
        }
    },
});
