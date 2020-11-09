// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html
var Bird = require('Bird');
var PipeManager = require('PipeManager')
var Scroller = require('Scroller')
cc.Class({
    extends: cc.Component,

    properties: {
        maskLayer: {
            type: cc.Node,
            default: null
        },
        readyMenu:{
            type: cc.Node,
            default: null
        },
        bird:Bird,
        pipeManager:PipeManager,
        //的金牌的分数
        goldScore:3,
        //得银牌的分数
        silverScore:1,
        //分数线式节点
        scoreLabel:cc.Label,
        //地面节点
        ground:{
            default:null,
            type:cc.Node
        },
        //背景节点
        background:{
            default:null,
            type:cc.Node
        },
        gameOverMenu:{
            default:null,
            type:cc.Node
        },
        //得分声音
        scoreAudio:{
            default:null,
            url:cc.AudioClip
        },

        //按钮点击、节点浮现的声音
        swooshingAudio:{
            default:null,
            url:cc.AudioClip
        }
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},
    onLoad(){
        this.score = 0;
        this.scoreLabel.string = this.score;
        this._revealScene();
        this._enableInput(true);
        this.bird.init(this);
    },

    start () {

    },
    _revealScene(){
        this.maskLayer.active = true;
        this.maskLayer.color = cc.Color.BLACK;
        this.maskLayer.runAction(cc.fadeOut(0.3));
    },

    // update (dt) {},
    _enableInput: function(enable){
        if(enable){
            cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN,this.onKeyDown,this);
            this.node.on(cc.Node.EventType.TOUCH_START,this.onTouch,this);
        }else{
            cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN,this.onKeyDown,this);
            this.node.off(cc.Node.EventType.TOUCH_START,this.onTouch,this);
        }
    },
    _hideReadyMenu(){
        this.readyMenu.runAction(
            cc.sequence(
                cc.fadeOut(0.5),
                cc.callFunc(()=>{
                    this.readyMenu.active = false;
                },this)
            )
        );
    },
    //定义键盘事件 处理函数，鼠标点击事件函数
    onKeyDown(){
        // this._hideReadyMenu();
        this._startFGameOrJumpBird();
    },
    onTouch(){
        // this._hideReadyMenu();
        this._startFGameOrJumpBird(); 
        return true;
    },


    //开始或者飞行
    _startFGameOrJumpBird(){
        //如果是准备状态则运行开始游戏，否则继续飞行
        if(this.bird.state === Bird.State.Ready){
            this._gameStart();
        }else{
            //继续飞行
            this.bird.rise();
        }
    },
    //游戏开始
    _gameStart(){
        //隐藏menu
        this._hideReadyMenu();
        //开始飞行
        this.bird.startFly();
        this.pipeManager.startSpawn();
    },
    gameOver(){
        this.pipeManager.reset();
        this._enableInput(false);

        this.ground.getComponent(Scroller).stopScroll(); //地板停止滚动
        this.background.getComponent(Scroller).stopScroll();//背景停止滚动
        this.blinkOnce();//闪烁一次
        this.showGameOverMenu();//显示有些结束菜单
    },
    //屏幕闪烁一下
    blinkOnce() {
        this.maskLayer.color = cc.Color.WHITE;
        this.maskLayer.runAction(
            cc.sequence(
                cc.fadeTo(0.1, 200),
                cc.fadeOut(0.1)
            )
        );
    },
    //隐藏分数
    showGameOverMenu() {

        this.scoreLabel.node.runAction(
            cc.sequence(
                cc.fadeOut(0.3),
                cc.callFunc(()=>{
                    this.scoreLabel.node.active = false;
                },this)
            )
        );
        //获取游戏结束界面的各个节点
        let gameOverNode = this.gameOverMenu.getChildByName("gameOverLabel");
        let resultBoardNode = this.gameOverMenu.getChildByName("resultBoard");
        let startButtonNode = resultBoardNode.getChildByName("startButton");
        let medalNode = resultBoardNode.getChildByName("medal");
        let currentScoreNode = resultBoardNode.getChildByName("currentScore");
        let bestScoreNode = resultBoardNode.getChildByName("bestScore");

        //保存最高分到本地
        const KEY_BEST_SCORE = "bestScore";
        let bestScore = cc.sys.localStorage.getItem(KEY_BEST_SCORE);
        if(bestScore === "null" || this.score>bestScore){
            bestScore = this.score;
        }
        cc.sys.localStorage.setItem(KEY_BEST_SCORE,bestScore);

        //显示当前分数、做高分
        currentScoreNode.getComponent(cc.Label).string = this.score;
        bestScoreNode.getComponent(cc.Label).string = bestScore;

        //决定是否显示奖牌

        // let showMedal = (err, spriteFrame) =>{
        //     medalNode.getComponent(cc.Sprite).spriteFrame = spriteFrame;
        // };
        // if(this.score >= this.goldScore){
        //     //显示金牌
        //     console.log("显示金牌")
        //     cc.loader.loadRes("texture/medal_gold",cc.SpriteFrame,showMedal);
        // }else if(this.score >= this.silverScore){
        //     //显示银牌
        //     console.log("显示银牌"+this.silverScore)
        //     cc.loader.loadRes("texture/medal_silver",cc.SpriteFrame, showMedal);
        // }else{
        //     showMedal();
        // }

        let showMedal = (err, spriteFrame) => {
            medalNode.getComponent(cc.Sprite).spriteFrame = spriteFrame;
            console.log("显示奖牌的方法调用")
        };
        console.log(this.score+"++++"+this.goldScore+"++++"+this.silverScore)
            if (this.score >= this.goldScore) { // 显示金牌
                console.log("金牌。。。。。。。。。")
                cc.loader.loadRes("texture/medal_gold",cc.SpriteFrame, showMedal);
            } else if (this.score >= this.silverScore) { // 显示银牌
                console.log("银牌。。。。。。。。。")
                cc.loader.loadRes("texture/medal_silver", cc.SpriteFrame,showMedal);
            } 
            else { // 不显示奖牌
                showMedal();
            }

        //依次显示各个节点
        var showNode = (node, action, callback) =>{
            startButtonNode.active =true;
            cc.audioEngine.playEffect(this.swooshingAudio)
            node.runAction(cc.sequence(
                action,
                cc.callFunc(()=>{
                    if(callback){
                        callback();
                    }
                },this)
            ));
        };
        this.gameOverMenu.active = true;
        let showNodeFunc = () => showNode(
            gameOverNode,
            cc.spawn(
                cc.fadeIn(0.2),
                cc.sequence(
                    cc.moveBy(0.2, cc.p(0, 10)),
                    cc.moveBy(0.5, cc.p(0, -10)),
                )
            ),
            ()=>showNode(
                resultBoardNode,
                cc.moveTo(0.5, cc.p(resultBoardNode.x, -250)).easing(cc.easeCubicActionOut()),
                ()=>showNode(
                    startButtonNode,
                    cc.fadeIn(0.5)
                )
            )
        );
        this.scheduleOnce(showNodeFunc, 0.55);
      
    },
    gainScore(){
        this.score++;
        this.scoreLabel.string = this.score;
        cc.audioEngine.playEffect(this.scoreAudio)
    },
    restart(){
        this.maskLayer.color = cc.Color.BLACK;
        this.maskLayer.runAction(
            cc.sequence(
                cc.fadeIn(0.3),
                cc.callFunc(()=>{
                    //重新加载场景
                    cc.director.loadScene('game');
                },this)
            )
        );
        cc.audioEngine.playEffect(this.swooshingAudio);
    },
});
