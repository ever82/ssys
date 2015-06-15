pandingbao.addResource("message",{
  xp_Model:{
      attris:['id','content','creator_id','creator_username','receiver_id','receiver_username','created_at','updated_at','parent_id','subject_id','typename'],
      creationParams:['content','receiver_id','parent_id'],
      validationRules:{
        content:['String',{isNull:false,max:1000}]
      },
      get_contentToShow:function(){
        try{
          var content=JSON.parse(this.content);
        }catch(e){
          var content=this.content;
        }
        switch(this.typename){
          case 'Sue':
            var kase_id=content[0];
            var plaintiff=content[1];
            return '你被'+plaintiff+'投诉了!快到<a href="javascript:;" class="ssysLink" data-state="#kase/'+kase_id+'">这里</a>应诉吧';
          case 'CreateKase':
            var kase_id=content[0];
            var defendant=content[1];
            return '你投诉了'+defendant+'. 下一步需要你做的事情有两件:1)到<a href="javascript:;" class="ssysLink" data-state="#kase/'+kase_id+'">这里</a>添加证据. 2)去通知对方来应诉. 如果对方拒绝来应诉, 也请将对方拒绝应诉的聊天记录添加到证据中来. '
          case 'AddFact':
            var kase_id=content[0];
            var creator=content[1];
            return creator+'添加了新证据. 到<a href="javascript:;" class="ssysLink" data-state="#kase/'+kase_id+'">这里</a>查看';
          case 'PlaintiffReady':
            var kase_id=content[0];
            var plaintiff=content[1];
            var defendant=content[2];
            var currentUser=this.app.currentUser.username;
            if(currentUser==plaintiff){
              return '对于<a href="javascript:;" class="ssysLink" data-state="#kase/'+kase_id+'">该投诉</a>, 你已经添加完了证据, 接下来只需等待3个工作日内"'+defendant+'"把证据添加完, 就可以开始判定了';
            }else{
              return '对于<a href="javascript:;" class="ssysLink" data-state="#kase/'+kase_id+'">该投诉</a>, "'+plaintiff+'"已经添加完了证据, 请你务必在3个工作日内把证据添加完, 就可以开始判定了';
            }
          case 'DefendantReady':
            var kase_id=content[0];
            var plaintiff=content[1];
            var defendant=content[2];
            var currentUser=this.app.currentUser.username;
            if(currentUser==defendant){
              return '对于<a href="javascript:;" class="ssysLink" data-state="#kase/'+kase_id+'">该投诉</a>, 你已经添加完了证据, 接下来只需等待5个工作日内"'+plaintiff+'"把证据添加完, 就可以开始判定了';
            }else{
              return '对于<a href="javascript:;" class="ssysLink" data-state="#kase/'+kase_id+'">该投诉</a>, "'+defendant+'"已经添加完了证据, 请你务必在3个工作日内把证据添加完, 就可以开始判定了';
            }
          case 'BeginVerdict':
            var kase_id=content[0];
            var plaintiff=content[1];
            var defendant=content[2];
            var currentUser=this.app.currentUser.username;
            return '对<a href="javascript:;" class="ssysLink" data-state="#kase/'+kase_id+'">该投诉</a>的判定开始了, 当系统收集到60个评审员的判定时, 就会公开判定结果.';
          case 'Sample':
            var kase_id=content;
            return '你被系统随机选中了作为<a href="javascript:;" class="ssysLink" data-state="#kase/'+kase_id+'">第'+kase_id+'号投诉</a>的评判员, 可以去参与评判. ';
          default:
            return this.content;
        }
      }
  },
  xp_Collection:{},
  xp_ResourceView:[{
      get_title:function(){
        var state=this.settingState;
        if(state.match(/^withUser(\d+)/)){
          return this.receiver.username;
        }
      },
      mg_elementConfigRules:[
        [/^withUser(\d+)/,['${cl~message.Conversation}','$1']]
      ],
      mg_loadConfigRules:[
        [/^withUser(\d+)/,{receiver:'user/$1'}]
      ]
  },{
  }],
  xp_CollectionView:[{
  },{
    ex_MyMessages:{
      noPanelHead:true,
      collectionParams:{attris:{receiver_id:'${app.currentUser.id}'},order:'id DESC'},
      after_1:function(){
        console.debug("after_1");
        var d = new Date();
        var user=this.app.currentUser.userModel;
        this.checked_at = user.checked_at;
        user.checked_at = parseInt(d.getTime()/1000);
        var _this=this;
        user.save().pipe(function(){
          _this.app.layout.showUnread(0);
        });      

      }
    },
    ex_Conversation:{
      addCssClass:'Conversation',
      mg_loadConfigs:{
        index:{user:'user/${userId}'}
      },
      noPanelHead:true,
      itemViewClassName:'ConversationMessage',
      collectionParams:{action:'conversation',params:{user_id:'${userId}'}},
      mg_elementConfigs:{
        creator:['${cr~message}',{receiver_id:'${userId}'},'footer/.navbar-middle'],
        footer:['Navbar',{},{cssClass:'navbar-default navbar-fixed-bottom'}]
      },
      beforeInitLoads:function(userId){
        this.userId=userId;
      },
      initShow:['footer','creator'],
      beforeRefresh:function(){
        this.domnode.innerHtml='';
      },
      after_1:function(){
        var _this=this;
        $$.loopDefer(this.find('.userLink'),null,function(node){
          //var r=$(node).parent().find('.replacement');
          //r[0].scrollIntoView(false);
          //r.hide();
          node[1].scrollIntoView();
          $(node).popover('show');
          return $$.delay(0.1);
        });
      }

    }
  }],
  xp_ModelView:[{
  },{
    ex_ListItem:[{
      mg_elementConfigs:{
        userLink:['UserLink',['${model.creator_id}','',{version:'small',imgClass:'media-object',cssClass:'media-${textAlign} pull-${textAlign}'}]],
        titleLink:['Link',['#user/${model.creator_id}','${model.creator_username} ']]
      },
      template:'${e~userLink}<div class="media-body"><h4 class="media-heading ">${e~titleLink}<small class="pull-${reTextAlign}">${datetime:model.created_at}</small></h4><div class="row"><span class="col-xs-11 ">${model.contentToShow}</span></div>',
      initShow:['userLink','titleLink']
    },{
        ex_MyMessage:{
        },
        ex_ConversationMessage:{
          //template:'${e~userLink}<div class="media-body replacement" style="visibility:hidden;"><h4 class=" "><small class="pull-${reTextAlign}">${datetime:model.created_at}</small></h4><div class="row"><span class="col-md-4 col-xs-10">${model.contentToShow}</span></div>',
          template:'${e~userLink}',
          beforeInit:function(page,index){
            this.parentCall('beforeInit',[page,index]);
            this.textAlign=this.model.creator_id==this.app.currentUser.id?'right':'left';
          },
          initShow:['userLink'],
          afterInit:function(){
            this.find('.userLink').popover({
            placement:this.get_reTextAlign(),
            viewport:{selector:"#"+this.fullname,padding:10},
            template:'<div class="popover"><div class="arrow"></div><div class="popover-content"></div></div>',
            title:'',
            html:true,
            content:'<h6><small>'+this.eval_datetime(this.model.created_at)+'</small></h6>'+this.model.get_contentToShow()});
          }
        }
    }]
  }],
  xp_CreateView:[{
      afterSaveState:'*',
      mg_elementConfigs:{
        contentInput:['TextInput',{autoheight:true,rows:1},{cssClass:'col-xs-10'}],
        saveButton:['Button',['finish','发送',{type:'success'}],{cssClass:'col-xs-2'}]
      },
      initShow:['contentInput','saveButton'],
      initLoads:{
        user:'user/${params.0.receiver_id}'
      }
  },{
  }]
});

