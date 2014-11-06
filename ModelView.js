$$.ModelView=$$.Resource.ModelView=$$.View.DataBinding.createSubclass({
    style:'ssysModelView',
    defaultState:'start',
    datas:{model:'model'},
    mg_elementConfigs:{
      content:['Div',[null,null,'${model.content}']],
      showDetailsLink:['IconLink',['showDetails','ellipsis-h','<strong>查看更多细节</strong>']],
      hideDetailsLink:['IconLink',['hideDetails','eye-slash','收起细节',['showDetailsLink','after']]],
      details:['Div',[['footer','before'],'well','${model.details}']],
      userLink:['UserLink',['${model.creator_id}','','small',null,'pull-left',null,'media-object']],
      titleLink:['TitleLink',['#userResource/${model.creator_id}','${model.creator_username}','#${fullname} .media-heading']],
      creatorLink:['TitleLink',['#userResource/${model.creator_id}','${model.creator_username}']],
      renew:['${archetype.modelViewClass.CreateView}',['${resourceView}','${archetype}']],
      renewButton:['Button',['renew','修改',{icon:'pencil',type:'warning',size:'sm'}],{hide:'${!model.isEditable()}'}],
      editLink:['Link',['edit','编辑',{icon:'pencil',cssClass:'${editLinkCssClass}'}],{hide:'${!model.isEditable()}'}],
      uneditLink:['TitleLink',['unedit','取消编辑状态',null,'ssysUneditLink']],
      hideCommentsLink:['IconLink',['hideComments','comment','收起评论(${model.descendantcount})',null,'ssysHide']],
      commentsLink:['IconLink',['comments','comment-o','评论(${model.descendantcount})']],
      comments:['app/r_comment/view/subjectComments/ascComments',['${this}']],
      create:['CreateView']
    },
    mg_showConfigRules:[
      [/^$|^index/,['$l{resource.name}${model.id}']]
    ],
    mg_showConfigs:{
      hideComments:[null,'hideComments'],
      edit:[null,'edit'],
      unedit:[null,'unedit']
    },
    beforeInit:function(model){
      if(typeof model!="object"){
        model=this.resource.models[model];
      }
      this.model=model;
      return this._beforeInit();
    },
    _beforeInit:function(){
      
    },
    showDetails:function(){
      if(!this.elements.details){
        this.showByConfigs(['details','hideDetailsLink']);
      }else{
        this.showElements(['details','hideDetailsLink']);
      }
      this.elements.showDetailsLink.hide();
    },
    hideDetails:function(){
      this.hideElements(['details','hideDetailsLink']);
      this.showElements(['showDetailsLink']);
    },
    get_showedDetails:function(){
      if(!this.model.details){
        return '';
      }else{
        return '<div id="${fullname}__details" class="alert alert-info col-md-11">${model.details}</div>';
      }
    },
    get_detailsConfig:function(){
      if(!this.model.details){
        return '<a id="${fullname}__showDetailsLink" class="showDetailsLink hidden"></a>';
      }else{
        return '<a id="${fullname}__showDetailsLink" class="showDetailsLink"></a>';
      }
    },
    commentsToggler:'<a id="${fullname}__commentsLink" href="comments" class="ssysLink"><span class="fa fa-comment-o">评论(${model.descendantcount})</a><a id="${fullname}__hideCommentsLink" href="hideComments" class="ssysLink ssysHide"><span class="fa fa-comment"></span>隐藏评论(${model.descendantcount})</a>',
    get_renewButtonConfig:function(){
      if(this.isEditable){
        return '<button id="${fullname}__renewButton"></button>';
      }else{
        return '<button id="${fullname}__renewButton" class="ssysHide"></button>';
      }
    },
    filter_edit:function(state){
      this.addClass('ssysEditing');
      this.elements.editLink.hide();
      this.elements.uneditLink.show();
      return '';
    },
    filter_unedit:function(state){
      this.removeClass('ssysEditing');
      this.elements.uneditLink.hide();
      this.elements.editLink.show();
      return '';
    },
    filter_renew:function(state){
      if(!this.archetype){
        this.archetype=this.model.createArchetype();
      }
      return state;
    },
    after_comments:function(){
      var commentsLink=$('#'+this.fullname+'__commentsLink');
      var hideCommentsLink=$('#'+this.fullname+'__hideCommentsLink');
      if(commentsLink){
        hideCommentsLink.show();
        commentsLink.hide();
      }      
      if(!this.elements.comments){
        this.showByConfig('comments');
      }else{
        this.elements.comments.domnode.show();
      }
    },
    hideComments:function(){
      var commentsLink=$('#'+this.fullname+'__commentsLink');
      var hideCommentsLink=$('#'+this.fullname+'__hideCommentsLink');
      hideCommentsLink.hide();
      commentsLink.show();
      this.elements.comments.domnode.hide();
      this.state="hideComments";
    },
    getCreatorLabel:function(){
      var creatorid=this.model.creator_id;
      var currentUserid=this.app.currentUser.userModel?this.app.currentUser.userModel.id:'';
      if(creatorid==currentUserid){
        return "我";
      }else{
        return this.model.creator_username;
      }
    },
    /**
     * 将被implement,用来放保存了单个属性更新之后的逻辑
     */
    afterSave:function(){
      
    }
    
},{
    ex_ListItem:{
      affectParent:false,  
      defaultState:'start',
      tag:'li',
      style:'ssysModelView list-group-item',
      beforeInit:function(page,index){
        page=parseInt(page);
        index=parseInt(index);
        var collection=this.collection=this.parent.collection;
        if(collection){
          this.model=this.collection.getModel(page,index);
        }else{
          console.error(this.fullname,"的collection不存在!");
        }
        this.page=page;
        this.index=(page-1)*collection.limit+index+1;
        return this._beforeInit();
      }
    }
  
},"ModelView");
