pandingbao.addResource("fact",{
  collectionConfigs:{
  },
  xp_Model:[{
    attris:['id','kase_id','kase_name','content','has_image','has_refute_image','refutation','reliability','reliabilitycount','creator_id','creator_username','created_at','updated_at'],
    uneditable:['has_refute_image'],
    creationParams:['kase_id','content'],
    validationRules:{
      content:['String',{isNull:true,max:140}],
      refutation:['String',{isNull:true,max:140}]
    },
    relations:{
      kase:['belongTo','app/r_kase','kase_id'],        
      walueRates:['hasMany','app/r_rate','object_id',{ratetype:'Fact__walue'}],
      reliabilityRates:['hasMany','app/r_rate','object_id',{ratetype:'Fact__reliability'}],
      comments:['hasMany','app/r_comment','subject_id',{subjecttype:'Fact'}],
      evidences:['hasMany','app/r_evidence','fact_id'],
      intimates:['hasMany','app/r_comment','subject_id',{subjecttype:'Fact',branch_id:null}],
      branchComments:['hasMany','app/r_comment','subject_id',{subjecttype:'Fact',is_branch:1}]
    },
    get_imageSrc:function(){
      return this.app.storageBaseUrl+"/facts/img/"+this.id+(this.imageUpdatedAt?'?'+this.imageUpdatedAt:'');
    },
    get_refuteImageSrc:function(){
      return this.app.storageBaseUrl+"/facts/refute_img/"+this.id+(this.refuteImageUpdatedAt?'?'+this.refuteImageUpdatedAt:'');
    },
    get_kase:function(){
      return this.app.resources.kase.models[this.kase_id];
    },
    get_refuter:function(){
      return this.app.resources.user.models[this.get_refuter_id()];
    },
    get_refuter_id:function(){
      var kase=this.get_kase();
      var plaintiff_id=kase.creator_id;
      if(this.creator_id==plaintiff_id){
        return kase.defendant_id;
      }else{
        return plaintiff_id;
      }
    },
    refutable:function(){
      return !this.refuted()&&this.app.currentUser.id==this.get_refuter_id();
    },
    refuted:function(){
      return this.refutation||this.has_refute_image;
    },
    isEditable:function(attributeName){
      return !this.refuted()&&this.parentCall('isEditable',[attributeName]);
    }
    
  },{
    
  }],
  xp_Collection:{},
  xp_ResourceView:[{
  },{
  }],
  xp_CollectionView:[{
  },{
    ex_KaseFacts:[{
      title:"证据列表",
      template:'${head}${body}<ul e="list" class="list-group"></ul>${e~footer}',
      mg_elementConfigs:{
        footer:['Html',['<div class="panel-footer text-left"></div>']],
        terms:['Html',['<div class="well"><h4>添加证据须知:</h4><div><span class="badge">1</span> 最多只能添加5条证据</div><div><span class="badge">2</span> 如果没有更多的证据补充和修改, 请点击"完成"按钮</div><span class="badge">3</span> 当买卖双方证据都添加完毕时, 投诉会进入判定阶段,系统会随机抽取一批评判员开始对投诉进行判定</div></div>'],{location:'footer',hide:'${!canAddFact()}'}],
        info:['Html',['<h6>${info}</h6>'],{location:'footer'}],
        readyButton:['Button',['ready','完成(${collection.sum}/5)',{type:'success',size:'sm',warning:'你真的没有要补充的证据了吗?'}],{location:'#${parent.fullname}__topbar .navbar-right',hide:'${!canAddFact()}',wrapper:'<li>{{}}</li>'}],
        addFactButton:['Button',['../addFact','添加证据',{type:'primary'}],{cssClass:'col-xs-12',location:'footer',hide:'${!canAddFact()}'}]
      },
      initShow:["footer","terms","info","addFactButton","@readyButton"],
      collectionParams:{attris:{kase_id:"${kase.id}"}},
      beforeInitLoads:function(kase){
        this.kase=kase;
        this.userRelation=this.kase.getUserRelation();
      },
      beforeInit:function(){
        this.parentCall('beforeInit',this.params);
        this.left=5-this.sum;
      },
      ready:function(){
        var _this=this;
        this.kase.ready().pipe(function(kaseTuple){
          _this.kase.setTuple(kaseTuple);
          return _this.app.refresh();
        },function(){
          console.error(_this.fullname,"证据'添加完毕'操作失败!");
          //@Todo:增加错误提示
        });
      }
      
    },{
      ex_PlaintiffFacts:{
        style:'success',
        title:"买家证据",
        get_info:function(){
          if(this.kase.status.match(/addingFacts|defendantReady/)){
            if(this.sum==0){
              return '还未添加任何证据';
            }else{
              return '已经添加了'+this.sum+'条证据. 还可添加${left}条';
            }
          }else if(this.kase.status.match(/plaintiffReady/)){
            if(this.userRelation=="creator"){
              return '你已经添加完了证据(你仍然可以反驳对方的证据). 现在只等对方完成证据添加即可开始判定了.';
            }else if(this.userRelation=="defendant"){
              return '他已经添加完了证据(他仍然可以反驳你的证据). 现在只等你完成证据添加即可开始判定了.';
            }else{
              return '买家已经添加完了证据(他仍然可以反驳卖家的证据). 现在只等卖家完成证据添加即可开始判定了.';
            }
          }else{
            if(this.sum==0){
              return '没有添加任何证据';
            }else{
              return '共有'+this.sum+'条证据';
            }
          }
        },
        itemViewClassName:"KaseFact.PlaintiffFact",
        collectionParams:{attris:{kase_id:"${kase.id}",creator_id:"${kase.creator_id}"}},
        canAddFact:function(){
          return this.userRelation=="creator"&&this.kase.status.match(/addingFacts|defendantReady/);
        }
      },
      ex_DefendantFacts:{  
        style:'danger',
        title:"卖家证据",
        get_info:function(){
          if(this.kase.status.match(/addingFacts|plaintiffReady/)){
            if(this.sum==0){
              return '还未添加任何证据';
            }else{
              return '已经添加了'+this.sum+'条证据. 还可添加${left}条';
            }
          }else if(this.kase.status.match(/defendantReady/)){
            if(this.userRelation=="defendant"){
              return '你已经添加完了证据(你仍然可以反驳对方的证据). 现在只等对方完成证据添加即可开始判定了.';
            }else if(this.userRelation=="creator"){
              return '他已经添加完了证据(他仍然可以反驳你的证据). 现在只等你完成证据添加即可开始判定了.';
            }else{
              return '卖家已经添加完了证据(他仍然可以反驳买家的证据). 现在只等买家完成证据添加即可开始判定了.';
            }
          }else{
            if(this.sum==0){
              return '没有添加任何证据';
            }else{
              return '共有'+this.sum+'条证据';
            }
          }
        },
        addCssClass:"text-right",
        itemViewClassName:"KaseFact.DefendantFact",
        collectionParams:{attris:{kase_id:"${kase.id}",creator_id:"${kase.defendant_id}"}},
        canAddFact:function(){
          return this.userRelation=="defendant"&&this.kase.status.match(/addingFacts|plaintiffReady/);
        }
      }
    }]
  }],
  xp_ModelView:[{
      mg_elementConfigs:{
        refute:['${cr~fact.Refute}','${model}']
      }
  },{
    ex_ListItem:[{},{
        ex_KaseFact:[{
          extraContentClass:'',
          textType:'success',
          reTextType:'danger',
          template:'${e~userLink}<div class="media-body"><h4 class="media-heading clearfix">${e~titleLink}<small class="pull-${reTextAlign}">${datetime:model.created_at}</small></h4><div class="text-${textType} ${extraContentClass}">${model.content}${e~image}<div> ${e~renewButton}${e~agreeButton}${e~refuteButton}</div></div></div>',
          mg_elementConfigs:{
            image:['Image',['${model.imageSrc}'],{hide:'${!model.has_image}'}],
            refutation:['Panel',{head:'反驳',type:'${reTextType}',body:'${e~refuterLink}<div class="media-body "><h4 class="media-heading clearfix"><small >${datetime:model.created_at}</small></h4><div class="content text-${reTextType} ">${model.refutation}<div>${e~renewRefutationButton}</div></div></div>'}, {hide:'${!model.refuted()}',cssClass:'text-${reTextAlign}'}],
            refuteImage:['Image','${model.refuteImageSrc}', {hide:'${!model.has_refute_image}',location:'refutation/.content'}],
            agreeButton:['Button',['agree','认可',{type:'success',size:'sm',warning:'你确定认可对方提供的这个证据吗?一旦认可, 该证据就不能再被反驳和修改.作为奖励, 你将允许多添加一个证据.'}],{hide:'${!model.refutable()}'}],
            renewButton:['Button',['#fact/${model.id}/renew','修改',{icon:'pencil',type:'warning',size:'sm'}],{hide:'${!model.isEditable()}'}],
            refuteButton:['Button',['#fact/${model.id}/refute','反驳',{type:'danger',size:'sm'}],{hide:'${!model.refutable()}'}],
            userLink:['UserLink',['${model.creator_id}','',{version:'small',imgClass:'media-object',cssClass:'media-${textAlign} pull-${textAlign}'}]],
            refuterLink:['UserLink',['${model.refuter_id}','${model.refuter.username}',{version:'small',imgClass:'media-object',cssClass:'media-${textAlign} pull-${reTextAlign}'}], {hide:'${!model.refuted()}'}]
          },
          initShow:['userLink','titleLink','image','refutation','refuterLink','refuteImage','renewButton',/*'agreeButton',*/'refuteButton'],
          agree:function(){
            
          }
        },{
          ex_PlaintiffFact:{
          },
          ex_DefendantFact:{
            textType:'danger',
            reTextType:'success',
            textAlign:'right',
            mg_elementConfigs:{
            }
            
          }
          
        }]
    }]
  }],
  xp_CreateView:[{
      defaultState:'start',
      cancelState:'#kase/${model.kase_id}',
      afterRenewState:'${cancelState}',
      cancelWarning:'本次添加证据尚未完成, 你确定要返回?',
      addImageTitle:'上传证据图片',
      uploadUrl:'uploader/uploadFactImage.php?kase_id=${kase.id}',
      editUrl:'uploader/uploadFactImage.php?fact_id=${model.id}',
      imageUrl:"${model.imageSrc}",
      get_title:function(){
        if(this.model.id){
          return "修改证据";
        }else{
          return "添加证据";
        }
      },
      hasImage:function(){
        return this.model.has_image;
      },
      mg_elementConfigs:{
        topbar:['Navbar',{links:[['${cancelState}','<span class="fa fa-arrow-left"></span>','${cancelWarning}']],title:'${title}',selectable:false,cssClass:'text-center navbar-inverse navbar-fixed-top'}],
        addImageButton:['Uploader',{afterUpload:'afterAddImage',title:'${addImageTitle}',icon:'camera',url:'${uploadUrl}'},
        {hide:'${hasImage()}',cssClass:'btn-primary col-xs-12'}],
        editImageButton:['Uploader',{afterUpload:'afterEditImage',title:'更换图片',icon:'camera',url:'${editUrl}'},{hide:'${!hasImage()}',cssClass:'btn-primary col-xs-12'}],
        image:['Image','${imageUrl}',{hide:'${!hasImage()}',cssClass:'col-xs-12'}],
        contentInput:['TextInput',{max:140,placeholder:'请简明扼要的说明你要添加的证据'},{cssClass:'col-xs-12'}],
        saveButton:['Button',["finish","完成",{type:'success',size:'sm'}],{location:'topbar/.navbar-right',wrapper:'<li>{{}}</li>'}]
        
      },
      initShow:['topbar','addImageButton','contentInput','image','editImageButton','saveButton'],
      mg_initLoads:{
        Uploader:'js:$$view/Uploader.js'
      },
      mg_showConfigs:{
        edit:['-addImageButton']
      },
      afterSaveState:'../start',
      beforeInit:function(model){
        this.parentCall('beforeInit',[model]);
        if(!this.model.id){
          this.kase=this.parent.model;
          this.model.kase_id=this.kase.id;
        }
      },
      afterAddImage:function(returned){
        //console.debug("","returned=",returned);
        var _this=this;
        this.resource.getModel(returned.name).pipe(function(model){
            _this.model=model;
            model.has_image=true;
            _this.resource.afterCreate(model);
          return _this.setState("edit");
        });
      },
      afterEditImage:function(){
        this.model.imageUpdatedAt=$.now();
        $(this.elements.image).attr('src',this.model.get_imageSrc());
        //this.model.onDataChange();
      }
      
  },{
    ex_Refute:{
      cancelWarning:'本次反驳尚未完成, 你确定要返回?',
      addImageTitle:'上传反驳证据图片',
      title:'反驳',
      uploadUrl:'uploader/uploadRefuteImage.php?fact_id=${model.id}',
      editUrl:'uploader/uploadRefuteImage.php?fact_id=${model.id}',
      imageUrl:'${model.refuteImageSrc}?',
      hasImage:function(){
        return this.model.has_refute_image;
      },
      mg_elementConfigs:{
        refutationInput:['TextInput',{placeholder:'请简明扼要的说说你反驳的理由',max:140},{cssClass:'col-xs-12'}]
      },
      initShow:['topbar','addImageButton','refutationInput','image','editImageButton','saveButton'],
      inputConfigs:['refutation'],
      afterAddImage:function(returned){
        //console.debug("","returned=",returned);
        this.model.has_refute_image=true;
        return this.setState("edit");
      },
      afterEditImage:function(){
        this.model.refuteImageUpdatedAt=$.now();
        $(this.elements.refuteImage).attr('src',this.model.get_refuteImageSrc());
        this.model.onDataChange();
      }
    }
  }]
});

