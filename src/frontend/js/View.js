$$.View=$$.O.createSubclass(
  {
    tag:'Div',
    textAlign:'left',
    get_reTextAlign:function(){
      if(this.textAlign=='left'){
        return 'right';
      }else if(this.textAlign=='right'){
        return 'left';
      }else{
        return 'center';
      }
    },
    steps:[],
    /**
     * 如果为真,表示当它改变状态时其父view的状态也会改变,
     * 如果为假,则不会
     */
    affectParent:false,
    preventClick:'accept',
    addCssClass:'',
    showConfigs:{
    },
    /**
     * 它跟showConfigs差不多,只是它用regex批量配置state
     */
    showConfigRules:[
      [/^$|^index/,'${indexShow}']
      //[/^refresh(\/|$)/,[null,'refresh']]
    ],
    /**
     * 输入相关配置,共有三种可能:null,array,map
     * 如果为null,表示它的输入是一些普通的named html input ,
     * 用getSimpleInputs就可以获得inputData,
     * 如果为array,表示它的输入是固定的一组input element,
     * 配置的时候每个input element 的配置可以有两种:inputName,[inputName,elementName]
     * 前者等价于 [inputName,inputName],即当inputName+"Input"与elementName相同时可以这样做,
     * 其中elementName是用来从this.elements中取出input element 的, 
     * 如果为map,表示它的输入包含多个组,每组是固定的几个input element.
     */
    inputConfigs:null,
    initInputDataConfigs:null,
    /**
     * 元素的配置,按名称保存在这里,当show页面的时候,一般只要一个名称列表即可
     * 根据这个名称列表生成的元素也按name保存在o.elements中,
     * 可以后续按name调用进行一些操作,比如validate的错误显示
     * 每个name后面的elementConfig的格式是[elementType,params,state,location]
     * 其中elementType可以是viewclass name,也可以是能被$$解读的view path,
     * params是指该viewclass init的参数,
     * state是指用该viewclass生成view element后马上设置的state,为空时则用defaultState
     * location 是指element要放置的位置,它可以是domnode(它又可以是jquery object或id或element name,具体看getDom这个接口),
     * 也可以是[domnode,"after"|"before"|"append"|"prepend"]
     */
    elementConfigs:{
      pageHeader:['Html',['<div class="page-header">${pageHead}</div>']],
      stage:['Html',['<div></div>']],
      dialog:['Dialog',['onCloseDialog'],null,$('body')],
      tabs:['Tabs',['${tabConfigs}','pill',true]]
    },
    elementConfigRules:[],
    indexShow:[],
    defaultState:"index",
    initLoads:null,
    init:function(){
      this.isLocked=true;
      this._baseShow={};
      this._currentShow={};
      this.elements={};
      this.outdatedElements={};
      this.domnode.innerHTML='';
      this.settingState='start';
      if(this.beforeInit){
        this.beforeInit.apply(this,arguments);
      }
      if(this.initInputDataConfigs){
        this.initInputDataConfigs=ssys.clone(this.initInputDataConfigs);
      }
      if(this.template){
        this.domnode.innerHTML=this.parseTemplate(this.template);
      }
      this.stage=document.getElementById(this.fullname+"__stage")||this.domnode;
      if(this.initShow){
        var configs=this._baseShow=this._getShowConfigs(this.initShow);
        this.showByConfigs(configs);
      }
      this.stage=document.getElementById(this.fullname+"__stage")||this.domnode;
      this.afterInit.apply(this,arguments);
      //console.info(this.fullname,"完成了初始化","[$$.View.init]");
      this.state="start";
      this.isLocked=false;
    },
    /**
     * @param matched0 是指对configRule matched的结果
     */
    "eval":function(path,matched0){
      var matched;
      /**
       * @rule 使用 ${xx:...} 的方式处理特殊的eval, 比如 eval_date, eval_datetime
       */
      if(matched=path.match(/^((\!)|(\w+):)(.+)$/)){
        var method=matched[3]||matched[2];
        if(method=="!"){
          return !(this.eval(matched[4]));
        }
        return this["eval_"+method](this.eval(matched[4],matched0),matched0);
      }
      /**
       * @rule 使用${xx~...}的方式处理缩略表达
       */
      if(matched=path.match(/(\w+)~(\w*)(\..+)?$/)){
        switch(matched[1]){
          case 'e':
            return "<span id='"+this.fullname+"__"+matched[2]+"'></span>";
            break;
          case 'cl':
            path="app.resources."+matched[2]+".CollectionView"+(matched[3]||'');
            break;
          case 'cr':
            path="app.resources."+matched[2]+".CreateView"+(matched[3]||'');
            break;
          case 'mv':
            path="app.resources."+matched[2]+".ModelView"+(matched[3]||'');
            break;
          default:
            if(this['parse_'+matched[1]]){
              path=this['parse_'+matched[1]](matched[2]+(matched[3]||''),matched0);
            }else{
              console.error(this.fullname,"无法识别前缀",matched[1],"!");
            }
            break;
        }
      }
      return $$.eval(path,this);
    },
    eval_date:function(timestamp){
      var t=new Date(parseInt(timestamp)*1000);
      //format='yyyy-MM-dd';
      var month=t.getMonth()+1;
      var date=t.getDate();
      var t=new Date();
      var result=month+"月"+date+"日";
      var year=t.getFullYear();
      if(t.getFullYear()!=year){
        result=year+"年"+result;
      }
      return result;
    },
    eval_datetime:function(timestamp){
      var t=new Date(parseInt(timestamp)*1000);
      //format=format||'yyyy-MM-dd HH:mm';
      var month=t.getMonth()+1;
      var date=t.getDate();
      var hours=t.getHours();
      if(hours<10){
        hours='0'+hours;
      }
      var minutes=t.getMinutes();
      if(minutes<10){
        minutes='0'+minutes;
      }
      var t=new Date();
      var result=month+"月"+date+"日 "+hours+":"+minutes;
      var year=t.getFullYear();
      if(t.getFullYear()!=year){
        result=year+"年"+result;
      }
      return result;
    },
    get_isGuest:function(){
      return !this.app.currentUser.id;
    },
    html:function(html){
      if(html===undefined){
        return this.domnode.innerHTML;
      }
      return this.domnode.innerHTML=html;
    },
    append:function(html){
      return this.domnode.insertAdjacentHTML("beforeend",html);
    },
    find:function(query){
      return $('#'+this.fullname).find(query);
    },
    children:function(query){
      return $('#'+this.fullname).children(query);
    },
    addClass:function(cssClass){
      return $('#'+this.fullname).addClass(cssClass);
    },
    removeClass:function(cssClass){
      return $('#'+this.fullname).removeClass(cssClass);
    },
    setStates:function(states,from){
      //console.info(this.fullname,"开始连续表演多个节目",states,"点播者from=",from);
      var _this=this;
      return ssys.loopDefer(states,null,function(state){
        return _this.setState(state,{type:'setStates',originStates:states,originView:_this});
      },function(i,state){
        console.error(_this.fullname,"setStates在第",i,"步setState(",state,")时出错了!");
      });
    },
    /**
     * @param string|array|number
     */
    setState:function(state,from,forceUnlock){
      console.info(this.fullname,"开始换节目了,要演出的节目是",state,"点播者from=",from,"当前演出的是",this.state,"[$$.View.setState]");
      if(this.layout&&this.layout!==this.app.layout){
        console.warn(this.fullname,"所在的layout过期了,对它的任何setState操作都作废");
        return ssys.reject();
      }
      state=state||this.defaultState;
      this.settingState=state;
      if(typeof state=="string"){
        if(typeof this[state]=="function"&&!this["filter_"+state]){
          return this[state]();
        }else if(state.match(/,/)){
          var states=state.split(',');
          return this.setStates(states);
        }else if(state.match(/^http/)){
          window.location.href =state;
        }
      }else if($.isArray(state)){
        state=ssys.clone(state);
        if(state[0].match&&state[0].match(/^\$\{.+\}$/)){
          state[0]=this.parseConfig(state[0]);
        }
        if(state[0].setState){
          var subjectView=state[0];
          var newState=state[1];
          this.isLocked=false;
          return subjectView.setState(newState,{type:'stateTransfer',originState:this.settingState,originView:this},forceUnlock);
        }else{
          return this.setStates(state,{type:'stateTransfer',originState:this.settingState,originView:this});
        }
      }else if(typeof state == 'number'){
        state=''+state;
      }
      if(state=="*"){
        //当view处于初始状态时,* state 解释为 defaultState,
        //其它情况下,* state 解释为当前state
        if(this.state=="start"){
          state=this.defaultState;
        }else{
          state=this.state;
          return ssys.resolve(state);
        }
      }else if(state=="-"){
        this.hide();
        return $$.resolve(state);
      }else if(state=="<"){
        state=this.getLastState()||this.defaultState;
      }else if(state==">"){
        state=this.getNextState()||this.defaultState;
      }/*else if(state==this.state){
        //console.info(this.fullname,"要表演的节目",state,"和当前节目",this.state,"相同, 不用表演了");
        return $$.resolve(state);
      }*/
      if(forceUnlock){
        this.isLocked=false;
      }
      /*if(!this.isRefresh&&(this.state===state||this.isLocked||(state===this.defaultState&&this.state===''))){
        return ssys.resolve(this.state);
      }*/
      if(state.match(/\$\{/)){
        state=this.parseConfig(state);
      }
      var entries=state.split("/");
      var entry=entries.shift();
      if(entry=='..'){
        return this.parent.setState(entries.join("/"),{type:'stateTransfer',originState:state,originView:this},forceUnlock);
      }else if(entry=='refresh'){
        state=entries.join("/");
        return this.refresh(state);
        /*this.isRefresh=true;
        ssys.isRefresh=true;
        //console.info(this.fullname,"开始刷新状态",entries,"[$$.View.setState]");
        return this.setState(entries);*/
      }else if(entry=='update'){
        state=entries.join("/");
        return this.update(state);
      }else if(entry.match(/^#/)){
        return this.app.layout.setState(state.substr(1),{type:'stateTransfer',originState:this.settingState,originView:this});
      }
      
      var _this=this;
      var parent=this.parent;
      _this.isLocked=true;
      var d=_this.closeState(state)||$$.resolve();
      if(!d.pipe){
        d=$$.resolve(d);
      }
      d=d.pipe(function(){
        return _this.loadByConfigs(state).pipe(function(){
          return _this.filterState(state).pipe(
            function(filteredState){
                return _this.show(filteredState).pipe(function(showedState){
                    //如果state以*结尾,说明它不是一个完整的state
                    //如果state以refresh开头,则说明它只是更新写法,真正的state还是要去掉refresh字的
                    var matched;
                    if(state.match(/\*$/)){
                      state=showedState;
                    }else if(matched=state.match(/(^|\/)refresh(\/|$)/)){
                      state=showedState;
                    }
                    //处理defaultState的情况
                    if(state==_this.defaultState){
                      state='';
                    }else if(matched=state.match(/\/$/)){
                      state=state.split(/\/$/)[0];
                    }
                    _this.state=state;
                    _this.domnode.setAttribute("data-state",state);
                    _this._currentShow.state=showedState;
                    _this.isLocked=false;
    
                    return state;
                },function(){
                  console.error(_this.fullname,"的表演失败了,将继续保持状态",_this.state,"[$$.View.setState]");
                  //_this.afterSetState(_this.state);
                  _this.isLocked=false;
                  return _this.state;
                });
            },
            function(filteredState){
              //console.info(_this.fullname,"要表演的节目",state,"没能通过审查过滤,转而要上演的节目是",filteredState,"[$$.View.setState]");
              //如果返回的是一个数组, 那么这个filter相当于一个redirect, 让别的view改变状态
              _this.isLocked=false;
              if(filteredState!==undefined){
                return _this.setState(filteredState,{type:'filteredState',originState:_this.settingState,originView:_this});
              }
            });
        });
      },function(error){
        _this.isLocked=false;
        console.error(_this.fullname,"closeState失败了!this.state=",_this.state);
      })
      /**
       * @todo 当一个view要setState时, 要通知其parent
       */
      /*d.always(function(){
          //console.debug(_this.name,"always","parent,parent.elementSettings=",parent,parent.elementSettings);
        if(parent&&parent.elementSettings){
          delete parent.elementSettings[_this.name];
          var i=0;
          for(var k in parent.elementSettings){
            i++;
            break;
          }
          if(i==0){
            //说明elementSettings已经空了, 当前是最后一个elementSetting返回了
            delete parent.elementSettings;
            parent.elementSettingDfd.resolve();
          }
        }
      });
      if(parent){
        //console.info(this.fullname,"通知其parent",parent.fullname,"它在表演");
        if(!parent.elementSettings){
          parent.elementSettingDfd=new $.Deferred();
          parent.elementSettings={};
          parent.__setState=parent.setState;
          parent.setState=function(state,from,forceUnlock){
            var _this=this;
            console.warn(parent.fullname,"还有elementSetting未完成, 延后",state,"的表演","from=",from);
            return this.elementSettingDfd.pipe(function(){
              _this.setState=_this.__setState;
              return _this.setState(state,from,forceUnlock);
            });
          };
        }
        parent.elementSettings[this.name]=d;
      }*/
      return this.setStateDfd=d;
    },
    hide:function(){
      this.domnode.style.display="none";
      this.hidingState=this.state;
      this._currentShow.state=this.state="-";
      this.parent._currentShow[this.name]=false;
      return ssys.resolve("-");
    },
    display:function(){
      this.domnode.style.display="";
      this._currentShow.state=this.state=this.hidingState;
      this.parent._currentShow[this.name]=this._currentShow;
      for(var name in this.outdatedElements){
        this.outdatedElements[name].refresh();
        delete this.outdatedElements[name];
      }
      return ssys.resolve(this.state);
    },
    closeState:function(nextState){
      var closer=this.getStateCloser(this.state);
      if(closer){
        return this["closer_"+closer](nextState);
      }
    },
    filterState:function(state){
      //console.info(this.fullname,"开始审查过滤节目",state,"[$$.View.filterState]");
      var filter=this.getStateFilter(state);
      //console.info(this.fullname,"已经将节目上交给对应的审查员了,审查员filter=",filter);
      var _this=this;
      if(filter){
        if($.isArray(filter)){
          var filters=filter;
        }else{
          var filters=[filter];
        }
        var _this=this;
        //console.debug("","filters=",filters);
        var d=ssys.loopDefer(filters,state,function(filter,state){
          if(_this["filter_"+filter]){
            var d=_this["filter_"+filter](state);
          }else{
            throw _this.fullname+"在filterState("+state+")时出错了,没有找到名为"+filter+"的filter, 请检查filter的配置";
          }
          if(d===undefined){
            d=ssys.resolve(state);
          }else if(!d.pipe){
            if(d===false){
              //如果返回的是false,就表示没通过filter
              d=ssys.reject();
            }else{
              d=ssys.resolve(d);
            }
          }
          return d;
        },function(i,filter,filteredState){
          console.error(_this.fullname,"setState(state=",state,")的过程中, 在第",i,"步filter为",filter,"时出错了!返回结果是",filteredState,"其中全部filter列表为",filters);
          return filteredState;
        });
      }else{
        var d=ssys.resolve(state);
      }
      return d.pipe(function(filteredState){
          if(typeof filteredState=="string"){
            if(filteredState.match(/\$/)){
              filteredState=_this.parseConfig(filteredState);
            }
            if(filteredState.match(/[.,><#]|^refresh\b|^update\b/)){
              return ssys.reject(filteredState);
            }else{
              return filteredState;
            }
          }else{
            return ssys.reject(filteredState);
          }
      },function(filteredState){
        //console.info(_this.fullname,"要上演的节目",state,"没能通过审查,要换成节目",filteredState,"!","[$$.View.filterState]");
        if(filteredState===''){
          filteredState=_this.defaultState;
        }
        return filteredState||_this.state;
      });
    },
    getStateConfig:function(state,configType,way){
      if(state===''){
        state=this.defaultState;
      }
      return this.getRoutedConfig(state,configType,way);
    },
    getStateFilter:function(state){
      var filter=this.getStateConfig(state,"filter");
      if(!filter){
        var entry=state.split("/")[0];
        if(this['filter_'+entry]){
          filter=entry;
        }
      }
      return filter;
    },
    getStateCloser:function(state){
      var closer=this.getStateConfig(state,"closer");
      if(!closer){
        var entry=state.split("/")[0];
        if(this['close_'+entry]){
          closer=entry;
        }
      }
      return closer;
    },
    loadByConfigs:function(state,loadConfigs){
      var loadConfigs=loadConfigs||this.getStateConfig(state,"load");
      if(!loadConfigs){
        return $$.resolve();
      }
      return this._loadByConfigs(loadConfigs);
    },
    _loadByConfigs:function(loadConfigs){
      //console.debug(this.fullname,"_loadByConfigs","loadConfigs=",loadConfigs);
      var _this=this;
      return $$.asyncLoopDefer(loadConfigs,function(config){
        return _this.loadByConfig(config[0],config[1]);
      },function(i,a,failResult){
        console.warn(_this.fullname,"loadByConfigs失败了!具体在第",i,"项,配置为:",a,"时失败了, 返回结果是",failResult,". 全体loadConfigs=",loadConfigs);
      });
      
    },
    loadByConfig:function(name,path){
      var matched;
      if(matched=path.match(/^js:(.+)/)){
        return $$.getJs(matched[1]);
      }else{
        var entries=$$.divide(path,"/");
        var resource=this.app.resources[entries[0]];
        var _this=this;
        if(resource){
          return resource.loadByConfig(entries[1]).pipe(function(data){
            return _this[name]=data;
          },function(failedResult){
            var result=_this.onLoadFail(name,failedResult);
            if(result.pipe){
              return result;
            }else{
              return $$.resolve(result);
            }
          });
        }else{
          console.error(this.fullname,"loadByConfig(",name,path,")失败了,没有找到名为",entries[0],"的resource!");
        }
      }
    },
    onLoadFail:function(name,failedResult){
      console.warn(this.fullname,"load数据",name,"失败了!failedResult=",failedResult);
      this[name]=null;
      return failedResult;
    },
    show:function(state){
      //console.info(this.fullname,"开始显示",state,"状态","[View.show]");
      var steps=$$.divide(state,"/");
      var firstStep=steps[0]||this.defaultState;
      var nextSteps=steps[1];
      var showConfigs=this.getShowConfigs(firstStep);
      var d;
      var _this=this;
      this.showByConfigs(showConfigs);
      if(this.elementSettingDfd){
        d=this.elementSettingDfd.pipe(function(){
          return _this.showNextSteps(nextSteps,firstStep);
        });
      }else{
        d=this.showNextSteps(nextSteps,firstStep);
      }
      return d.pipe(function(){
        //console.info(_this.fullname,"的表演已经结束了,最终舞台定格在节目",state,"上","[$$.View.show]");
        _this.entry=firstStep;
        return _this.afterShow(state);
      });
    },
    showNextSteps:function(nextSteps,firstStep){
      //console.info(this.fullname,"第一步(firstStep=",firstStep,")已经show完了,接着show nextSteps,nextSteps=",nextSteps);
      var _this=this;
      if(nextSteps){
        var steps=$$.divide(nextSteps,"/");
        var nextStep=steps[0];
        if(nextStep.match(/\./)){
          var tmp=$$.divide(nextStep,".");
          var elementName=tmp[0];
          if(!_this.elements[elementName]){
            console.error(_this.fullname,"名为"+elementName+"的元素不存在!");
          }
          if(steps[1]){
            nextSteps=tmp[1]+"/"+steps[1];
          }else{
            nextSteps=tmp[1];
          }
        }else{
          var elementName=firstStep;
        }
      }else{
        var elementName=firstStep;
      }
      //console.info(this.fullname,"找到了下一步要show的element的name=",elementName);
      var element=_this.elements[elementName];
      var d;
      if(element){
        if(element.setState){
          //console.info(_this.fullname,"开始对元素",elementName,"setState(",nextSteps||'',")");
          d=element.setState(nextSteps||'',{type:'nextSteps',originView:this,originState:this.settingState,elementName:elementName});
        }else if(nextSteps){
          console.error(_this.fullname,"名为"+elementName+"的元素没有setState 方法!所以无法继续表演:",nextSteps);
        }else{
          d=ssys.resolve();
        }
      }else{
        if(nextSteps){
          console.warn(this.fullname,"没有找到名为",elementName,"的元素,只能停止show了,还有nextSteps=",nextSteps,"没有完成");
        }
        d=ssys.resolve();
      }
      return d;
    },
    getShowConfigs:function(step){
      if(step=='start'){
        configs={};
      }else{
        var configs=this.getStateConfig(step,"show")||[step];
      }
      return this._getShowConfigs(configs);
    },
    _getShowConfigs:function(configs){
      var _currentShow=this._currentShow;
      var _baseShow=this._baseShow;
      var nextShow=$$.clone(_baseShow);
      for(var i=0,l=configs.length;i<l;i++){
        var config=configs[i];
        if(typeof config=="string"){
          var matched=config.match(/^([-@])?([^.]+)(\.(.*))?$/);
        }else{
          console.error(this.fullname,"的showConfigs",configs,"中的config=",config,"有误!config只能是string");
        }
        if(!matched){
          console.error(this.fullname,"showConfigs",configs,"中的config=",config,"有误!形式不匹配");
        }
        var elementName=matched[2];
        var prefix=matched[1];
        var state=matched[4];
        if(state===undefined){
          state='start';
        }
        /*var elementCurrentShow=_currentShow[elementName];
        //如果该元素已经存在并且state相同, 或者元素未存在而在当前config中需要隐藏它时, 都不需要在下一步显示中去处理, 除了这两种情况外都需要在下一步显示中处理
        if(!((elementCurrentShow&&elementCurrentShow.state==state)||(!elementCurrentShow&&prefix=='-'))){
          nextShow[elementName]={state:state,prefix:prefix};
        }*/
        nextShow[elementName]={state:state,prefix:prefix};
      }
      for(var elementName in _currentShow){
        if(elementName=="state"){
          continue;
        }
        var elementCurrentShow=_currentShow[elementName];
        var elementNextShow=nextShow[elementName];
        var elementBaseShow=_baseShow[elementName];
        if(elementCurrentShow){
          if(!elementNextShow){
            nextShow[elementName]={prefix:"-"};
          }else if(!elementNextShow.prefix&&(typeof elementCurrentShow=="object"&&(elementNextShow.state ==elementCurrentShow.state||(elementCurrentShow.state===undefined&&elementNextShow.state=='start')))||(elementCurrentShow===true && elementNextShow.prefix===undefined)){
            delete nextShow[elementName];
          }
        }else{//elementCurrentShow==false 时
          if(elementNextShow){
            if(elementNextShow.prefix=="-"){
              delete nextShow[elementName];
            }
          }else if(elementBaseShow){
            if(elementBaseShow.prefix!='@'){
              nextShow[elementName]={prefix:"+"};
            }
          }
        }
      }
      return nextShow;
    },
    showByConfigs:function(configs){
      //console.info(this.fullname,"开始按剧本",configs,"来表演","[$$.View.showByConfigs]");
      this.locationConfigs={};
      this.wrapperConfigs={};
      for(var elementName in configs){
        var config=configs[elementName];
        this.showElement(elementName,config.state,config.prefix);
      }
      for(var name in this.locationConfigs){
        this.moveElement(name,this.locationConfigs[name]);
      }
      for(var name in this.wrapperConfigs){
        this.wrapElement(name,this.wrapperConfigs[name]);
      }
      
    },
    removeElement:function(name){
      $('#'+this.fullname+'__'+name).remove();
      delete this.elements[name];
    },
    hideElement:function(name){
      var element=this.elements[name];
      if(element.setState){
        element.hide();
      }else{
        element.hide();
        this._currentShow[name]=false;
      }
    },
    showElement:function(name,state,prefix){
      /*if(this.isRefresh){
        delete this.elements[name];
      }*/
      /**
       *@rule '@'标记的element是每次show都必然要重新生成的
       * 这类element不能用${e~xx}写在模板上, 它的位置必须靠location设置
       */
      if(prefix=='@'&&this.elements[name]){
        this.removeElement(name);
      }
      var element=this.elements[name];
      if(!element){
        var elementConfig=this.getElementConfig(name);
        if(elementConfig){
          element=this.createElement(name,elementConfig);
          if(!element){
            //console.info(this.fullname,"的",name," element因为hide条件而不用创建");
            return ;
          }
        }else{
          return console.error(this.fullname,"的剧本上没找到",name,"元素的添加方法,不知道如何添加它!","[$$.View.showElement]");
        }
      }
      if(prefix=="-"){
        if(element.hide){
          element.hide();
        }else{
          element.style.display="none";
          this._currentShow[name]=false;
        }
      }else if(prefix=="+"){
        if(element.display){
          element.display();
        }else{
          element.style.display="";
          this._currentShow[name]=true;
        }
      }else if(element.setState){
        if(element.state=="-"){
          element.display();
        }
        if(state!="start"){
          element.setState(state,{type:'showElement',originView:this,originState:this.settingState});
        }
      }else{
        element.style.display="";
        this._currentShow[name]=true;
      }
      return element;
    },
    getElementConfig:function(name){
      var elementConfig=this.elementConfigs[name];
      var matched;
      if(!elementConfig){
        elementConfigRules=this.elementConfigRules;
        for(var i=0,li=elementConfigRules.length;i<li;i++){
          var rule=elementConfigRules[i];
          var regex=rule[0];
          matched=name.match(regex);
          if(matched){
            elementConfig=rule[1];
            if(typeof elementConfig=="function"){
              elementConfig=elementConfig.call(this,name);
            }
            break;
          }
        }
      }
      elementConfig=this.parseConfig(elementConfig,matched);
      return elementConfig;
    },
    createElement:function(name,elementConfig){
      //console.info(this.fullname,"已经找到",name,"元素的添加方法",elementConfig,"[$$.View.showElement]");
      elementConfig=elementConfig.slice(0);//为了不破坏原来的configs,在这里要克隆一下
      var elementType=elementConfig[0];
      var params=elementConfig[1]||[];
      if(!params.splice){
        params=[params];
      }
      var location=elementConfig[2];
      var cssClass=elementConfig[3];
      var wrapper=elementConfig[4];
      var hide=elementConfig[5];
      if(typeof location=="object" && !location.concat){
        cssClass=location.cssClass;
        wrapper=location.wrapper;
        hide=location.hide;
        location=location.location;
      }
      if(hide){
        return;
      }
      var _this=this;
      var createFunction=this["create"+elementType]||this.app.layout["create"+elementType];
      if(createFunction){
        //console.info(this.fullname,"已找到生成元素",name,"的方法","create"+elementType,"调用该方法就可以了","[$$.View.showElement]");
        params.unshift(name);
        var element=createFunction.apply(this,params);
        this._currentShow[name]=true;
      }else{
        if(typeof elementType=='string'){
          elementType=this.self[elementType]||this.app.layout.self[elementType]||$$.View[elementType];
        }
        if(!elementType||typeof elementType!='function'){
          console.error(this.fullname,"名为"+name+"的element创建失败!","无法识别元素种类",elementConfig[0],"识别结果是",elementType,"(有效的只能是string或function)");
          return ;
        }
        var element=elementType.create(this,name,params);
      }
      if(element){
        this.elements[name]=element; 
        if(location){
          this.locationConfigs[name]=location;
        }
        if(cssClass){
          if(element.addClass){
            element.addClass(cssClass);
          }else{
            $(element).addClass(cssClass);
          }
        }
        if(wrapper){
          this.wrapperConfigs[name]=wrapper;
        }
        //如果该元素是个input元素, 就要检查它有没有初始值,
        //如果有的话就设成初始值
        var inputName=this.getInputNameOfElement(name);
        if(inputName){
          element.setAttribute('input_name',inputName);
          if(this.initInputDataConfigs){
            var initValue=this.initInputDataConfigs[inputName];
            if(initValue){
              element.setInputData(initValue);
            }
          }
        }
        if(name=='stage'){
          this.stage=element;
        }
        return element;
      }else{
        console.error(_this.fullname,"无法生成名为"+name+"的element!");
      }
      
    },
    setAttribute:function(attributeName,value){
      return this.domnode.setAttribute(attributeName,value);
    },
    moveElement:function(element,location){
      //console.info(this.fullname,"移动元素",element,"到位置",location,"上","[$$.View.moveElement]");
      if(typeof element=="string"){
        element=this.elements[element];
      }
      var elementNode=element.domnode||element;
      location=this.parseLocation(location);
      $$.moveDom(elementNode,location[0],location[1]);
    },
    wrapElement:function(elementName,wrapper){
      var element=this.elements[elementName];
      var elementNode=element.domnode||element;
      wrapper=wrapper.replace("{{}}","<div id='"+elementNode.id+"_wrapper'></div>");
      elementNode.insertAdjacentHTML("beforebegin",wrapper);
      $$.moveDom(elementNode,"self",document.getElementById(elementNode.id+"_wrapper"));
    },
    parseTemplate:function(template){
      return this.parseConfig(template.replace(/ e="/g,' id="'+this.fullname+'__'));
    },
    /**
     * 一些特殊的初始化逻辑可以放在这里,这是在将init配置的元素生成之前的
     */
    beforeInit:function(){
      if(this.initDatas&&!this.isRefresh){//这是为了加速用的,刷新的时候不用这个
        var dataConfigs=this.parseConfig(this.initDatas);
        if(dataConfigs){
          return this.app.loadByConfigs(dataConfigs);
        }else{
          console.error(this.fullname,"加载initDatas失败!initDatas配置有错, parseConfig之后为空.initDatas=",this.initDatas);
        }
      }
    },
    /**
     * 一些特殊的初始化逻辑可以放在这里,这是在将init配置的元素生成之后的
     */
    afterInit:function(){
      
    },
    onLogin:function(){
      this._login();
    },
    _login:function(){
      if(this.loginConfigs){
        for(var i=0,l=loginConfigs.length;i<l;i++){
          var config=loginConfigs[i];
          if(this.elements[config]){
            this.elements[config].onLogin();
          }
        }
      }
    },
    getElement:function(name){
      if(name.charAt(0)=='#'){
        var fullname=name.substr(1);
      }else{
        var fullname=this.fullname+"__"+name;
      }
      return ssys.views[fullname];
    },
    filter_index:function(state){
      return state;
    },
    filter_logged:function(state){
      //console.info(this.fullname,"审查观众是否登录了","[$$.View.filter_logged]");
      if(!this.app.currentUser.id){
        console.info(this.fullname,"进入状态[",state,"]前需要登录,当前用户未登录,没能通过审查,将转去登录页面","[$$.View.filter_logged]");
        this.app.layout.afterLoginState=state;
        return ssys.reject("#p_session/login");
      }else{
        return ssys.resolve(state);
      }
    },
    remove:function(){
      for(var name in this.elements){
        var element=this.elements[name];
        if(element.setState){
          element.remove();
        }else{
          $('#'+this.fullname+"__"+name).remove();
        }
      }
      delete this.parent.elements[this.name];
      if(this.parent.entry==this.name){
        this.parent.state='error';
        this.parent.entry='';
      }
      delete this.parent._currentShow[this.name];
      $('#'+this.fullname).remove();
    },
    refresh:function(state){
      //console.info(this.fullname,"开始刷新","this.params=",this.params,"state=",state);
      if(!state&&state!==''){
        /**
         * @rule when state param is empty, if refreshState is defined, use refreshState, otherwise use currentState
         */
        if(this.refreshState!==undefined){
          state=this.refreshState;
        }else{
          state=this.state;
        }
      }
      ssys.isRefresh=true;
      var _this=this;
      var d=this.beforeRefresh();
      if(d){
        d=d.pipe(function(){
          return _this._refresh(state);
        });
      }else{
        d=this._refresh(state);
      }
      return d.always(function(){
        ssys.isRefresh=false;
      });
    },
    update:function(state){
      if(!state&&state!==''){
        state=this.state;
      }
      ssys.isRefresh=true;
      var _this=this;
      var d=this.beforeRefresh();
      if(d){
        return d.pipe(function(){
          return _this._update(state);
        });
      }else{
        return this._update(state);
      }
      
    },
    /**
     * 将被override, 用来放一些特殊的刷新逻辑, 比如要更新init参数
     * @return null|Deferred
     */
    beforeRefresh:function(){
    },
    _refresh:function(state){
      //this.init.apply(this,this.params||[]);
      var view=this.self.create(this.parent,this.name,this.params);
      return view.setState(state,{type:'refresh'});
    },
    _update:function(state){
      return this.setState(state,{type:'update'}).pipe(function(state){
          ssys.isRefresh=false;
          return state;
      });
    },
    displayElements:function(elements){
      for(var i=0,l=elements.length;i<l;i++){
        var elementName=elements[i];
        var element=this.elements[elementName];
        var dom=element.domnode||element;
        dom.show();
      }
    },
    hideElements:function(elements){
      for(var i=0,l=elements.length;i<l;i++){
        var elementName=elements[i];
        var element=this.elements[elementName];
        var dom=element.domnode||element;
        $(dom).hide();
      }
    },
    afterShow:function(state){
      //console.info(this.fullname,"已经完成了对state=",state,"的显示","[View.afterShow]");
      var entry=this.entry;
      var afterShow=this['after_'+entry];
      if(afterShow){
        //console.info(this.fullname,"的舞台已经摆上了元素,现在对这些元素进行后续处理","[$$.View.afterShow]");
        this['after_'+entry]();
      }
      if(state==this.getLastState()){
        this.logs.pop();
      }else{
        this.logs.push(state);
      }
      return state;
    },
    getLastState:function(){
      return this.logs[this.logs.length-2];
    },
    getNextStep:function(){
      var index=$.inArray(this.state||this.defaultState,this.steps)+1;
      if(index>=0){
        return this.steps[index];
      }
    },
    nextStep:function(){
      var state=this.getNextStep();
      if(state===undefined){
        return ssys.reject(this.fullname,"的当前状态:",this.state,"没有下一步!");
      }
      return this.setState(state,{type:'nextStep'});
    },
    getLastStep:function(){
      var index=$.inArray(this.state,this.steps)-1;
      if(index>=0){
        return this.steps[index];
      }
    },
    lastStep:function(){
      var state=this.getLastStep();
      if(state===undefined){
        return ssys.reject(this.fullname,"的当前状态:",this.state,"没有上一步!");
      }
      return this.setState(state,{type:'lastStep'});
    },
    getParentState:function(state){
      var entries=state.split(/\/\w+$/);
      if(entries.length==2){
        return entries[0];
      }else{
        return null;
      }
    },
    getMatchedConfig:function(key,map,rules,way,configTypeIndex){
      var matched=null;
      var value,values;
      if(map){
        value=map[key];
      }
      if(way=="list"||way=="concat"){
        values=[];
      }
      if(!value||way=="list"||way=="concat"){
        for(var i=0,l=rules.length;i<l;i++){
          var rule=rules[i];
          var regex=rule[0];
          matched=key.match(regex);
          if(matched){
            value=rule[1];
            if(configTypeIndex!==undefined){
              value=value[configTypeIndex];
            }
            if(value){
              value=this.parseConfig(value,matched);
              if(way=="list"){
                values.push(value);
              }else if(way=="concat"){
                if($.isArray(value)){
                  values=values.concat(value);
                }else{
                  values.push(value.slice(0));
                }
              }else{
                break;
              }
            }
          }
        }
      }
      return values||value;
    },
    /**
     * 初始化input element, 给他们赋予初始值, 这是赋值在initInputDataConfigs 中,
     * 每个input element在创建时会检查这个配置, 如果有初始值就会按这个值设置
     */
    initInputData:function(inputData){
      var inputConfigs=this.inputConfigs;
      if(inputConfigs){
        if(!this.initInputDataConfigs){
          this.initInputDataConfigs={};
        }
        for(var i=0,l=inputConfigs.length;i<l;i++){
          var config=inputConfigs[i];
          var name=this.getInputName(config);
          var value=inputData[name];
          if(value!==undefined){
            this.initInputDataConfigs[name]=value;
          }
        }
      }
      
    },
    /**
     * 直接给input element 赋值
     */
    setInputData:function(inputData){
      var inputConfigs=this.inputConfigs;
      if(inputConfigs){
        for(var i=0,l=inputConfigs.length;i<l;i++){
          var config=inputConfigs[i];
          var name=this.getInputName(config);
          var elementName=this.getInputElementName(config);
          var element=this.elements[elementName];
          if(element){
            element.setInputData(inputData[name]);
          }
        }
      }
    },
    /**
     * 如果elementName 是一个input element的名字, 就返回其对应的input name,
     * 否则就不返回
     */
    getInputNameOfElement:function(elementName){
      var inputConfigs=this.inputConfigs;
      if(inputConfigs){
        for(var i=0,l=inputConfigs.length;i<l;i++){
          var config=inputConfigs[i];
          var name=this.getInputName(config);
          if(elementName==this.getInputElementName(config)){
            return name;
          }
        }
      }
      
    },
    updateInputData:function(){
      var inputConfigs=this.inputConfigs;
      var inputData=this.inputData=this.inputData||{};
      this.inputElement=null;
      this.inputElements={};
      //console.info(this.fullname,"开始根据配置",inputConfigs,"更新输入数据,更新前的数据为:",JSON.stringify(this.inputData),"[$$.View.updateInputData]");
      if(!inputConfigs){
        //console.info(this.fullname,"没有输入配置,将按name读取所有domnode内的input","[$$.View.updateInputData]");
        var newData=this.getSimpleInputs();
        ssys.updateObject(inputData,newData);
      }else if($.isArray(inputConfigs)){
        //console.info(this.fullname,"的输入配置是个数组,说明它是一组输入,直接调用updateInputGroup即可","[$$.View.updateInputData]");
        var newData=this.updateInputGroup(inputConfigs);
        ssys.updateObject(inputData,newData);
      }else if(typeof inputConfigs=="string"){
        //console.info(this.fullname,"的输入配置是个字符串,说明它是一个名为",inputConfigs,"的element的inputData","[$$.View.updateInputData]");
        var newData=this.elements[inputConfigs].updateInputData();
        this.inputElement=this.elements[inputConfigs];
        ssys.updateObject(inputData,newData);
      }else{
        //console.info(this.fullname,"的输入是个map,说明它是多组输入,需要分组更新","[$$.View.updateInputData]");
        for(var groupName in inputConfigs){
          var group = inputConfigs[groupName];
          if(typeof group=="string"){
            //console.info(this.fullname,"名为",groupName,"的一组输入完全是",group,"元素的输入","[$$.View.updateInputData]");
            var value=this.elements[group].updateInputData();
            this.inputElements[groupName]=this.elements[group];
          }else{
            var value=ssys.updateObject(inputData[groupName],this.updateInputGroup(group));
          }
          inputData[groupName]=value;
        }
      }
      //console.info("view(",this.fullname,")成功更新了input数据,更新后的数据为:",this.inputData,"[$$.View.updateInputData]");
      this.removeErrors();
      return inputData;
    },
    removeErrors:function(){
      this.removeClass("ssysErrorElement");
      this.find(".ssysErrorElement").removeClass("ssysErrorElement");
      this.find(".ssysErrorMessage").remove();
    },
    updateInputGroup:function(groupConfig){
      //console.info(this.fullname,"开始根据一组输入配置",groupConfig,"来更新输入","[$$.View.updateInputGroup]");
      var inputData={};
      
      for(var i=0,l=groupConfig.length;i<l;i++){
        var config=groupConfig[i];
        var name=this.getInputName(config);
        var elementName=this.getInputElementName(config);
        var element=this.elements[elementName];
        if(element){
          if(element.updateInputData){
            var data=element.updateInputData();
          }else{
            //如果它没有updateInput接口,说明它是一个简单的domnode
            var data=this.getSimpleInputs(element);
          }
          this.inputElements[name]=element;
        }else{
          var data=this.getSimpleInputs()[name];
        }
        inputData[name]=data;
      }
      //console.info(this.fullname,"这一组的输入已经更新完毕,更新后的数据为",inputData,"[$$.View.updateInputGroup]");
      return inputData;
    },
    /**
     * 在showErrors的时候会用到
     */
    getInputElementByInputName:function(inputName){
      var inputConfigs=this.inputConfigs;
      if(inputConfigs){
        if($.isArray(inputConfigs)){
          return this.getInputElementFromInputGroupConfig(inputConfigs,inputName);
        }else{
          for(var groupName in inputConfigs){
            var groupConfig = inputConfigs[groupName];
            var element=this.getInputElementFromInputGroupConfig(groupConfig,inputName);
            if(element){
              return element;
            }
          }
        }
      }
    },
    getInputElementFromInputGroupConfig:function(groupConfig,inputName){
      for(var i=0,l=groupConfig.length;i<l;i++){
        var elementConfig=groupConfig[i];
        if(inputName==this.getInputName(elementConfig)){
          return this.elements[this.getInputElementName(elementConfig)];
        }
      }
    },
    /**
     * 通过单项input的config来获得对应的inputElementName
     * @param string|array config
     */
    getInputElementName:function(config){
      if(typeof config=="string"){
        var name=config+"Input";
      }else{
        var name=config[1];
      }
      return name;
    },
    /**
     * 跟getInputElementName不同,这里返回的是inputData中的name
     */
    getInputName:function(config){
      if(typeof config=="string"){
        var name=config;
      }else{
        var name=config[0];
      }
      return name;
      
    },
    getSimpleInputs:function(domnode){
      domnode=domnode||this.domnode;
      var inputs=$(domnode).find('*').serializeArray();
      var inputObject={};
      for(var i=0,l=inputs.length;i<l;i++){
        var input=inputs[i];
        inputObject[input.name]=input.value;
      }
      return inputObject;
    },
    showErrors:function(errors){
      console.error(this.fullname,"输入有这些错误:",errors);
      if(typeof errors== "string"){
        this.showError(errors);
      }else if($.isArray(errors)){
        //this.showError(errors);
      }else if(typeof errors =="object"){
        for(var name in errors){
          var error = errors[name];
          var element=this.getInputElementByInputName(name);
          if(element&& element.showErrors){
            element.showErrors(error);
          }else{
            var method=this["show"+name+"Error"];
            if(method){
              this["show"+name+"Error"](error);
            }else{
              this.showError(error,name);
            }
          }
        }
      }
    },
    /**
     * 这是可以被override的
     */
    showError:function(error,name){
      this.find(":visible[input_name='"+name+"']").addClass("ssysErrorElement").after("<div class='ssysErrorMessage'>"+error+"</div>");
    },
    getDom:function(path){
      if(path===undefined||path===null){
        console.error(this.fullname,"getDom(path)出错了!path不能是",path,"!");
        return;
      }
      if(path.appendChild){
        //说明path本身就是个domnode
        return path;
      }else if(typeof path=="string"){
        var entries=path.match(/^(\w+)(\/(.+))?$/);
        if(entries){
          var elementName=entries[1];
          var cssPath=entries[3];
          var id=this.fullname+"__"+elementName;
          var domnode=document.getElementById(id);
          if(cssPath){
            if(!cssPath.match(/^#/)){
              cssPath="#"+id+" "+cssPath;
            }
            return document.querySelector(cssPath);
          }else{
            return domnode;
          }
        }else{
          if(!path.match(/^#/)){
            path="#"+this.fullname+" "+path;
          }
          return document.querySelector(path);
        }
      }else if(path.domnode){
        return path.domnode;
      }
    },
    /**
     * @return [domnode,append|prepend|after|before|null]
     */
    parseLocation:function(location,name){
      if(name){
        var domnode=document.getElementById(this.fullname+"__"+name);
        if(domnode){
          return [domnode,'self'];
        }
      }
      //默认情况下domnode是指当前view的stage
      var domnode=this.stage;
      var at=null;
      if(typeof location=="string"){
        if(location.match(/^(append|prepend|after|before)$/)){
          at=location;
        }else{
          domnode=this.getDom(location);
        }
      }else if(!location){
        at="append";
      }else if($.isArray(location)){
        domnode=location[1];
        at=location[0];
      }else{
        //这时可能是一个view object,也可能是一个jquery object
        domnode=location;
      }
      //保证了返回的一定是domnode 而不会是view object
      domnode=this.getDom(domnode);
      if(!domnode||!domnode.appendChild){
        console.error(this.fullname,"没有找到location=",location,"对应的domnode!");
      }
      at=at||"append";
      //console.info(this.fullname,"将位置",location,"理解为",at,domnode,"[$$.View.parseLocation]");
      return [at,domnode];
    },
    createHtml:function(name,html,options){
      $$.assert(html&&typeof html=="string"&&html.match(/^</),this.fullname+"名为"+name+"的element配置有误, 缺少有意义的html字符串");
      var id=name?this.fullname+"__"+name:null;
      var node0=document.getElementById(id);
      if(node0){
        node0.insertAdjacentHTML('afterend', html);
        var node=node0.nextSibling;
        node.className+=' '+node0.className;
        node0.parentNode.removeChild(node0);
      }else{
        this.stage.insertAdjacentHTML('beforeend', html);
        var node=this.stage.lastChild;
      }
      node.id=id;
      node.className+=' '+name;
      if(options){
        if(options.data){
          $(node).data(options.data);
          for(var k in options.data){
            node.setAttribute('data-'+k,options.data[k]);
          }
        }
        if(options.attr){
          $(node).attr(options.attr);
        }
      }
      return node;
    },
    createImage:function(name,src,options){
      options=options||{};
      var tooltip=options.tooltip||'';
      var html='<img src="'+src+'" class="img-responsive" alt="'+tooltip+'">';
      return this.createHtml(name,html,options);
    },
    /**
     * options包括 cssClass,type,size,warning,tooltip,icon
     */
    createButton:function(name,state,title,options){
      options=options||{};
      var cssClass=(options.cssClass||'')+' ssysButton';
      var type=options.type||'default';
      var sizeClass=options.size?'btn-'+options.size:'';
      var html="<button data-state='"+state+"' data-warning='"+(options.warning||'')+"' title='"+(options.tooltip||'')+"' class='btn btn-"+type+" "+sizeClass+" "+cssClass+"'>";
      if(options.icon){
        html=html+"<span class='fa fa-"+options.icon+"'></span>"+title+"</button>";
      }else{
        html=html+title+"</button>";
      }
      return this.createHtml(name,html,options);
    },
    /**
     * options包括cssClass,tooltip,icon,imgSrc,imgClass
     */
    createLink:function(name,state,title,options){
      options=options||{};
      if(options.icon){
        title="<span class='fa fa-"+options.icon+"'></span>"+(title||'');
      }else if(options.imgSrc){
        title="<img src='"+options.imgSrc+"' class='"+(options.imgClass||'')+"' ><span>"+(title||'')+"</span>"
      }
      if(options.useHref){
        var html="<a href='"+state+"'  title='"+(options.tooltip||'')+"'>"+title+"</a>";
      }else{
        var html="<a href='javascript:;' class='ssysLink' data-state='"+state+"' title='"+(options.tooltip||'')+"'>"+title+"</a>";
      }
      return this.createHtml(name,html,options);
    },
    createPanel:function(name,options){
      options=options||{};
      var body=options.body||'';
      var type=options.type||'default';
      var head=options.head?'<div class="panel-heading">'+options.head+'</div>':'';
      var footer=options.footer?'<div class="panel-footer">'+options.footer+'</div>':'';
      var html='<div class="panel panel-'+type+'">'+
          head+
          '<div class="panel-body">'+body+'</div>'+
          footer+
        '</div>';
      return this.createHtml(name,html,options);
    },
    renderStyle:function(){
      var cssClass=this.cssClass?this.cssClass:(this.style?this.style+" "+this.name:this.name);
      $$.addClass(this.domnode,cssClass);
      if(this.addCssClass){
        $$.addClass(this.domnode,this.addCssClass);
      }
    },
    isVisible:function(){
      return $(this.domnode).is(':visible');
    },
    onInitLoadsFailed:function(){
      
    }
  },{
    fetchCss:function(){
      if(this.hasCss){
        var url=this.url.replace(/js$/,"css");
        ssys.getCss(url);
      }
    },
    create:function(parent,name,params){
      var o=new this;
      o.parent=parent;
      o.app=parent.app;
      o.layout=o.app.layout;
      o.name=name;
      o.fullname=parent.fullname+"__"+name;
      o.params=params=params||[];
      var options=o.options=params[params.length-1];
      if(options&&options.tag){
        o.tag=options.tag;
      }
      //console.debug(o.fullname,"o.tag=",o.tag,"params=",params);
      var node0=document.getElementById(o.fullname);
      var domnode=document.createElement(o.tag);
      if(!node0){
        parent.stage.appendChild(domnode);
      }else{
        $$.moveDom(domnode,'self',node0);
      }
      domnode.id=o.fullname;
      o.domnode=domnode;
      o.renderStyle();
      o.logs=[];
      o.parent._currentShow[name]=o._currentShow={};
      parent.elements[name]=o;
      if(!o.initLoads&&!o.beforeInitLoads){
        o.init.apply(o,params);
      }else{
        if(o.beforeInitLoads){
          o.beforeInitLoads.apply(o,params);
        }
        var d=o._loadByConfigs(o.parseConfig(o.initLoads)).pipe(function(){
            if(o.onInitLoadsSucceed){
              o.onInitLoadsSucceed();
            }
            return o.init.apply(o,params);
        },function(){
          console.error(o.fullname,"initLoads失败了!");
          return o.onInitLoadsFailed();
        });
        /**
         * 防止在initLoads期间o.setState被调用了
         */
        o._setState=o.setState;
        o.setState=function(state,from,forceUnlock){
          //console.info(o.fullname,"正在initLoads过程中被调用setState,state=",state);
          return d.pipe(function(){
              o.setState=o._setState;
              //console.info(o.fullname,"已经完成了initLoads, 恢复了setState,state=",state);
            return o.setState(state,from,forceUnlock);
          });
        };
        
      }
      return o;
    },
    ex_DataBinding:{
      bindingDatas:[],
      getDataByPath:function(path){
        return this.app.getData(path);
      },
      remove:function(){
        this.parentCall('remove');
        for(var i=0,l=this.bindingDatas.length;i<l;i++){
          var data=this.bindingDatas[i];
          delete data.views[this.fullname];
        }
      },
      onDataChange:function(data){
        //console.debug(this.fullname,"onDataChange","data=",data);
        this.dataChanged=true;
        if(this.isVisible()){
          this.refresh();
        }else{
          var view=this;
          while(view.state!="-"&&view.parent){
            view=view.parent;
          }
          if(view!=this){
            view.outdatedElements[this.fullname]=this;
          }
        }

      },
      display:function(){
        if(this.dataChanged){
          this.refresh();
          this.dataChanged=false;
        }
        return this.parentCall('display');
      },
      afterInit:function(){
        for(var i=0,l=this.bindingDatas.length;i<l;i++){
          var name=this.bindingDatas[i];
          if(!this[name]){
            console.error(this.fullname,"数据绑定出错!它没有名为",name,"的data");
          }else if(!this[name].views){
            console.error(this.fullname,"数据绑定出错!名为",name,"的data没有views属性!this[name].views=",this[name].views);
          }
          this[name].views[this.fullname]=this;
        }
      }
      
    }/*,
    ex_Deferred:{
      init:function(){
        this.isLocked=true;
        this.stage=this.domnode;
        //console.info(this.fullname,"开始初始化","[$$.View.init]");
        //this.domnode.empty();
        this.addClass(this.cssClass);
        var d=this.beforeInit.apply(this,arguments);
        if(this.initInputDataConfigs){
          this.initInputDataConfigs=ssys.clone(this.initInputDataConfigs);
        }
        var _this=this;
        var initShow=this.initShow;
        if(initShow){
          if(d){
            this.initDfd=d.pipe(function(){
              if(_this.template){
                _this.html(_this.parseTemplate(_this.template));
              }
              //console.info(_this.fullname,"开始根据配置",initShow,"来初始化","[$$.View.init]");
              return _this.showByConfigs(_this.initShow);
            });
          }else{
            if(this.template){
              this.html(this.parseTemplate(this.template));
            }
            //console.info(this.fullname,"开始根据配置",initShow,"来初始化","[$$.View.init]");
            this.initDfd=this.showByConfigs(_this.initShow);
          }
        }else{
          if(this.template){
            this.html(this.parseTemplate(this.template));
          }
          this.initDfd=d||ssys.resolve();
        }
        var _arguments=arguments
        return this.initDfd=this.initDfd.pipe(function(){
          _this.afterInit.apply(_this,_arguments);
          //console.info(_this.fullname,"完成了初始化","[$$.View.init]");
          _this.state="start";
          _this.isLocked=false;
        });
      },
      onLogin:function(){
        if(this.initDfd.state()!="pending"){
          this._login();
        }else{
          var _this=this;
          this.initDfd.pipe(function(){
              _this._login();
          });
        }
      },
      showByConfigs:function(configs){
        //console.info(this.fullname,"开始按剧本",configs,"来在舞台",stage,"上表演","[$$.View.showByConfigs]");
        var d=ssys.resolve();
        var _this=this;
        return ssys.loopDefer(configs,null,function(config){
          return _this.showElement(config);
        },function(i,config){
          console.error(_this.fullname,"showByConfigs意外中止了!请检查配置",config,"是否正确.");
        });
      },
      showElement:function(name,state){
        if(this.isRefresh){
          delete this.elements[name];
        }
        var element=this.elements[name];
        if(!element){
          var elementConfig=this.getElementConfig(name);
          if(elementConfig){
            return this.createElement(name,elementConfig);
          }else{
            return ssys.reject(this.fullname,"的剧本上没找到",name,"元素的添加方法,不知道如何添加它!","[$$.View.showElement]");
          }
        }else{
          //console.info(this.fullname,"上已经存在名为",name,"的元素,无须再添加","[$$.View.showElement]");
          if(state=="-"){
            if(element.hide){
              return element.hide();
            }else{
              element.style.display="none";
              return ssys.resolve(element);
            }
          }
          if(element.setState){
            return element.setState(state);
          }else{
            return ssys.resolve(element);
          }
        }
      },
      show:function(state){
        var steps=$$.divide(state,"/");
        var firstStep=steps[0]||this.defaultState;
        var nextSteps=steps[1];
        var _this=this;
        var showConfigs=this.getShowConfigs(firstStep);
        var _this=this;
        var d=this.showByConfigs(showConfigs).pipe(function(){
            if(nextSteps){
              var steps=$$.divide(nextSteps,"/");
              var nextStep=steps[0];
              if(nextStep.match(/\./)){
                var tmp=$$.divide(nextStep,".");
                var elementName=tmp[0];
                if(!_this.elements[elementName]){
                  console.error(_this.fullname,"名为"+elementName+"的元素不存在!");
                }
                if(steps[1]){
                  nextSteps=tmp[1]+"/"+steps[1];
                }else{
                  nextSteps=tmp[1];
                }
              }else{
                var elementName=firstStep;
              }
            }else{
              var elementName=firstStep;
            }
            var element=_this.elements[elementName];
            if(element){
              if(element.setState){
                element.setState(nextSteps||'');
              }else if(nextSteps){
                console.error(_this.fullname,"名为"+elementName+"的元素没有setState 方法!所以无法继续表演:",nextSteps);
              }
            }
            return state;
        });
              
        return d.pipe(function(finalState){
          //console.info(_this.fullname,"的表演已经结束了,最终舞台定格在节目",finalState,"上","[$$.View.show]");
          return _this.afterShow(finalState);
        });
      }      
    }*/
},"View");

