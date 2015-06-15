$$.App.createSubclass({
    name:'pandingbao'
},{
  xp_Page:{
    mg_elementConfigs:{
      topbar:['Navbar',{links:[['#','判定宝']],rightLinks:[['#kase/create','<span class="fa fa-edit" title="我要投诉"></span>']],selectable:false},{cssClass:'navbar-inverse navbar-fixed-top'}],
      innerTopbar:['Navbar',{links:[['../<','<span class="fa fa-arrow-left"></span>']],title:'${title}',selectable:false,cssClass:'text-center navbar-inverse navbar-fixed-top'}]
    }
  },
  xp_Layout:{
    style:'noise ui-widget-content',
    template:'',
    afterLoginState:'',
    mg_elementConfigs:{
      stage:["Html",['<div class="container"></div>']],
      navbar:["Navbar",{links:[['#',"<div ><span class='fa fa-home'></span></div><span >投诉</span>"],['#p_execution',"<div ><span class='fa fa-check'></span></div><span >执行</span>"],['#p_message',"<div ><span class='fa fa-comment-o'></span></div><span >消息</span>"],["#p_session","<div ><span class='fa fa-user'></span></div><span >我</span>"]]},{cssClass:"navbar-default navbar-fixed-bottom"}],
      footer:['Html',['<div class="container text-center"><p class="text-muted"><div><label>联系我们<label>:xxxx@xxxx</div><div><a href="http://www.miitbeian.gov.cn/" target="_blank">ICP备xxx号</a></div></p></div>']]
    },
    initShow:['navbar','stage'],
    mg_filterConfigRules:[
      [/^p_session\/login$/,["isGuest",'page']],
      [/^p_terms$/,["isGuest",'page']],
      [/^user\/create$/,["isGuest"]],
      [/^index|^p_([\w:]+)/,['logged','page']],
      [/.*/,["logged"]]
    ],
    filter_isGuest:function(state){
      if(this.app.currentUser.id){
        return ssys.reject("index");
      }else{
        return state;
      }
    },
    beforeInitLoads:function(){
      console.debug("beforeInitLoads","this.app.currentUser.id=",this.app.currentUser.id);
      if(this.app.currentUser.id){
        this.initLoads=$$.clone(this.initLoads||{});
        this.initLoads.unreadMessagesCount='message/getUnread.json?returnsum=1';
      }
    },
    beforeInit:function(){
      var _this=this;
      $(window).hashchange(function(){
          var state=_this.getStateByAnchor();
          if(state!=_this.state){
            _this.setState(state);
          }
      });
    },
    afterInit:function(){
      if(this.app.currentUser.id){
        this.intervalCheck(600);
        this.showUnread(this.unreadMessagesCount);
      }
    },
    showUnread:function(count){
      this.unreadMessagesCount=count;
      if(count){
        $('#pandingbao__link2').tooltip({title:this.unreadMessagesCount,trigger:'manual'}).tooltip('show');
      }else{
        $('#pandingbao__link2').tooltip('hide');
      }
    },
    intervalCheck:function(interval){
      var _this = this;
      this.intervalCheckTimer = ssys.delay(function(){
        _this.app.currentUser.userModel.$$("count__unreadMessages").pipe(function(count){
          _this.unreadMessagesCount=count||'';
        });
        _this.intervalCheck(interval);
      },interval);
      return this.intervalCheckTimer;
    },
    afterShow:function(state){
      this.parentCall('afterShow',[state]);
      if(state=='index'){
        state='';
      }
      var matched=state.match(/(^$|^p_session$|^p_message|^p_execution)/);
      if(matched){
        this.elements.navbar.activate(null,'#'+matched[1]);
      }else{
        this.hideElement('navbar');
      }
    },
    createPanel:function(name,title,body,type,location,cssClass){
      var html='<div class="panel panel-'+type+'"><div class="panel-heading"><h3 class="panel-title">'+title+'</h3></div><div class="panel-body">'+body+'</div></div>';
      return this.createHtml(name,html,location);
    },
    /**
     * options包括version,cssClass,tooltip,imgClass
     */
    createUserLink:function(name,userId,username,options){
      options=options||{};
      var url=options.state===undefined?("#user/"+userId):options.state;
      var version=options.version||'';
      var src=this.app.storageBaseUrl+"photos/"+(version?version+"/":'')+userId;
      var _this=this;
      var html="<a href='javascript:;' data-state='"+url+"' title='"+(options.tooltip||'')+"' class='ssysLink userLink "+version+"UserLink "+(options.cssClass||'')+"'><img src='"+src+"' class='"+(options.imgClass||'')+"' /><span>"+username+"</span></a>";
      var link=this.createHtml(name,html);
      $('.userLink img').one("error",function(){
         $(this).attr('src',_this.app.staticBaseUrl+"img/single_photo/150.gif");
      });
      return link;
    }

  },
  xp_Resource:[{},{
    xp_Model:{
      validateMoney:function(attributeName,data){
        var n=this.decimalPlaces(data);
        if(n>2){
          return {name:attributeName,error:"最多只能输入两位小数!你输入了"+n+"位."};
        }
      },
      decimalPlaces:function(num) {
        var match = (''+num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
        if (!match) { return 0; }
        return Math.max(
             0,
             // Number of digits right of decimal point.
             (match[1] ? match[1].length : 0)
             // Adjust for scientific notation.
             - (match[2] ? +match[2] : 0));
      }
    },
    xp_ModelView:[{
      mg_elementConfigs:{
        userLink:['UserLink',['${model.creator_id}','${model.creator_username}',{version:'small',imgClass:'media-object',cssClass:'pull-${textAlign} media-${textAlign}'}]],
        titleLink:['Link',['#user/${model.creator_id}','${model.creator_username}']]
      }
    },{
      ex_ListItem:{
        template:'${e~userLink}<div class="media-body"><h4 class="media-heading ">${e~titleLink}<small class="pull-right">${datetime:model.created_at}</small></h4><div class="row"><span class="text-info col-md-8">${model.content}</span></div>',
        mg_elementConfigs:{
          
        }
      }
    }],
    xp_ResourceView:{
      backState:'../<',
      initShow:['@topbar'],
      mg_elementConfigs:{
        topbar:['Navbar',{links:[['${backState}','<span class="fa fa-arrow-left"></span>']],title:'${title}',selectable:false,cssClass:'text-center navbar-inverse navbar-fixed-top'}]
      }
    },
    xp_CollectionView:{
      beforeInit:function(){
        this.parentCall('beforeInit');
        this.ItemView=this.getItemViewClass();
        if(this.sum==0){
          if(this.emptyInfo){
            this.initShow=['emptyInfo'];
          }
        }
      }
    },
    xp_CreateView:{
      backState:'lastStep',
      backWarning:'',
      mg_elementConfigs:{
        topbar:['Navbar',{links:[['${backState}','<span class="fa fa-arrow-left"></span>','${backWarning}']],selectable:false,title:'${title}',cssClass:'text-center navbar-inverse navbar-fixed-top'},{location:['before','stage']}],
        nextButton:["Button",['nextStep','下一步',{type:'success'}],{location:'topbar/.navbar-right',wrapper:'<li style="line-height:35px;">{{}}</li>'}],
        saveButton:['Button',["finish","完成",{type:'success'}],{location:'topbar/.navbar-right',wrapper:'<li style="line-height:35px;">{{}}</li>'}],
        pageHeader:['Html','<h3 class="page-header"><small> <span class="badge">${currentStep}</span>${subTitle}</small></h3>',{location:['after','topbar']}],
        lastButton:["Button",['lastStep','上一步']]
      }
    }
  }]
},"Pandingbao");
window.pandingbao=$$.App.Pandingbao.create();

//ssys.pandingbao=SsysClient.create("http://dagonglu.sinaapp.com/","pandingbao","http://pangdingbao.com/sres/apps/pandingbao/","http://dagonglu-upload.stor.sinaapp.com/");

