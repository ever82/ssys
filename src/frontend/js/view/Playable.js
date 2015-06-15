$$.View.Playable=$$.View.createSubclass({
    getStateLabelTitle:function(state){
      var labelTitle;
      var showConfig=this._showConfigs[state];
      if(showConfig){
        labelTitle=showConfig[0];
      }
      if(!labelTitle){
        var stageState=this.getStageState(state);
        var labelTitle=this.getLabelTitleByStageState(stageState);
        if(labelTitle){
          var state1=stageState[1];
          //如果state1不包含/号,则表示它是终极entry,这时的labeltitle应该缓存
          if(!state1.match(/\//)){
            if(showConfig){
              showConfig[0]=labelTitle;
            }else{
              this._showConfigs[state]=[labelTitle];
            }
          }
        }
      }
      if(typeof labelTitle=="string"){
        labelTitle=[labelTitle,labelTitle];
      }
      //如果找到了labelTitle,就将它存进缓存里,下次就不用再找了
      if(!labelTitle){
        labelTitle=['?',state];
      }
      //console.info(this.fullname,"的节目",state,"的名称主题是",labelTitle,"[$$.View.getStateLabelTitle]");
      return labelTitle;
    },
    getLabelTitleByStageState:function(stageState){
      //console.debug(this.fullname,"开始根据舞台链和最终节目来读取label和title信息","舞台链长度=",stageState[0].length,'最终节目=',stageState[1]);
      var stageChain=stageState[0];
      var stage=stageChain.pop();
      if(stage){
        var state=stageState[1]||stage.defaultState;
        //console.debug(this.fullname,"已经找到最终舞台=",stage.fullname,"和它上面在表演的节目=",state);
        var labelTitle=stage.getRoutedConfig(state,0);
        if(labelTitle){
          //console.debug("已经根据节目配置找到了该舞台",stage.fullname,"上的最终节目=",state,"对应的label和title=",labelTitle);
          return labelTitle;
        }else{
          if(stage.entry!==undefined){
            state=stage.entry+"/"+state;
            stageState[1]=state;
          }
          return this.getLabelTitleByStageState(stageState);
        }
      }
    },
    getStateLabel:function(state){
      state=state||this.state;
      return this.getStateLabelTitle(state)[0];
    },
    getStateTitle:function(state){
      state=state||this.state;
      return this.getStateLabelTitle(state)[1];
    },
    getStateShow:function(state){
      var showConfig=this.getRoutedConfig(state,2);
      if(showConfig){
        var show=showConfig;
        if(typeof show=="function"){
          show=show.call(this,state);
        }
        return show;
      }else{
        return null;
      }
      
    },
    preloadState:function(state){
      //console.debug("in preloadState","state=",state);
      ssys.preloading=true;
      var preload=this.getStatePreload(state);
      if(preload){
        if($.isArray(preload)){
          var _this=this;
          var d=ssys.loopDefer(preload,null,function(path){
            return _this.$$(path);
          });
        }else{
          var d=this.$$(preload);
        }
      }else{
        var d=this.setState(state);
      }
      if(d){
        return d.pipe(function(){
            ssys.preloading=false;
        });
      }else{
         ssys.preloading=false;
      }
    },
    /**
     * 这是给backButton调用的
     */
    onBack:function(e){
      this.showLastState();
    },
    onForward:function(e){
      this.showNextStep();
    },
    onPlay:function(e){
      var _this=this;
      this.beginPlaying=true;
      this.showNextStep().pipe(function(){
          _this.playing=true;
          _this.beginPlaying=false;
          _this.play();
      });
    },
    onStop:function(e){
      this.stop()
    },
    onTurn:function(e){
      this.showNextTurnState();
    },
    onRefresh:function(e){
      this.refresh();
    },
    getStateNextSteps:function(state){
      var stageState=this.getStageState(state);
      var nextSteps=this.getNextStepsByStageState(stageState);
      return nextSteps||[];
    },
    getNextPlayState:function(){
      var nextState=this.getNextState();
      if(!nextState&&nextState!==''){
        nextState=this.getNextTurnState(true);
      }
      return nextState;
    },
    play:function(){
      var interruptConfig=this.getInterruptConfig();
      if(interruptConfig){
        this.preventClick=interruptConfig;
      }
      var seconds=this.getSeconds();
      if(seconds>=0){
        var _this=this;
        var nextStep=this.getNextPlayState();
        if(nextStep||nextStep===''){
          if(this.toPlay){
            ssys.cancel(this.toPlay);
          }
          this.toPlay=ssys.delay(function(){
              _this.setState(nextStep);
          },seconds);
          this.preloadState(nextStep);
        }
      }else if(seconds==-2){
        this.elements.player.onStop();
      }
    },
    getSeconds:function(){
      var step=this.getAtomicStep(this.stepIndex);
      var state=this.getStateFromStep(step);
      return step.seconds||this.getStateSeconds(state);
    },
    getInterruptConfig:function(){
      var step=this.getAtomicStep(this.stepIndex);
      return step.preventClick;
    },
    getStateTips:function(state){
      var tips=this.getRoutedConfig(state,'tips');
      return tips;
    },
    playingTipIndex:-1,
    playTips:function(tips){
      if(!this.domnode.is(":visible")){
        return ;
      }
      var step=this.getAtomicStep(this.stepIndex)||'';
      if(step.options||step.optionRules){
        step=this.getStepFromOptions(step.options,step.optionRules);
      }
      var state=this.getStateFromStep(step);
      var tips=this.playingTips=tips||this.playingTips||step.tips||this.getStateTips(state);
      if(tips){
        this.playingTipIndex++;
        var tip=tips[this.playingTipIndex];
        if(tip){
          var _this=this;
          if(this.playingTipIndex>0){
            var lastTip=tips[this.playingTipIndex-1];
            //如果没有设置延迟播放时间, 就在上一个tip的关闭的时候开始播放
            var delay=(tip.delay||0)+(lastTip.duration||this.defaultDuration);
          }else{
            var delay=tip.delay||0;
          }
          if(this.toShowTip){
            ssys.cancel(this.toShowTip);
          }
          this.toShowTip=ssys.delay(function(){
            _this.showTip(tip);
          },delay);
        }
      }
    },
    getStepFromOptions:function(options,optionRules,state){
      state=state||this.state;
      var step=this.getMatchedConfig(state,options,optionRules);
      /*if($.isArray(step)){
        var step0=step.shift();
        step=[step0,step];
      }*/
      return step;
    },
    showTip:function(tip){
      var view=tip.view;
      var duration=tip.duration||this.defaultDuration;
      if(view){
        if(typeof view=="string"){
          view=this.getElement(view);
        }
        view.playTips(tip.tips);
      }else{
        if(tip.location){
          var dom=this.createSpan("tip"+$.now(),tip.location);
        }else{
          var dom=this.app.layout.createSpan("tip"+$.now(),this.app.layout);
        }
        if(!dom.parent().is(":visible")){
          dom.remove();
          return;
        }
        if(!tip.content){
          tip.content=dom.parent().attr('title');
        }
        dom.attr('title',tip.content);
        if(tip.location){
          var position={
            my: "bottom",
            at: "top",
            of: dom.parent(),
            within: dom.parent(),
            using: function( position, feedback ) {
              $( this ).css( position );
              $( "<div>" )
              .addClass( "arrow" )
              .addClass( feedback.vertical )
              .addClass( feedback.horizontal )
              .appendTo( this );
            }
          };
        }else{
          var position={
            my: "top",
            at: "top+30",
            of: dom.parent(),
            within: dom.parent()
          };
          
        }
        var options={
          position: position,
          open:function(){
            ssys.delay(function(){
                dom.tooltip();
                dom.tooltip('close');
            },duration);
          },
          close:function(){
            dom.remove();
          }
        }
        if(tip.options){
          options=ssys.merge(ssys.clone(tip.options),options);
        }
        dom.tooltip(options);
        if(tip.location){
          dom[0].scrollIntoView(false);
        }
        tip.delay=tip.delay===undefined?0:tip.delay;
        dom.tooltip('open');
      }
      this.playTips();
    },
    stop:function(){
      this.playing=false;
      this.preventClick="accept";
      this.cancelPlaying();
    },
    showLastState:function(){
      this.isLocked=false;
      return this.setState(this.getLastState());
    },
    showNextStep:function(){
      this.isLocked=false;//这时通常是用户直接请求的状态改变,拥有更高优先权
      return this.setState(this.getNextPlayState());
    },
    showNextTurnState:function(){
      return this.setState(this.nextTurnState);
    },
    getPreloadByStageState:function(stageState){
      var stageChain=stageState[0];
      var stage=stageChain.pop();
      if(stage){
        var state=stageState[1]||stage.defaultState;
        //console.debug(this.fullname,"已经找到最终舞台=",stage.fullname,"和它上面在表演的节目=",state);
        var preload=stage.getRoutedConfig(state,'preload');
        if(preload===undefined){
          preload=stage.defaultPreload;
        }
        return preload;
      }
    },
    getStatePreload:function(state){
      var stageState=this.getStageState(state);
      var preload=this.getPreloadByStageState(stageState);
      return preload||this.defaultPreload;
    },
    getSecondsByStageState:function(stageState){
      var stageChain=stageState[0];
      var stage=stageChain.pop();
      if(stage){
        var state=stageState[1]||stage.defaultState;
        //console.debug(this.fullname,"已经找到最终舞台=",stage.fullname,"和它上面在表演的节目=",state);
        var seconds=stage.getRoutedConfig(state,'seconds');
        if(seconds===undefined){
          seconds=stage.defaultSeconds;
        }
        return seconds;
      }
    },
    getStateSeconds:function(state){
      var stageState=this.getStageState(state);
      var seconds=this.getSecondsByStageState(stageState);
      return seconds||this.defaultSeconds;
    },
    getNextStepsByStageState:function(stageState){
      var stageChain=stageState[0];
      var baseState=this.getStateOfStageChain(stageChain);
      //console.debug("getNextStepsByStageState","baseState=",baseState,'stageChain=',stageChain);
      var stage=stageChain.pop();
      if(stage){
        var state=stageState[1]||stage.defaultState;
        //console.debug(this.fullname,"问舞台stage=",stage.fullname,"它在状态",state,"之后的nextSteps");
        var nextSteps=stage.getRoutedConfig(state,'nextSteps');
        //console.debug("in getNextStepsByStageState","nextSteps=",nextSteps);
        if(nextSteps){
          if(baseState){
            nextSteps=ssys.traverse(nextSteps,function(state){
                if(state.match(/^#/)){
                  return state.substr(1);
                }else{
                  return baseState+"/"+state;
                }
            });
          }
          return nextSteps;
        }else{
          if(stage.entry!==undefined){
            state=stage.entry+"/"+state;
            stageState[1]=state;
          }
          return this.getNextStepsByStageState(stageState);
        }
      }
    },
    getLabel:function(value){
      var label=this.labelConfigs[value];
      if(!label){
        var parent=this.parent;
        if(parent){
          label=parent.getLabel(value);
        }else{
          label=value;
        }
      }
      return this.parseConfig(label);
    },
    getIcon:function(value){
      var icon=this.iconConfigs[value];
      if(!icon){
        var parent=this.parent;
        if(parent){
          icon=parent.getIcon(value);
        }else{
          icon=value;
        }
      }
      return this.parseConfig(icon);
    },
    setCurrentStep:function(state){
      //console.debug(this.fullname,"in setCurrentStep","state=",state);
      var log=this.logs[state];
      var currentTime=$.now();
      if(!log){
        this.logs[state]=currentTime;
      }else if(typeof log=="number"){
        this.logs[state]=[log,currentTime];
      }else{
        //console.debug("检查log","log=",log);
        log.push(currentTime);
      }
      var stepLocation=this.getStepLocation(state);
      //console.debug(this.fullname,"in setCurrentStep","stepLocation=",stepLocation);
      if(typeof stepLocation=="number"){
        this.stepIndex=stepLocation;
      }else if($.isArray(stepLocation)){
        var trunkIndex=stepLocation[0];
        var branchIndex=stepLocation[1];
        this._switchStepBranch(trunkIndex,branchIndex);
        this.stepIndex=trunkIndex;
      /*}else if(stepLocation=="pit"){
        this.fillPit();
        this.stepIndex++;*/
      }else{
        if(this.stepIndex===this.steps.length-1){
          this.steps.push(state);
        }else{
          this.insertStep(state);
        }
        this.stepIndex++;
      }
      var nextTurnState=this.getNextTurnState();
      //console.debug("in setCurrentStep","nextTurnState=",nextTurnState);
      this.nextTurnState=nextTurnState;
      if(!log){
        //如果是第一次访问该页,则要给该页加上nextSteps
        this.addNextSteps();
      }
    },
    addNextSteps:function(nextSteps){
      //console.debug(this.fullname,"in addNextSteps","当前状态=",this.state,"nextSteps=",nextSteps,ssys.jsonEncode(this.steps));
      var nextSteps=nextSteps||this.getStateNextSteps(this.state);
      if(nextSteps&&nextSteps.length){
        //console.debug(this.fullname,"in addNextSteps","当前状态=",this.state,"nextSteps=",nextSteps,ssys.jsonEncode(this.steps));
        var trunkIndex=this.stepIndex+1;
        var step=this.steps[trunkIndex];
        if(step===undefined){
          this.steps[trunkIndex]=nextSteps;
          //表示当前位置是在步骤树的末端
          //因此需要将nextSteps中的第一个branch展开
          this.steps=this._unwrapSteps(this.steps);
        }else{
          var state=this.getStateFromStep(step);
          if(!$.isArray(step)){
            var branches=[step];
          }else{
            var branches=step;
          }
          for(var i=0,l=nextSteps.length;i<l;i++){
            var nextStep=nextSteps[i];
            if(state!=this.getStateFromStep(nextStep)){
              branches.push(nextStep);
            }
          }
          this.steps[trunkIndex]=branches;
        }
        //console.debug("addNextSteps","step=",step,"nextSteps=",nextSteps);
        //step=step.concat(nextSteps);
      }
    },
    /**
     * 用该方法将步骤数组从index开始的trunk尾部变成index处的一个branch收起来,
     * 返回的steps跟输入的steps是同一个对象
     */
    _wrapSteps:function(steps,trunkIndex){
      //console.debug("_wrapSteps","steps=",ssys.jsonEncode(steps),"trunkIndex=",trunkIndex);
      steps=steps||this.steps;
      trunkIndex=trunkIndex===undefined?this.stepIndex:trunkIndex;
      if(trunkIndex>steps.length-1){
        console.warn("trunkIndex超过取值范围了","trunkIndex=",trunkIndex);
        return steps;
      }
      var tail=steps.splice(trunkIndex+1,steps.length-trunkIndex-1);
      var branches=steps[trunkIndex];
      if($.isArray(branches)){
        var step=branches[0];
      }else{
        var step=branches;
        steps[trunkIndex]=branches=[];
      }
      //tail.unshift(step);
      var newBranch=[step,tail];
      branches[0]=newBranch;
      return steps;
    },
    /**
     * 用该方法将一个wraped steps做尾部展开, 注意返回的steps跟输入的steps不是同一个对象
     */
    _unwrapSteps:function(steps){
      var branches=steps[steps.length-1];
      var branch=branches[0];
      if($.isArray(branch)){
        var step=branch[0];
        var tail=branch[1];
        branches[0]=step;
        if(tail){
          steps=steps.concat(tail);
        }
      }
      return steps;
    },
    insertStep:function(step,trunkIndex){
      trunkIndex=trunkIndex===undefined?this.stepIndex+1:trunkIndex;
      if(trunkIndex<this.steps.length){
        //console.debug(this.fullname,"开始插入步骤","在位置",trunkIndex,"插入步骤",step);
        var steps=this._wrapSteps(this.steps,trunkIndex);
        var branches=steps[trunkIndex];
        if(!$.isArray(step)){
          var newBranch=[step];
        }else{
          var newBranch=step.slice(0);
        }
        //branches.unshift(newBranch);
        this._insertBranch(branches,newBranch);
      }else{
        var steps=this.steps;
        steps.push(step);
      }
      return this.steps=this._unwrapSteps(steps);
    },
    _insertBranch:function(branches,newBranch){
      var state=this.getStateFromStep(newBranch);
      var combined=false;
      for(var i=0,l=branches.length;i<l;i++){
        var branch=branches[i];
        if(state==this.getStateFromStep(branch)){
          //虽然两者state相同,但是可能label等其它配置不同, 用后者替代前者
          branch[0]=newBranch[0];
          combined=true;
          newBranch=newBranch[1];
          if(newBranch&&newBranch.length){
            var state1=newBranch.shift();
            if(newBranch.length){
              newBranch=[state1,newBranch];
            }else{
              newBranch=[state1];
            }
            if(branch[1]){
              this._insertBranch(branch[1],newBranch);
            }else{
              branch[1]=newBranch;
            }
          }
          break;
        }
      }
      if(combined){
        branches.splice(i,1);
        branches.unshift(branch);
      }else{
        branches.unshift(newBranch);
      }
    },
    _switchStepBranch:function(trunkIndex,branchIndex){
      //console.debug("_switchStepBranch","trunkIndex=",trunkIndex,"branchIndex=",branchIndex);
      var steps=this._wrapSteps(this.steps,trunkIndex);
      var branches=steps[trunkIndex];
      var oldBranch=branches[0];
      var newBranch=branches[branchIndex];
      if(newBranch!=oldBranch){
        branches[0]=newBranch;
        //branches[branchIndex]=oldBranch;
        branches.splice(branchIndex,1);
        branches.push(oldBranch);
        //console.debug("","newBranch=",ssys.jsonEncode(newBranch),"oldBranch=",ssys.jsonEncode(oldBranch));
      }
      return this.steps=this._unwrapSteps(steps);
    },
    /**
     * 寻找state是否在步骤树的主干和主干的主分支上出现过,
     * 返回它的位置
     */
    getStepLocation:function(state){
      var nextStep=this.getAtomicStep(this.stepIndex+1);
      if(nextStep&&(nextStep.options||nextStep.optionRules)){
        this.fillPit();
      }
      var steps=this.steps;
      var jointSteps={};
      for(var i=this.stepIndex,l=steps.length;i<l;i++){
        var step=steps[i];
        if(state==this.getStateFromStep(step)){
          return i;
        }
        if($.isArray(step)){
          jointSteps[i]=step;
        }
      }
      for(var i=0;i<this.stepIndex;i++){
        var step=steps[i];
        if(state==this.getStateFromStep(step)){
          return i;
        }
        if($.isArray(step)){
          jointSteps[i]=step;
        }
      }
      for(var i in jointSteps){
        var step=jointSteps[i];
        for(var i1=1,l1=step.length;i1<l1;i1++){
          var step1=step[i1];
          var state1=this.getStateFromStep(step1);
          if(state==state1){
            return [parseInt(i),i1];
          }
        }
      }
      return null;
    },
    fillPit:function(){
      var pit=this.getAtomicStep(this.stepIndex+1);
      var joint=this.steps[this.stepIndex+1];
      var step=this.getStepFromOptions(pit.options,pit.optionRules);
      if(step){
        if($.isArray(step)){
          var steps=step;
          step=steps.shift();
          if($.isArray(joint)){
            joint[0]=step;
          }else{
            this.steps[this.stepIndex+1]=step;
          }
          var args=[this.stepIndex+2,0].concat(steps);
          this.steps.splice.apply(this.steps,args);
        }else{
          if($.isArray(joint)){
            joint[0]=step;
          }else{
            this.steps[this.stepIndex+1]=step;
          }
        }
      }else{
        this._wrapSteps(this.steps,this.stepIndex+1);
        var branches=this.steps[this.stepIndex+1];
        branches.shift();
        this.steps=this._unwrapSteps(this.steps);
      }
      
      
    },
    getAtomicStep:function(trunkIndex){
      var step=this.steps[trunkIndex];
      if($.isArray(step)){
        step=step[0];
      }
      return step;
    },
    getStateByStepIndex:function(index){
      return this.getStateFromStep(this.getAtomicStep(index));
    },
    getStateFromStep:function(step){
      if(step!==undefined){
        if($.isArray(step)){//说明这时的step是joint step
          step=step[0];
        }
        return step.state||step;
      }
    },
    getNextState:function(){
      return this.getStateByStepIndex(this.stepIndex+1);
    },
    getNextTurnState:function(avoidRevisit){
      var i=this.stepIndex;
      while(i>=0){
        var branches=this.steps[i];
        if(branches&&$.isArray(branches)&&branches[1]){
          var state=this.getStateFromStep(branches[1]);
          if(avoidRevisit){
            var l=branches.length;
            var j=1;
            while(j<l){
              var state=this.getStateFromStep(branches[j]);
              if(!this.logs[state]){
                //表明该状态还未被访问过
                return state;
              }
              j++;
            }
          }else{
            return state;
          }
        }
        i=i-1;
        
      }
    },
    getLastState:function(){
      return this.getStateByStepIndex(this.stepIndex-1);
    }
});

