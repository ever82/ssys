$$.View=$$.O.createSubclass(
  {
    tag:'Div',
    pullClass:'pull-left',
    steps:[],
    /**
     * 如果为真,表示当它改变状态时其父view的状态也会改变,
     * 如果为假,则不会
     */
    affectParent:false,
    preventClick:'accept',
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
    initLoadConfig:null,
    init:function(){
      this.isLocked=true;
      this._baseShow={};
      this._currentShow={};
      this.elements={};
      this.domnode.innerHTML='';
      //console.debug(this.fullname,"开始初始化,this.beforeInit",this.beforeInit,"[$$.View.init]");
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
    "eval":function(path){
      var matched;
      /**
       * @rule 使用 ${xx:...} 的方式处理特殊的eval, 比如 eval_date, eval_datetime
       */
      if(matched=path.match(/^((\!)|(\w+):)(.+)$/)){
        var method=matched[3]||matched[2];
        if(method=="!"){
          return !(this.eval(matched[4]));
        }
        return this["eval_"+method](this.eval(matched[4]));
      }
      /**
       * @rule 使用${xx~...}的方式处理缩略表达
       */
      if(matched=path.match(/(\w+)~(\w+)(\..+)?$/)){
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
            console.error(this.fullname,"无法识别前缀",matched[1],"!");
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
      return $(this.domnode).find(query);
    },
    children:function(query){
      return $(this.domnode).children(query);
    },
    addClass:function(cssClass){
      return $(this.domnode).addClass(cssClass);
    },
    removeClass:function(cssClass){
      return $(this.domnode).removeClass(cssClass);
    },
    setStates:function(states){
      var _this=this;
      return ssys.loopDefer(states,null,function(state){
        return _this.setState(state);
      },function(i,state){
        console.error(_this.fullname,"setStates在第",i,"步setState(",state,")时出错了!");
      });
    },
    /**
     * @param string|array|number
     */
    setState:function(state,forceUnlock){
      //console.info(this.fullname,"开始换节目了,要演出的节目是",state,"当前演出的是",this.state,"[$$.View.setState]");
      state=state||this.defaultState;
      if(typeof state=="string"){
        if(typeof this[state]=="function"&&!this["filter_"+state]){
          return this[state]();
        }else if(state.match(/,/)){
          var states=state.split(',');
          return this.setStates(states);
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
          return subjectView.setState(newState,forceUnlock);
        }else{
          return this.setStates(state,forceUnlock);
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
      }
      if(forceUnlock){
        this.isLocked=false;
      }
      if(!this.isRefresh&&(this.state===state||this.isLocked||(state===this.defaultState&&this.state===''))){
        /*if(this.isLocked){
          //console.info(this.fullname,"正在表演",this.state,"已经被锁定了,不能中途换成节目",state,"[$$.View.setState]");
        }else{
          //console.info(this.fullname,"已经在表演",this.state,"跟要换成的节目",state,"是一样的,所以无须再换了,[$$.View.setState]");
        }*/
        return ssys.resolve(this.state);
      }
      //console.debug("","state=",state);
      if(state.match(/\$\{/)){
        state=this.parseConfig(state);
      }
      //console.debug("","state=",state);
      var entries=state.split("/");
      var entry=entries.shift();
      if(entry=='..'){
        return this.parent.setState(entries.join("/"),forceUnlock);
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
        return this.app.layout.setState(state.substr(1),forceUnlock);
      }
      
      var _this=this;
      _this.isLocked=true;
      var d=_this.closeState(state)||$$.resolve();
      if(!d.pipe){
        d=$$.resolve(d);
      }
      return d.pipe(function(){
        return _this.loadByConfigs(state).pipe(function(){
          return _this.filterState(state).pipe(
            function(filteredState){
                return _this.setStateDfd=_this.show(filteredState).pipe(function(showedState){
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
                return _this.setState(filteredState);
              }
            });
        });
      },function(error){
        _this.isLocked=false;
        console.error(_this.fullname,"closeState失败了!this.state=",_this.state);
      });

    },
    hide:function(){
      console.debug(this.fullname,"hiding");
      this.domnode.style.display="none";
      this.hidingState=this.state;
      this._currentShow.state=this.state="-";
      this.parent._currentShow[this.name]=false;
      return ssys.resolve("-");
    },
    display:function(){
      console.debug(this.fullname,"display");
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
        var d=ssys.loopDefer(filters,state,function(filter,state){
          //console.debug(_this.fullname,"检测filter","filter=",filter,"state=",state);
          var matched;
          if(matched=filter.match(/^to__(.+)$/)){
            var filteredState=matched[1];
            //这时filter就是filteredState
            var d=ssys.resolve(filteredState);
          }else{
            var d=_this["filter_"+filter](state);
            if(!d.pipe){
              if(d===false){
                //如果返回的是false,就表示没通过filter
                d=ssys.reject();
              }else{
                d=ssys.resolve(d);
              }
            }
          }
          return d;
        },function(i,filter,filteredState){
          console.error(_this.fullname,"filterState时在第",i,"步filter为",filter,"时出错了!返回结果是",filteredState,"filters=",filters);
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
      var steps=$$.divide(state,"/");
      var firstStep=steps[0]||this.defaultState;
      var nextSteps=steps[1];
      var showConfigs=this.getShowConfigs(firstStep);
      var d;
      var _this=this;
      this.showByConfigs(showConfigs);
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
          d=element.setState(nextSteps||'');
        }else if(nextSteps){
          console.error(_this.fullname,"名为"+elementName+"的元素没有setState 方法!所以无法继续表演:",nextSteps);
        }else{
          d=ssys.resolve();
        }
      }else{
        d=ssys.resolve();
      }
      return d.pipe(function(){
        //console.info(_this.fullname,"的表演已经结束了,最终舞台定格在节目",state,"上","[$$.View.show]");
        return _this.afterShow(state);
      });
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
      var nextShow={};
      var _currentShow=this._currentShow;
      var _baseShow=this._baseShow;
      for(var i=0,l=configs.length;i<l;i++){
        var config=configs[i];
        if(typeof config=="string"){
          var matched=config.match(/^(-)?([^.]+)(\.(.*))?$/);
        }else{
          console.error(this.fullname,"的showConfigs",configs,"中的config=",config,"有误!config只能是string");
        }
        if(!matched){
          console.error(this.fullname,"showConfigs",configs,"中的config=",config,"有误!形式不匹配");
        }
        var elementName=matched[2];
        var hide=matched[1];
        if(hide){
          var state=hide;
        }else{
          var state=matched[4];
          if(state===undefined){
            state='start';
          }
        }
        var elementCurrentShow=_currentShow[elementName];
        //如果该元素已经存在并且state相同, 或者元素未存在而在当前config中需要隐藏它时, 都不需要在下一步显示中去处理, 除了这两种情况外都需要在下一步显示中处理
        if(!((elementCurrentShow&&elementCurrentShow.state==state)||(!elementCurrentShow&&hide))){
          nextShow[elementName]={state:state};
        }
      }
      for(var elementName in _currentShow){
        if(elementName=="state"){
          continue;
        }
        if(!nextShow[elementName]&&!_baseShow[elementName]){
          nextShow[elementName]={state:"-"};
        }
        if(_baseShow[elementName]&&!_currentShow[elementName]){
          nextShow[elementName]={state:"+"};
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
        this.showElement(elementName,config.state);
      }
      for(var name in this.locationConfigs){
        this.moveElement(name,this.locationConfigs[name]);
      }
      for(var name in this.wrapperConfigs){
        this.wrapElement(name,this.wrapperConfigs[name]);
      }
      
    },
    showElement:function(name,state){
      if(this.isRefresh){
        delete this.elements[name];
      }
      var element=this.elements[name];
      if(!element){
        var elementConfig=this.getElementConfig(name);
        if(elementConfig){
          element=this.createElement(name,elementConfig);
          if(!element){
            console.info(this.fullname,"的",name," element因为hide条件而不用创建");
            return ;
          }
        }else{
          return console.error(this.fullname,"的剧本上没找到",name,"元素的添加方法,不知道如何添加它!","[$$.View.showElement]");
        }
      }
      if(state=="-"){
        if(element.hide){
          element.hide();
        }else{
          element.style.display="none";
          this._currentShow[name]=false;
        }
      }else if(state=="+"){
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
          element.setState(state);
        }
      }else{
        element.style.display="";
        this._currentShow[name]=true;
      }
      return element;
    },
    getElementConfig:function(name){
      var elementConfig=this.elementConfigs[name];
      if(!elementConfig){
        elementConfigRules=this.elementConfigRules;
        for(var i=0,li=elementConfigRules.length;i<li;i++){
          var rule=elementConfigRules[i];
          var regex=rule[0];
          var result=name.match(regex);
          if(result){
            elementConfig=rule[1];
            if(typeof elementConfig=="function"){
              elementConfig=elementConfig.call(this,name);
            }
            break;
          }
        }
      }
      elementConfig=this.parseConfig(elementConfig,result);
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
        console.debug(this.fullname,"createElement ",name,"失败. 因为hide=",hide);
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
        //console.debug("在$$.View.showElement","element=",element);
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
        //console.debug("before element.setState","state=",state);
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
      console.debug("elementName=",elementName,"wrapper=",wrapper);
      var element=this.elements[elementName];
      var elementNode=element.domnode||element;
      wrapper=wrapper.replace("{{}}","<div id='"+elementNode.id+"_wrapper'></div>");
      elementNode.insertAdjacentHTML("beforebegin",wrapper);
      $$.moveDom(elementNode,"self",document.getElementById(elementNode.id+"_wrapper"));
    },
    parseTemplate:function(template){
      //console.debug("","template=",template);
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
        //console.info(this.fullname,"发现当前观众未登录,没能通过审查,将转去登录页面","[$$.View.filter_logged]");
        this.app.layout.afterLoginState=state;
        return ssys.reject("#p_session/login");
      }else{
        return ssys.resolve(state);
      }
    },
    refresh:function(state){
      //console.info(this.fullname,"开始刷新","this.params=",this.params,"state=",state);
      if(!state&&state!==''){
        state=this.state;
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
      this.init.apply(this,this.params||[]);
      return this.setState(state);
    },
    _update:function(state){
      return this.setState(state).pipe(function(state){
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
        //console.debug("hideElements","dom=",dom,"dom.css('display')=",dom.css('display'));
      }
    },
    hideElements:function(elements){
      for(var i=0,l=elements.length;i<l;i++){
        var elementName=elements[i];
        var element=this.elements[elementName];
        var dom=element.domnode||element;
        $(dom).hide();
        //console.debug("hideElements","dom=",dom,"dom.css('display')=",dom.css('display'));
      }
    },
    afterShow:function(state){
      var entry=this.stage.entry;
      var afterShow=this['after_'+entry];
      if(afterShow){
        //console.info(this.fullname,"的舞台已经摆上了元素,现在对这些元素进行后续处理","[$$.View.afterShow]");
        this['after_'+entry]();
      }
      this.logs.push(state);
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
      return this.setState(state);
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
      return this.setState(state);
    },
    getParentState:function(state){
      var entries=state.split(/\/\w+$/);
      if(entries.length==2){
        return entries[0];
      }else{
        return null;
      }
    },
    /**
     * @param string way 表示在配置中寻找到匹配的配置的方法,
     * 默认方法是"first",即第一个匹配的配置就是最终结果,
     * 还有方法"list",把所有匹配的结果放在一个数组里,
     * 还有方法"concat",跟list相似,不同的是有的单个匹配项会是数组,这时要concat
     * @param int configTypeIndex 表示配置类型在配置数组中的index,
     * 共有3种配置类型,它们在配置数组中的顺序为[show,labelAndTitle,accessControl]
     */
    getStateConfig:function(state,configType,way){
      //console.debug(this.fullname,"开始getStateConfig","state=",state,"configType=",configType,"way=",way);
      if(state===null){
        return null;
      }else if(state===''){
        state=this.defaultState;
      }
      
      var stateConfigValues;
      if(way=="list"||way=="concat"){
        stateConfigValues=[];
      }
      //这时configType是string,它是独立出来的配置
      var stateConfigs=this[configType+"Configs"]||{};
      var stateConfigRules=this[configType+"ConfigRules"];
      var stateConfigValue=stateConfigs[state];
      var matched=null;
      if(!stateConfigValue&&stateConfigRules){
        for(var i=0,l=stateConfigRules.length;i<l;i++){
          var rule=stateConfigRules[i];
          var regex=rule[0];
          matched=state.match(regex);
          if(matched){
            stateConfigValue=rule[1];
            if(stateConfigValue){
              break;
            }
          }
        }
      }
      if(stateConfigValue){
        return this.parseConfig(stateConfigValue,matched);
      }
    },
    getMatchedConfig:function(key,map,rules,way,configTypeIndex){
      //console.debug("in getMatchedConfig","key=",key,"rules=",rules);
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
            //console.debug("in initInputData","value=",value);
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
          //console.debug("检测inputElement","this.inputElements=",this.inputElements,"name=",name);
          if(element&& element.showErrors){
            element.showErrors(error);
          }else{
            var method=this["show"+name+"Error"];
            if(method){
              this["show"+name+"Error"](error);
            }else{
              //console.debug("before showError","error=",error,"name=",name);
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
      //console.debug("in showError","error=",error,"name=",name);
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
            return document.querySelector("#"+id+" "+cssPath);
          }else{
            return domnode;
          }
        }else{
          return document.querySelector("#"+this.fullname+" "+path);
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
    createHtml:function(name,html){
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
      return node;
    },
    createImage:function(name,src,options){
      options=options||{};
      var tooltip=options.tooltip||'';
      var html='<img src="'+src+'" class="img-responsive" alt="'+tooltip+'">';
      return this.createHtml(name,html);
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
      return this.createHtml(name,html);
    },
    /**
     * options包括cssClass,tooltip,icon,imgSrc,imgClass
     */
    createLink:function(name,state,title,options){
      options=options||{};
      var cssClass=(options.cssClass||'')+' ssysLink';
      if(options.icon){
        title="<span class='fa fa-"+options.icon+"'></span>"+(title||'');
      }else if(options.imgSrc){
        title="<img src='"+options.imgSrc+"' class='"+(options.imgClass||'')+"' ><span>"+(title||'')+"</span>"
      }
      var html="<a href='javascript:;' class='"+cssClass+"' data-state='"+state+"' title='"+(options.tooltip||'')+"'>"+title+"</a>";
      
      return this.createHtml(name,html);
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
      o.name=name;
      o.fullname=parent.fullname+"__"+name;
      o.params=params=params||[];
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
      o.elements={};
      o.outdatedElements={};
      o.logs=[];
      o.parent._currentShow[name]=o._currentShow={};
      parent.elements[name]=o;
      if(!o.initLoads){
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
        o.setState=function(state,forceUnlock){
          return d.pipe(function(){
              o.setState=o._setState;
            return o.setState(state,forceUnlock);
          });
        };
        
      }
      return o;
    },
    ex_DataBinding:{
      bindingConfigs:{},
      getDataByPath:function(path){
        return this.app.getData(path);
      },
      onDataChange:function(data){
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
      bindData:function(name,data){
        if(this.dataBindings[name]){
          console.error(this.fullname,"名为",name,"的data已经绑定过了,不能重复绑定!");
          return;
        }
        data=data||this.getDataByPath(this.bindingConfigs[name]);
        this.dataBindings[name]=data;
        data.views.push(this);
      },
      afterInit:function(){
        this.dataBindings={};
        for(var name in this.bindingConfigs){
          this.bindData(name);
        }
      }
      
    },
    ex_Deferred:{
      init:function(){
        this.isLocked=true;
        this.stage=this.domnode;
        //console.info(this.fullname,"开始初始化","[$$.View.init]");
        //console.debug("","this.initShow=",JSON.stringify(this.initShow));
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
        var steps=$$.separate(state,"/");
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
      /*createElement:function(name,elementConfig){
        //console.info(this.fullname,"已经找到",name,"元素的添加方法",elementConfig,"[$$.View.showElement]");
        elementConfig=elementConfig.slice(0);//为了不破坏原来的configs,在这里要克隆一下
        var elementType=elementConfig[0];
        var params=elementConfig[1]||[];
        var location=elementConfig[2];
        var _this=this;
        if(this["create"+elementType]){
          //console.info(this.fullname,"已找到生成元素",name,"的方法","create"+elementType,"调用该方法就可以了","[$$.View.showElement]");
          params.unshift(name);
          var d=ssys.resolve(this["create"+elementType].apply(this,params));
        }else{
          if(typeof elementType=='function'){
            var d=ssys.resolve(elementType);
          }else if(typeof elementType=='string'){
            var d=this.$$(elementType);
          }else{
            console.error(this.fullname,"无法识别元素种类(只能是string或function)",elementType,"无法生成名为"+name+"的element!");//this.$$("v_"+elementType);
            return ssys.reject();
          }
          d=d.pipe(function(elementClass){
              //console.info(_this.fullname,"已经找到元素",name,"的viewClass",elementClass,",用它生成实例就是该元素了","[$$.View.showElement]");
              return elementClass.create.apply(elementClass,[_this,name,params]);
              
          },function(error){
            console.error(_this.fullname,"没有找到元素",name,"的viewClass!error=",error);
          });
        }
        return d.pipe(function(element){
            //console.debug("在$$.View.showElement","element=",element);
            _this.elements[name]=element; 
            if(cssClass){
              element.domnode.addClass(cssClass);
            }
            //_this.moveElement(element,stage);
            if(element.setState){
              return element.initDfd.pipe(function(){
                  //如果该元素是个input元素, 就要检查它有没有初始值,
                  //如果有的话就设成初始值
                  var inputName=_this.getInputNameOfElement(name);
                  if(inputName){
                    element.domnode.attr('name',inputName);
                    if(_this.initInputDataConfigs){
                      var initValue=_this.initInputDataConfigs[inputName];
                      if(initValue){
                        element.setInputData(initValue);
                      }
                    }
                  }
                  //console.debug("before element.setState","state=",state);
                return element.setState(state);
              });
            }else{
              return element;
            }
        },function(){
          console.error(_this.fullname,"无法生成名为"+name+"的element!");
        });
        
      }*/
      
    }
},"View");

