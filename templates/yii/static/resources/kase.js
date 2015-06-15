pandingbao.addResource("kase",{
    collectionConfigs:{
      MyCurrentKases:{action:"myCurrentKases",order:'created_at DESC',limit:5},
      VerdictingKases:{attris:{status:"verdicting"},order:"verdicted_at DESC",limit:5},
      ConvictedKases:{attris:{status:"convicted"},order:"convicted_at DESC",limit:5}
    },
    afterCreate:function(model){
      var collection=this.collections.MyCurrentKases;
      if(collection){
        collection.newModels.push(model);
        collection.sum++;
        for(var name in collection.views){
          var view=collection.views[name];
          view.onDataChange();
        }
      }
    },
    xp_Model:{
      attris:['id','name','defendant_username','defendant_id','defendant_url','item_name','item_url','bought_at','price','shipping_fee','delivered_at','problem','defendant_response','found_at','returned_at','returned_fee','claimed','agreed','fine','verdicted_at','verdict_count','truth','truthcount','status','convicted','convicted_at','creator_id','creator_username','created_at','updated_at'],
      creationParams:['defendant_username','defendant_url','item_name','item_url','bought_at','price','shipping_fee','delivered_at','problem','defendant_response','found_at','returned_at','returned_fee','claimed','agreed','fine'],
      validationRules:{
        defendant_username:['String',{max:60}],
        defendant_url:['Url'],
        price:['Number',{isNull:false,min:1}]
      },
      relations:{
        facts:['hasMany','app/r_fact','kase_id'],
        defendant:["belongTo",'app/r_party','defendant_id']
      },
      verdictsLimit:60,
      getModelViewClass:function(){
        var baseClass=this.resource.ModelView;
        if(this.convicted_at){
          var klass=baseClass.Convicted;
        }else if(this.status=='verdicting'){
          var klass=baseClass.Verdicting;
        }else{
          var klass=baseClass.BeforeVerdict;
        }
        return this.ModelView=klass;
      },
      ready:function(){
        return this.resource.getDataByAction("ready",{id:this.id});
      },
      claim:function(claim){
        return this.resource.getDataByAction("claim",{id:this.id,claim:claim});
      },
      defend:function(){
        return this.resource.getDataByAction("defend",{id:this.id});
      },
      counterclaim:function(){
        return this.resource.getDataByAction("counterclaim",{id:this.id,refresh:$.now()});
      },
      reconcile:function(){
        return this.resource.getDataByAction("reconcile",{id:this.id});
      },
      _getUserRelation:function(currentUser){
        if(this.defendant_username==currentUser.username){
          return "defendant";
        }
      },
      convict:function(){
        return this.resource.getDataByAction("convict",{id:this.id});
      },
      get_content:function(){
        if(this.status=="verdicting"){
          return "目前已有"+this.verdict_count+"个判定";
        }else if(this.status=="convicted"){
          return "判定结果:退款"+this.convicted+"元, 共"+this.verdict_count+"个判定";
        }else{
          return "举证中";
        }
      }
    },
    xp_CreateView:{
      style:'col-md-6 col-md-offset-3',
      steps:["inputDefendant","inputOrder","inputProblem"],
      defaultState:"inputDefendant",
      cancelState:"#",
      backState:'#',
      mg_elementConfigs:{
        stage:['Html',['<form class="form-horizontal"></form>']],
        defendant_usernameInput:["StringInput",{icon:"user",placeholder:"填写你要投诉的卖家的名称"}],
        defendant_urlInput:["StringInput",{icon:"link",placeholder:"填写卖家店铺的网址"}],
        item_nameInput:["StringInput",{icon:"gift",placeholder:"你购买了什么商品?请填写商品名称"}],
        item_urlInput:["StringInput",{icon:"link",placeholder:"请填写商品的网址"}],
        bought_atInput:["DateInput",["购买日期"]],
        delivered_atInput:["DateInput",["收货日期(不填表示未收到货)"]],
        priceInput:["NumberInput",{placeholder:'商品价格',unit:'元',icon:'cny',errors:{tooSmall:function(min){
          return "抱歉, 低于"+min+"元的投诉我们暂不受理";
        }}}],
        shipping_feeInput:["NumberInput",{placeholder:'运费',unit:'元',icon:'cny'}],
        found_atInput:["DateInput",["你是在哪一天发现问题并跟卖家反映的?"]],
        problemInput:["TextInput",{placeholder:"该商品或卖家服务存在什么问题?"}],
        defendant_responseInput:["TextInput",{placeholder:"你跟卖家反映这些问题时, 卖家的回应是?"}],
        claimedInput:["NumberInput",{placeholder:'要求卖家退款多少',unit:'元',icon:'cny'}],
        agreedInput:["NumberInput",{placeholder:'卖家只同意退款多少',unit:'元',icon:'cny'}],
        returned_atInput:["DateInput",["你在哪一天退的货?不填表示未退货"]],
        returned_feeInput:["NumberInput",{placeholder:'退货运费',unit:'元',icon:'cny'}]
      },
      initLoads:{
        DateInput:'js:$$view/DateInput.js'
      },
      initShow:["stage","@topbar","@nextButton","@saveButton","@title","@pageHeader"],
      mg_showConfigs:{
        inputDefendant:["defendant_usernameInput","defendant_urlInput","item_nameInput","item_urlInput","-saveButton"],
        inputOrder:["bought_atInput","priceInput","delivered_atInput","shipping_feeInput","returned_atInput","returned_feeInput","-saveButton"],
        inputProblem:["found_atInput","problemInput","defendant_responseInput","claimedInput","agreedInput","-nextButton"]
      },
      title:'投诉',
      currentStep:0,
      subTitle:'',
      filter_inputDefendant:function(state){
        this.backState='#';
        this.backWarning='本次添加证据尚未完成, 你确定要返回?';
        this.currentStep=1;
        this.subTitle="请填写你要投诉的卖家和商品信息";
        return state;
      },
      filter_inputOrder:function(state){
        this.backState='inputDefendant';
        this.backWarning='';
        this.currentStep=2;
        this.subTitle="请填写你与卖家的交易情况";
        return state;
      },
      filter_inputProblem:function(state){
        this.backState='inputOrder';
        this.backWarning='';
        this.currentStep=3;
        this.subTitle="请填写你与卖家的纠纷情况";
        return state;
      }
      
    },
    xp_ModelView:[
      {
        affectParent:false,
        refreshState:'start',
        mg_elementConfigs:{
          topbar:['Navbar',{links:[['#','<span class="fa fa-arrow-left"></span>']],title:'${title}',selectable:false,cssClass:'text-center navbar-inverse navbar-fixed-top'}],
          scrollspy:['Scrollspy',{links:'${links}',offset:45},{cssClass:'navbar-fixed-bottom'}],
          header:['Html',['<h3 class="page-header text-default">${model.name}<div class="pull-right"><small>${date:model.created_at}</small></div></h3>']],
          myVerdict:['${mv~verdict}',['${myVerdict}'],{location:['before','appealContent'],hide:'${!myVerdict}'}],
          plaintiffFacts:['${cl~fact.KaseFacts.PlaintiffFacts}',['${model}']],
          defendantFacts:['${cl~fact.KaseFacts.DefendantFacts}',['${model}']],
          appealContent:['Html',['<div class="text-default">'+
            '<div class="panel panel-default"><div class="panel-heading "><h6 >${date:model.bought_at}</h6></div>'+
            '<div class="panel-body">${buyer}花了<strong>${model.price}</strong>元, 在${seller}买了<a href="${model.item_url}" class="btn btn-default btn-xs">${model.item_name} <span class="fa fa-external-link"></span></a></div></div>'+
            '<div class="panel panel-default"><div class="panel-heading "><h6 >${date:model.delivered_at}</h6></div>'+
            '<div class="panel-body">收到货物(或服务), 运费是${model.shipping_fee}元.</div></div>'+
            '<div class="panel panel-default"><div class="panel-heading "><h6 >${date:model.found_at}(${afterDays})</h6></div>'+
            '<div class="panel-body">发现并向卖家反映了这些问题:<div class="panel panel-default">${model.problem}</div>卖家的回应是: <div class="panel panel-default">${model.defendant_response}</div></div></div>'+
            '<div class="panel panel-default"><div class="panel-heading "><h6 >${date:model.returned_at}</h6></div>'+
            '<div class="panel-body">买家退回了商品, 运费是${model.returned_fee}元'+
            '<div class="panel panel-default">买家要求卖家退款${model.claimed}元</div>'+
            '<div class="panel panel-default">卖家只同意退款${model.agreed}元</div>'+
            '</div>']]
    
        },
        mg_initLoads:{
          Scrollspy:'js:$$view/Scrollspy.js'
        },
        get_links:function(){
          return [['#${fullname}__header','基本案情'],['#${fullname}__plaintiffFacts','买家证据'],['#${fullname}__defendantFacts','卖家证据']];
        },
        get_defendantName:function(){
          var model=this.model;
          if(model.plaintiffType=="seller"){
            return "买家";
          }else{
            return "卖家";
          }
        },
        get_plaintiffName:function(){
          var model=this.model;
          if(model.plaintiffType=="seller"){
            return "卖家";
          }else{
            return "买家";
          }
        },
        get_buyer:function(){
          return "<a href='javascript:;' class='ssysLink' data-state='#user/"+this.model.creator_id+"'><strong>买家\""+this.model.creator_username+"\"</strong></a>";
        },
        get_seller:function(){
          return "<a href='javascript:;' class='ssysLink' data-state='#user/"+this.model.defendant_id+"'><strong>卖家\""+this.model.defendant_username+"\"</strong></a>的<a href='"+this.model.defendant_url+"' class='btn btn-default btn-xs'>店铺 <span class='fa fa-external-link'></span></a>";
        },
        get_afterDays:function(){
          var days=parseInt((this.model.found_at-this.model.delivered_at)/3600/24);
          if(days>0){
            return days+"天后";
          }else{
            return "收到货的当天";
          }
        },
        get_sellerResponse:function(){
          return "";
        }


      },{
        ex_BeforeVerdict:[{
          mg_elementConfigs:{
            title:['Html',['<div style="color:white;"></div>'],{location:'#${fullname}__topbar .navbar-form'}],
            factCreator:['${cr~fact}']
          },
          initShow:['topbar','scrollspy','header','appealContent','plaintiffFacts.','defendantFacts.'],
          mg_showConfigs:{
            addFact:['factCreator.','-topbar','-header','-plaintiffFacts','-defendantFacts','-appealContent']
          },
          title:'举证中'
        }],
        ex_Verdicting:{
          title:'判定中',
          get_links:function(){
            var links=[['#${fullname}__appealContent','基本案情'],['#${fullname}__plaintiffFacts','买家证据'],['#${fullname}__defendantFacts','卖家证据']];
            if(this.settingState=="addVerdict"){
              links.push(['#${fullname}__verdictCreator','我的判定']);
            }else if(this.myVerdict){
              links.unshift(['#${fullname}__myVerdict','我的判定']);
            }
            return links;
          },
          mg_elementConfigs:{
            addVerdictButton:['Button',['addVerdict','我要评判',{type:'primary',size:'sm'}],{hide:'${myVerdict}',location:'topbar/.navbar-right',wrapper:'<li >{{}}</li>'}],
            verdictCreator:['${cr~verdict}',[{kase_id:'${model.id}'}]],
            progressInfo:['Html','<div class="well">目前已经有${model.verdict_count}个判定, 当满${model.verdictsLimit}个时就公布判定结果</div>']
          },
          initShow:['topbar','@scrollspy','header','appealContent','plaintiffFacts.','defendantFacts.','addVerdictButton','progressInfo','myVerdict'],
          beforeInitLoads:function(model){
            this.model=model;
          },
          mg_initLoads:{
            myVerdict:'verdict/{"creator_id":${app.currentUser.id},"kase_id":"${model.id}"}'
          },
          showConfigs:{
            addVerdict:['verdictCreator.','-topbar','-addVerdictButton','-progressInfo']
          }
        },
        ex_Convicted:{
          mg_elementConfigs:{
            convictedResult:['Html',['<h3>判定结果是:卖家退款${model.convicted}元</h3>']]
          },
          initShow:['header','appealContent','plaintiffFacts.','defendantFacts.','addVerdictButton','myVerdict','convictedResult']
        },
        ex_ListItem:[{
          mg_elementConfigs:{
            userLink:['UserLink',['${model.creator_id}','',{version:'small',imgClass:'media-object',cssClass:'pull-${textAlign} media-${textAlign}'}]],
            titleLink:['Link',['#kase/${model.id}','${model.name} ']]
          },
          initShow:['userLink','titleLink']
        },{
          ex_VerdictingKase:{},
          ex_ConvictedKase:{},
          ex_MyCurrentKase:{},
          ex_MyPlaintiffkase:{}
        }]
      }
    ],
    xp_Collection:{
      
    },
    xp_ResourceView:{
      get_title:function(){
        var state=this.settingState;
        if(state.match(/\d+/)){
          return '投诉';
        }
      },
      mg_elementConfigRules:[
        [/^plaintiffIsUser(\d+)/,['${cl~kase.PlaintiffKases}','$1']],
        [/^defendantIsUser(\d+)/,['${cl~kase.DefendantKases}','$1']]
      ],
      mg_showConfigRules:[
        [/^(\d+)/,['$1','-topbar']]
      ]
    },
    xp_CollectionView:[{
        hideWhenEmpty:true
    },{
      ex_admin:{
        mg_elementConfigs:{
          deleteButton:['Button',['delete',null,'删除勾选的投诉',null,'text-center',null,'danger',null,"你确定要删除吗?"]],
          dataTable:['ResourceDataTable',['${columnConfigs}']]
        },
        columnConfigs: [
          ["名称","name","ModelLink"],
          //["认为最应该赏(罚)","id","Template","${bestX}元"],
          //["认为不能小于","id","Template","${minX}元"],
          //["认为不能大于","id","Template","${maxX}元"],
          ["创建时间","created_at","Time"],
          ["勾选","id","Checkbox","checkKase","10%"]
        ],
        indexShow:['dataTable','deleteButton'],
        afterInit:function(){
          this.checkedKases={};
        },
        checkKase:function(target,kase){       
          if(target.checked){
              this.checkedKases[kase.id]=kase;
          }else{
              delete this.checkedKases[kase.id];
          }
        },
        filter_delete:function(){
          var kaseIds=$.map(this.checkedKases,function(value){return value.id;});
          if(kaseIds.length==0){
            alert("你没有勾选要删除的投诉");
            return ssys.reject("index");
          }
          return this.app.resources.kase.deleteAll(kaseIds).pipe(function(){
              alert("已经成功删除了你所勾选的"+kaseIds.length+"个投诉");
            return ssys.reject("refresh/index");
          },function(){
            alert("可能因为网络原因, 删除失败了, 请再试一次");
            return ssys.reject("index");
          });
        }
        
      },
      ex_UserKases:{
        beforeInit:function(user){
            this.user=user||this.app.currentUser.userModel;         
        },
        collectionParams:{userid:"${user.id}"}
      },
      ex_MyCurrentKases:{
        title:'我的当前投诉',
        hasPaginator:false,
        style:'warning'       
      },
      ex_PlaintiffKases:{
        noPanelHead:true,
        collectionParams:{attris:{creator_id:'${userId}'},limit:20,order:'id DESC '},
        beforeInitLoads:function(userId){
          this.userId=userId;
        }
      },
      ex_DefendantKases:{
        noPanelHead:true,
        collectionParams:{attris:{defendant_id:'${userId}'},limit:20,order:'id DESC '},
        beforeInitLoads:function(userId){
          this.userId=userId;
        }
      },
      ex_MyPlaintiffKases:{
        noPanelHead:true,
        collectionParams:{attris:{creator_id:'${app.currentUser.id}'},limit:20,order:'id DESC '}
      },
      ex_MyDefendantKases:{
        noPanelHead:true,
        collectionParams:{attris:{defendant_id:'${app.currentUser.id}'},limit:20,order:'id DESC '}
      },
      ex_BeforeVerdictKases:{
        title:'申述中的投诉'
      },
      ex_VerdictingKases:{
        hasPaginator:false,
        title:'正在判定中的投诉'
      },
      ex_ConvictedKases:{
        title:'已完结的投诉',
        style:'success'
      }
    }]
});


