pandingbao.addResource("user",{
    getMoralStars:function(){
      return this.Collection.create({order:"weight DESC,verdict_count DESC",limit:5});
    },
    getVerdictStars:function(){
      return this.Collection.create({order:"verdict_count DESC,weight DESC",limit:5});
    },
    xp_Model:[{
      attris:['id','username','agent_id','agent_username','role','registerip','created_at','checked_at','login_at','logout_at','has_photo','weight' ,'points','verdict_count','sample_count','fa_count','shang_count','fa_amount','shang_amount','plaintiff_count','defendant_count','reconciled_count','fulfilled_count'],
      validationRules:{
        username:['String',{isUnique:true,isNull:false,max:30}],
        email:['Email']
      },
      creationParams:['username','email','password'],
      init:function(){
        if(!this.has_photo){
          this.photoSrc=this.app.staticBaseUrl+"img/single_photo/100.jpg";
          this.smallPhotoSrc=this.app.staticBaseUrl+"img/single_photo/100.jpg";
        }else{
          this.photoSrc=this.app.storageBaseUrl+"photos/"+this.id;
          this.smallPhotoSrc=this.app.storageBaseUrl+"photos/small/"+this.id;
        }
      },
      relations:{
        //verdicts:['hasMany','app/r_verdict','creator_id'],
        verdicts:['manyAction','app/r_verdict','getUserVerdicts',{user_id:'${id}'}],
        comments:['hasMany','app/r_comment','creator_id'],
        parties:['hasMany','app/r_party','user_id'],
        apps:['hasMany','app/r_user','agent_id'],
        walues:['hasMany','app/r_walue','creator_id'],
        messages:['hasMany','app/r_message','receiver_id'],
        unreadMessages:['manyAction','app/r_message','getUnread'],
        groupKases:['hasMany','app/r_kase','group_id'],
        groupShangfas:['hasMany','app/r_shangfa','group_id'],
        groupShangs:['hasMany','app/r_shangfa','group_id',{ispunish:0}],
        groupFas:['hasMany','app/r_shangfa','group_id',{ispunish:1}],
        rates:['hasMany','app/r_rate','creator_id']
      },
      get_renpin:function(){
        return (this.weight*100).toFixed(2);
      },
      getScenterUser:function(){
        var _this=this;
        return ssys.dfdget(this.scenterUser,function(){
          return ssys.scenter.getResource("user").pipe(function(userResource){
            return userResource.getModelByAction("getItemBySockpuppet",{ sockpuppetname:_this.username,appid:_this.app.appid}).pipe(function(user){
              return _this.scenterUser=user;
            });
          });
        });
      },
      getUserRelation:function(){
        var currentUser=this.app.currentUser;
        if(this.userRelation===undefined){
          if(currentUser.isGuest){
            var relation='guest';
          }else if(currentUser.id==this.creator_id){
            var relation='creator';
          }else if(this.id==currentUser.id){
            var relation="me";
          }else if(currentUser.userModel.role=='admin'){
            var relation='admin';
          }else{
            var relation=this._getUserRelation(currentUser);
          }
          this.userRelation=relation;
        }
       return this.userRelation;
      }
    },{
      
    }],
    xp_Collection:{},
    xp_ResourceView:{
      get_title:function(){
        var state=this.settingState;
        if(state.match(/^\d+/)){
          return '详细资料';
        }
        
      },
      mg_filterConfigs:{
        create:[]
      },
      mg_filterConfigRules:[
        [/^(\d+)$/,['model']]
      ],
      filter_model:function(state){
        if(state==this.app.currentUser.id){
          return $$.reject('#p_session');
        }
      }
    },
    xp_CollectionView:[{
    },{
      ex_admin:{
        mg_elementConfigs:{
          deleteButton:['Button',['delete',null,'删除勾选的用户',null,'text-center',null,'danger',null,"你确定要删除吗?"]],
          dataTable:['ResourceDataTable',['${columnConfigs}']]
        },
        columnConfigs: [
          ["名称","username","ModelLink"],
          //["认为最应该赏(罚)","id","Template","${bestX}元"],
          //["认为不能小于","id","Template","${minX}元"],
          //["认为不能大于","id","Template","${maxX}元"],
          ["注册时间","created_at","Time"],
          ["注册IP","ip"],
          ["勾选","id","Checkbox","checkUser","10%"]
        ],
        indexShow:['dataTable','deleteButton'],
        afterInit:function(){
          this.checkedUsers={};
        },
        checkUser:function(target,user){       
          if(target.checked){
              this.checkedUsers[user.id]=user;
          }else{
              delete this.checkedUsers[user.id];
          }
        },
        filter_delete:function(){
          var userIds=$.map(this.checkedUsers,function(value){return value.id;});
          if(userIds.length==0){
            alert("你没有勾选要删除的用户");
            return ssys.reject("index");
          }
          return this.app.resources.user.deleteAll(userIds).pipe(function(){
              alert("已经成功删除了你所勾选的"+userIds.length+"个用户");
            return ssys.reject("refresh/index");
          },function(){
            alert("可能因为网络原因, 删除失败了, 请再试一次");
            return ssys.reject("index");
          });
        }
        
      },
      ex_MoralStars:{
        style:'info',
        title:'评判权重排行榜'
      },
      ex_VerdictStars:{
        title:'评审次数排行榜'
      }
    }],
    xp_ModelView:[{
      addCssClass:'media',
      template:'<div class="media-body"><h3 class="media-heading"></h3></div>',
      links:[['#verdict/ofUser${model.id}','判定了${model.verdict_count}次','gavel'],['#kase/plaintiffIsUser${model.id}','投诉了${model.plaintiff_count}次','folder-o'],['#kase/defendantIsUser${model.id}','被投诉了${model.defendant_count}次','folder']],
      mg_elementConfigs:{
        userLink:['UserLink',['${model.id}','${model.username}',{state:'photoUploader/upload'}],{wrapper:'<div class="jumbotron text-center">{{}}</div>'}],
        messageButton:['Button',['#message/withUser${model.id}','发消息',{type:'success'}],{cssClass:'col-xs-12'}],
        linkList:['Loop',{datas:'${links}',element:['Link',['$~{i~0}','<div class="pull-left media-left"><span class="fa fa-$~{i~2}"></span></div><div class="media-body">$~{i~1}</div>'],{cssClass:'list-group-item media'}]},{cssClass:'list-group'}]
      },
      initShow:['userLink','linkList','messageButton']
    },{
      ex_Me:{
        links:[['#verdict/ofUser${model.id}','判定了${model.verdict_count}次','gavel'],['#kase/plaintiffIsUser${model.id}','投诉了${model.plaintiff_count}次','folder-o'],['#kase/defendantIsUser${model.id}','被投诉了${model.defendant_count}次','folder'],['#p_session/logout','退出该账号','power-off']],
        mg_elementConfigs:{
          photoUploader:['Uploader',{
            url:'${app.baseUrl}uploader/uploadPhoto.php',
            afterUpload:"afterUploadPhoto"
          },{cssClass:'hidden'}]
        },
        initLoads:{
          Uploader:'js:$$view/Uploader.js'
        },
        initShow:['userLink','photoUploader',"linkList"],
        beforeInit:function(){
          this.parentCall('beforeInit',this.params);
          this.model=this.app.currentUser.userModel;
        },
        afterUploadPhoto:function(){
          this.find(".userLink img").attr("src",this.app.storageBaseUrl+"photos/"+this.model.id+"?uploadtime="+$.now());
        }
      },
      ex_ListItem:[{
        mg_elementConfigs:{
          userLink:['UserLink',['${model.id}','',{version:'small',imgClass:'pull-left',style:'media-object'}],['before','.media-body']],
          titleLink:['Link',['#user/${model.id}','${model.username} <span class="badge pull-right">${index}</span>'],'.media-heading']
        },
        initShow:['userLink','titleLink']
      },{
        ex_MoralStar:{
          template:'${e~userLink}<div class="media-body"><h4 class="media-heading">${e~titleLink}</h4>评判权重:${model.renpin}分</div>'
        },
        ex_VerdictStar:{
          template:'<div class="media-body"><h4 class="media-heading"></h4>评审次数:${model.verdict_count}次</div>'
        }
      }]
    }],
    xp_CreateView:[{
      style:'create form col-sm-4 col-sm-offset-4',
      mg_elementConfigs:{
        pageHeader:['Html',['<div class="page-header"><h3>注册<span class="pull-right"><small >已有判定宝账号?<a href="#p_session/login">登录</a></small></span></h3></div>']],
        emailInput:["StringInput",[{icon:"envelope",placeholder:"请输入邮箱"}]],
        usernameInput:["StringInput",[{icon:"user",placeholder:"请输入用户名",errors:{notUnique:'该用户名已经有人使用了,请换一个'}}]],
        passwordInput:["PasswordInput"],
        termsLink:["Link",["#p_terms","判定宝服务条款",{icon:'caret-right'}],{wrapper:'<div style="padding:20px 0">{{}}</div>'}],
        descriptionInput:['TextInput',['个人签名',null,null,500]],
        saveButton:["Button",['save','同意并注册',{type:'primary',size:'bg',cssClass:'col-xs-12'}]],
        finish:['Div',['${domnode}']]
      },
      initShow:['pageHeader','emailInput','usernameInput','passwordInput','termsLink','saveButton'],
      filter_save:function(){
        var _this=this;
        var model=this.model;
        //console.debug("in filter_save","model=",model);
        var inputs=this.updateInputData();
        this.setInputsToModel(inputs);
        return model.save().pipe(function(model){
            _this.model=model;
            _this.app.currentUser.loginByUserModel(model,false,true);
            //_this.app.currentUser.login(inputs.username,inputs.password,false,true);
            return _this.app.layout.setState("");
            /*return _this.app.currentUser.getCurrentUser().pipe(function(){
              
            });login(inputs.username,inputs.password);.pipe(function(){
              _this.app.layout.setState("");
            });*/
        },function(errors){
          //console.debug("有这些输入错误","errors=",errors);
          _this.showErrors(errors);
        });
      }
    },{
    }]
    
});
