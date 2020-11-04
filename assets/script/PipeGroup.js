

cc.Class({
    extends: cc.Component,

    properties: {
        //上方管子最小高度
       topPipeMinHeight:100,
       //下方管子最小高度
       bottomPipeMinHeight:100,
       //上下管子垂直间最小值
       sapcingMinValue:250,
       //上下管子垂直间最大值
       spacingMaxValue:300,
       topPipe:cc.Node,
       bottomPipe:cc.Node

    },

    init(pipeManager){
        this.pipeManager = pipeManager;
        this.initPositionX();
        this.initPositionY();

    },
    initPositionX(){
        let visibleSize = cc.director.getVisibleSize();
        let sceneLeft = -visibleSize.width /2;
        let sceneRight = visibleSize.width / 2;
        this.node.x = sceneRight+300;
        this.recycleX = sceneLeft - Math.max(this.topPipe.width,this.bottomPipe.width);
    },
    initPositionY(){
        let visivleSize = cc.director.getVisibleSize();
        let topPipeMaxY = visivleSize.height / 2 - this.topPipeMinHeight;
        let bottomPipeMiny = cc.find("Canvas/ground").y +this.bottomPipeMinHeight;
        let spacing = this.sapcingMinValue+Math.random()* (this.spacingMaxValue - this.sapcingMinValue);
        this.topPipe.y = topPipeMaxY - Math.random()*(topPipeMaxY - bottomPipeMiny - spacing);
        this.bottomPipe.y = this.topPipe.y - spacing - 100;
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

     update (dt) {
         if(!this.pipeManager.isRunning){
             return;
         }
         this.node.x += this.pipeManager.pipeMoveSpeed * dt;
         if(this.node.x <this.recycleX){
             this.pipeManager.recyclePipe(this)
         }
     },
});
