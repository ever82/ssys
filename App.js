$$.App=$$.O.createSubclass({
    format:'json',
    rememberFor:30*24*3600000,//记住登录状态的时间长度,默认是1个月
    temp:{},//用来存放一些临时数据
    _$$:function(step){
      var matched;
      if(matched=step.match(/^r_(\w+)$/)){
        var resourceName=matched[1];
        return this.getResource(resourceName);
      }else if(matched=step.match(/^v_([\w:]+)$/)){
        var viewPath=matched[1].replace(/:/g,"/");
        return this.getPage(viewPath);
      }else if(matched=step.match(/^l_([\w:]+)$/)){
        var libPath=matched[1].replace(/:/g,"/");
        return this.getLib(libPath);
      }else{
        console.error(this,"无法读取step",step,"!");
        return ssys.reject();
      }
    },
    baseUrl:'',
    init:function(domnode){
      var _this=this;
      var domnode=domnode||document.body.appendChild(document.createElement('div'));
      //_this.getAppModel().pipe(function(){
      this.createCurrentUser();
      _this.setLayout(domnode);
      $('body').on("click", "a.ssysLink,.ssysButton", function(e){
          e.preventDefault();
          e.stopPropagation();
          var layout=_this.layout;
          if(layout.preventClick=="confirm"){
            var r=confirm("正在自动播放页面, 你的手动操作会导致播放中断, 你确定要继续吗?");
            if(r==false){
              return;
            }else{
              layout.stop();
            }
          }/*else if(layout.preventClick=="interrupt"){
            
          }else if(layout.preventClick=="forbit"){
            
          }*/
          var a=$(this);
          ssys.preloading=false;//这是用户点击的,肯定不是preload,防止某些preload失败卡住
          var parentView=_this.getParentView(a);
          var state=a.data('state');
          if(state===null||state===undefined){
            state=a.attr("name");
            if(state===null||state===undefined){
              state=a.attr("href");
            }
          }
          var forceUnlock=true;//这是用户点击的,应该拥有更高优先权
          if(a.data('warning')){
            var modal=$('<div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true"><div class="modal-dialog">    <div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>        <h4 class="modal-title" id="myModalLabel">注意</h4></div><div class="modal-body"><div class="alert alert-warning">'+a.data('warning')+'</div></div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">取消</button><button type="button" class="confirm btn btn-primary">确定</button></div></div></div></div>').modal({show:true});
            var confirmButton=modal.find('button.confirm').click(function(){
              modal.modal('hide');
              parentView.setState(state,{type:'confirm',element:a},forceUnlock);
            });
          }else{
            parentView.setState(state,{type:'click',element:a},forceUnlock);
          }
          /*if(url.charAt(0)=="#"){
            var parentView=_this.app.layout;
            parentView.isLocked=false;//这是用户点击的,应该拥有更高优先权
            parentView.setState(url);
          }else{
            var id=a.attr('id');
            var entries=id.split("__");
            var entry=entries.pop();
            var parentName=entries.join("__");
            var parentView=ssys.views[parentName];
            if(url.match(/^\[/)){
              var steps=JSON.parse(url);
              parentView.setState(steps);
            }else{
              var state=url;
              parentView.isLocked=false;//这是用户点击的,应该拥有更高优先权
              parentView.setState(state);
            }
          }*/
      });
      $('body').on("keyup",".ssysInput textarea",function(e){
        var domnode=$(this).parent();
        var view=_this.getViewByName(domnode.attr('id'));
        var max=view.max;
        if(max){
          var inputed=$(this).val().length;
          var left=max-inputed;
          if(left>=0){
            domnode.find('.textMax').html('还能再输入'+left+'个字');
          }else{
            domnode.find('.textMax').html('字数已经超过限制长度了,要减少'+(-left)+'个字');
          }
        }
        
      });
    },
    getParentView:function(domnode){
      if(!domnode.data('parentView')){
        var id=domnode.attr('id');
        if(id){
          var entries=id.split("__");
          var entry=entries.pop();
          var parentName=entries.join("__");
          var parentView=this.getViewByName(parentName);
        }else{
          parentView=this.layout;
        }
      }else{
        var parentView=domnode.data('parentView');
      }
      return parentView;
    },
    refresh:function(){
      /*this.layout=null;
      this.init();*/
      location.reload();
    },
    getSessionId:function(){
      var _this=this;
      this.sessionId=null;
      return this.get('ssys/getSessionId',{refresh:$.now()},true,"jsonp").pipe(function(sessionId){
        return _this.sessionId=sessionId;
      });
    },
    loadByConfigs:function(dataConfigs){
      var _this=this;
      //console.info(this.name,"开始loadByConfigs,dataConfigs=",dataConfigs);
      return ssys.asyncLoopDefer(dataConfigs,function(dataConfig){
          if(typeof dataConfig=="string"){
            var url=dataConfig;
            var params=null;
          }else{
            var url=dataConfig[0];
            var params=dataConfig[1];
          }
        return _this.get(url,params,true);
      },function(failed){
        console.error("loadByConfigs有"+failed+"个失败了!");
        return ssys.resolve();
      });
    },
    getAppModel:function(){
      var _this=this;
      return ssys.scenter.getResource('app').pipe(function(appResource){
        return appResource.getModelByAttributes({name:this.name}).pipe(function(model){
            _this.appModel=model;
            _this.appid=model.id;
        });
      });
    },
    getUrl:function(url,params){
      url=this.addFormat(url);
      if(params){
        url=ssys.addParams(url,params);
      }
      if(this.baseUrl){
        if(url.charAt(0)=="/"){
          url=url.substr(1);
        }
        url=this.baseUrl+url;
      }
      return url;
    },
    get:function(url,params,isData,crossDomainType){
      if(params){
        var uncache=params.refresh;
        url=this.getUrl(url,params);
      }else{
        var uncache=false;
        url=this.getUrl(url);
      }
      if(this.isWidget){
        if(isData){
          if(!crossDomainType){
            if(this.sessionId){
              url=ssys.addParams(url,{'PHPSESSID':this.sessionId});
            }
            var d=ssys.xhrget(url,true,uncache,true);
          }else{
            url=url.replace(".json",".jsonp");
            var d =ssys.getJsonp(url,true);
          }
        }else{
          var d=ssys.getJs(url);
        }
      }else{
        var d=ssys.xhrget(url,isData,uncache);
      }
      return d.pipe(function(result){
          if(result && result.error){
            return ssys.reject(result.error);
          }
          return result;
      });
    },
    addFormat:function(url,format){
      format=format||this.format;
      if(url.match(/\.\w+($|\?)/)){
        return url;
      }else{
        return url+"."+format;
      }
    },
    post:function(url,params,isData){
      url=this.baseUrl+url.substr(1);
      if(this.sessionId){
        url=ssys.addParams(url,{'PHPSESSID':this.sessionId});
      }
      return ssys.xhrpost(url,params,isData,this.isWidget);
    },
    
    getPageUrl:function(path){
      path=path.replace(/_p_/g,"/");
      var baseUrl=this.staticBaseUrl;
      return baseUrl+"pages/"+path+".js";
    },
    
    getLibUrl:function(path){
      if(path.charAt(0)=="#"){
        return ssys.staticBaseUrl+path.substr(1);
      }
      if(path.charAt(0)!="/"){
        var baseUrl=this.staticBaseUrl;
      }else{
        var parts=path.split(/^(\w+)\//);
        var appName=parts[1];
        path=parts[2];
        var baseUrl=ssys[appName].staticBaseUrl;
      }
      return baseUrl+"lib/"+path+".js";
      
    },
    getViewByName:function(fullname){
      var names=fullname.split("__");
      var view=this.layout;
      names.shift();
      for(var i=0,l=names.length;i<l;i++){
        var name=names[i];
        view=view.elements[name];
      }
      return view;
    },
    getPage:function(path){
      var page=this.pages[path];
      if(page){
        return ssys.resolve(page);
      }else{
        var url=this.getPageUrl(path);
        var _this=this;
        return $$.getJs(url).pipe(function(){
            var page=_this.pages[path];
            return page;
        },function(){
          console.error("加载页面url=",url,"失败了!");
        });
      }
    },
    getLib:function(path){
      var url=this.getLibUrl(path);
      var _this=this;
      return ssys.getJs(url);
    },
    
    getResource:function(name){
      var _this=this;
      var resource=this.resources[name];
      if(resource){
        //console.info(_this.name,"成功取得resource("+name+"):",resource,"[$$.App.getResource]");
        var dfd=ssys.resolve(this.resources[name]);
      }else{
        var url=this.staticBaseUrl+"resources/"+name+".js";
        var dfd=ssys.getJs(url).pipe(function(){
            return _this.resources[name];
            //console.info(_this.name,"成功取得resource("+name+"):",_this.resources[name],"[$$.App.getResource]");
        });
      }
      return dfd;
    },
    addPage:function(path,prototypeContent,staticContent,superClass,name){
      superClass=superClass||this.self.Page;
      var pageClass=superClass.createSubclass(prototypeContent,staticContent,name);
      pageClass.path=path;
      pageClass.url=this.getPageUrl(path);
      pageClass.fetchCss();
      //console.info(this.name,"成功获得pageClass("+path+"):",pageClass,"[$$.App.getPage]");
      return this.pages[path]=pageClass;
    },
    addLayoutClass:function(name,prototypeContent,staticContent){
      return this.addViewClass("layouts/"+name,prototypeContent,staticContent,SsysLayout);
    },
    addResource:function(name,params){
      return this.self.Resource.create(this,name,params);
    },
    createCurrentUser:function(){
      this.currentUser=$$.User.create(this);
    },
    setLayout:function(domnode){
      var layout=this.self.Layout.create(this,domnode);
      var state=layout.getStateByAnchor();
      layout.setState(state,{type:'setLayout'});
      return layout;
    },
    getData:function(path){
      var binding=this.dataBindings[path];
      if(binding){
        return binding.data;
      }
    },
    setData:function(data){
      var path=data.dataPath;
      if(path){
        var binding=this.dataBindings[path];
        if(!binding){
          this.bindingDatas[path]={data:data,views:[],path:path};
        }else{
          if(binding.data!=data){
            this.updateViews(binding,data);
          }
          binding.views.push(view);
        }
        
      }else{
        console.error("setData失败, 该data",data,"缺了dataPath!");
      }
    },
    bindData:function(dataPath,view,dataName){
      var binding=this.dataBindings[dataPath];
      if(!binding){
        binding=this.dataBindings[dataPath]={data:view[dataName],views:[view],path:dataPath};
        view.dataBindings[dataPath]={binding:binding,localName:dataName};
      }else{
        if(binding.data!=view[dataName]){
          binding.data=data;
          this.updateViews(binding);
        }
        binding.views.push(view);
      }
    },
    updateViews:function(binding){
      var views=binding.views;
      var data=binding.data;
      for(var i=0,l=views.length;i<l;i++){
        var v=views[i];
        var viewBinding=v.dataBindings[binding.path];
        var localName=viewBinding.localName;
        if(v[localName]!=data){
          v[localName]=data;
          v.update();
        }
      }
    }
    

  },{
    Layout:$$.View.createSubclass({
        mg_showConfigs:{
          index:['p_index']
        },
        mg_filterConfigRules:[
          [/^index|^p_([\w:]+)/,['page']]
        ],
        mg_elementConfigRules:[
          [/^p_([\w:]+)$/,['${app.pages.$1}']],
          [/^(\w+)/,['${app.resources.$1.ResourceView}']]
        ],
        filter_page:function(state){
          if(state=="index"){
            var page="index";
          }else{
            var matched=state.match(/^p_([\w:]+)/);
            var page=matched[1];
          }
          return this.app.getPage(page).pipe(function(){
            return state;
          },function(){
            if(page!='error'){
              return "p_error/"+state;
            }else{
              console.error("没有找到"+page+"页面!请检查/static/pages/"+page+".js文件");
            }
          });
        },
        getStateByAnchor:function(){
          var state=ssys.getAnchor();
          if(!state){
            state='';
          }
          return state;
        },
        afterShow:function(state){
          this.parentCall("afterShow",[state]);
          $$.setAnchor(state!="index"?state:'');
          return state;
        },
        /**
         * 登录后要做的页面更新
         */
        onLogin:function(){
          //this.app.refresh();
          var state=this.getLastState()||'';
          $(this.domnode).empty();
          this.app.layout=null;
          this.app.init();
          this.app.layout.setState(state);
        },
        onLogout:function(){
          this.app.refresh();
        }
      },{
        create:function(app,domnode){
          var o=new this;
          o.app=app;
          o.domnode=domnode;
          o.fullname=app.name;
          domnode.id=o.fullname;
          o.views={};
          o.elements={};
          o.outdatedElements={};
          o.logs=[];
          o._currentShow={};
          app.layout=o;
          if(!o.initLoads&&!o.beforeInitLoads){
            o.init();
          }else{
            if(o.beforeInitLoads){
              o.beforeInitLoads();
            }
            var d=o._loadByConfigs(o.parseConfig(o.initLoads)).pipe(function(){
                if(o.onInitLoadsSucceed){
                  o.onInitLoadsSucceed();
                }
                return o.init();
            },function(){
              console.error(o.fullname,"initLoads失败了!");
              return o.onInitLoadsFailed();
            });
            /**
             * 防止在initLoads期间o.setState被调用了
             */
            o._setState=o.setState;
            o.setState=function(state,from,forceUnlock){
              return d.pipe(function(){
                  o.setState=o._setState;
                return o.setState(state,from,forceUnlock);
              });
            };
            
          }
          //ssys.views[o.fullname]=o;
          return o;
        }
    }),
    Page:$$.View.createSubclass({
        style:'page'
    }),
    create:function(){
      var o=new this();
      o.pages={};                   
      o.resources={};
      o.dataBindings={};
      //console.info("成功创建了app("+name+")!","[$$.App.create]");
      return o;
    }

},"App");



