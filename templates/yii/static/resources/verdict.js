pandingbao.addResource("verdict",{
  collectionConfigs:{
  },
  afterCreate:function(model){
    var kase=pandingbao.resources.kase.models[model.kase_id];
    kase.pull();
  },
  xp_Model:{
    attris:['id','kase_id','kase_name','truth','weight','weight0','bestX','points','reason','creator_id','creator_username','created_at','updated_at'],
    creationParams:['kase_id','truth','bestX','points','reason'],
    validationRules:{
      bestX:['Number',{isNull:false}]
    }
  },
  xp_Collection:{},
  xp_ResourceView:{
    get_title:function(){
      var state=this.settingState;
      if(state.match(/^ofUser(\d+)/)){
        return '判定';
      }
    },
    mg_elementConfigRules:[
      [/^ofUser(\d+)/,['${cl~verdict.UserVerdicts}','$1']]
    ]
  },
  xp_CollectionView:[{
    noPanelHead:true
  },{
    ex_UserVerdicts:{
      beforeInitLoads:function(userId){
        this.userId=userId;
      },
      collectionParams:{attris:{creator_id:'${userId}'},order:'id DESC',limit:20}
    },
    ex_MyVerdicts:{
      collectionParams:{attris:{creator_id:"${app.currentUser.id}"},order:'created_at DESC',limit:20}
    }
  }],
  xp_ModelView:[{
      mg_elementConfigs:{
      },
      template:'<div class="jumbotron">'+
        '<h3>我的判定:</h3>'+
        '<div>卖家应该退款${model.bestX}元</div>'+
        '<h4>我的理由:</h4>'+
        '<div>${model.reason}</div>'+
        '<div>我的确定程度是${model.truth}%</div>'+
        '</div>',
      initShow:[]
  },{
    ex_ListItem:[{
        addClass:'media',
        template:'<div class="pull-left media-left" ><div style="width:100px;">${date:model.created_at}</div></div><div class="media-body"><h4 class="media-heading"><a class="ssysLink" data-state="#kase/${model.kase_id}" href="javascript:;">${model.kase_name}</a></h4>'+
        '<div><strong>判定</strong>:卖家应该退款${model.bestX}元</div>'+
        '<div><strong>理由</strong>:${model.reason}</div>'+
        '<div><strong>确定程度</strong>:${model.truth}%</div></div>'
    },{
      ex_MyVerdict:{
      }
    }]
  }],
  xp_CreateView:[{
      defaultState:"inputCore",
      title:'判定',
      steps:["inputCore","inputMore"],
      mg_elementConfigs:{
        bestXInput:['NumberInput',{icon:'cny',unit:'元',placeholder:'你认为卖家应该退款多少元钱?'}],
        truthInput:['StarRater',{title:'你对自己的评判确定吗?请评价你的确定程度',min:0,max:100,step:10,size:'xs',starCaptions:{10: '瞎蒙的',
          20: '很不确定',
          30: '不太确定',
          40: '只有三四成把握',
          50: '有一半把握',
          60: '有六成把握',
          70: '有七成把握',
          80: '有八成把握',
          90:'有九成把握',
          100: '十分确定'}}],
        reasonInput:['TextInput',{placeholder:'请填入你的评判理由',max:140}]
      },
      mg_elementConfigRules:[
        [/^y(\d)Input$/,['StarRater',{title:'有人认为卖家应该退款${x$1}元,你对该判定的满意度是多少?',size:'xs',starCaptions:{0.5: '坚决反对',
          1: '反对',
          1.5: '不满意',
          2: '不太满意',
          2.5: '无所谓',
          3: '还可以',
          3.5: '满意',
          4: '很满意',
          4.5: '接近完美',
          5: '最满意'}}]]
      ],
      initShow:["stage","@topbar","@pageHeader"],
      mg_showConfigs:{
        inputCore:["bestXInput","truthInput","reasonInput","@nextButton"],
        inputMore:["@saveButton"]
      },
      mg_loadConfigs:{
        inputCore:{StarRater:'js:$$view/StarRater.js'},
        inputMore:{
          opts:'opt/forVerdict.json?kase_id=${model.kase_id}&x=${model.bestX}'}
      },
      filter_inputMore:function(state){
        this.backState='inputCore';
        this.currentStep=2;
        this.subTitle='请填入对别人判定的满意度';
        this.getOpts();
        this.showConfigs=$$.clone(this.showConfigs);
        for(var i=0,l=this.opts.length;i<l;i++){
          var x=this.opts[i];
          this['x'+i]=x;
          this.showConfigs.inputMore.push('y'+i+'Input');
        }
        return state;
      },
      filter_inputCore:function(state){
        this.backState='../index';
        this.currentStep=1;
        this.subTitle='请填入你的判定';
        return state;
      },
      updateInputData:function(){
        var inputData=this.parentCall('updateInputData');
        var points=inputData.points={};
        if(this.opts){
        for(var i=0,l=this.opts.length;i<l;i++){
          var x=this.opts[i];
          points[x]=this.elements['y'+i+'Input'].updateInputData();
        }
        }
        return inputData;
      },
      afterShow:function(){
        this.parent.elements.scrollspy.find('li>a[data-target="#'+this.parent.fullname+'__verdictCreator"]').trigger('click');
      },
      getOpts:function(){
        if(this.opts.length==0){
          var kase=this.app.resources.kase.models[this.model.kase_id];
          var opts=[kase.claimed,kase.agreed];
          for(var i=0,l=opts.length;i<l;i++){
            var opt=opts[i];
            if(opt!=this.model.bestX){
              this.opts.push(opt);
            }
          }
        }
        
      }
      
  },{
  }]
});
/*
var createVerdictResource=function(){
  var verdict=SsysResource.create("verdict",ssys.pandingbao);
  verdict.typenames=['PersonVerdict','PersonWhateverVerdict','GroupVerdict'];
  verdict.createModelClass({
    attris:['id','kase_id','kase_name','party_id','party_username','money_id','money_name','truth','creator_id','creator_username','created_at','updated_at','weight','weight0','typename','typedata'],
    validationRules:{
      party_id:['Model','party'],
      typename:['ImplType']
    },
    mg_editableConfigs:{
      uneditable:['id','created_at','typename','party_id','user_id','updated_at','answer_id'],
      editableRoles:['creator','author','owner','admin']
    },
    relations:{
      kase:['belongTo','app/r_kase','kase_id'],
      answer:['belongTo','#scenter/r_answer','answer_id']
    }
    
  },{
    creationParams:['party_id','truth','typename','typedata'],
    ex_PersonVerdict:{
      implAttris:['bestX','zeroY','defaultY','claimY','counterclaimY','reason','deviation','bestX2','bestX3'],
      validationRules:{
        bestX:['Float','validateBestX'],
        reason:['String',null,'Null',260]
      },
      getPersonCurve:function(bestX){
        var claim=this.party.claim;
        var counterclaim=this.party.counterclaim;
        var bestX=bestX===undefined?this.bestX:bestX;
        if(bestX>0){
          return PersonSatisCurve.createBy3Points(bestX,[0,this.zeroY],[2*bestX,this.defaultY],this.weight||1);
        }else if(bestX<0){
          return PersonSatisCurve.createBy3Points(bestX,[2*bestX,this.defaultY],[0,this.zeroY],this.weight||1);
        }else if(this.counterclaimY||this.counterclaimY===0){
          return PersonSatisCurve.createBy3Points(0,[-counterclaim,this.counterclaimY],[claim,this.claimY],this.weight||1);
        }else{
          return PersonSatisCurve.createBy3Points(0,null,[claim,this.claimY],this.weight||1);
     
        }
      },
      getShangOrFa:function(){
        if(this.bestX>0){
          return 'fa';
        }if(this.bestX<0){
          return 'shang';
        }else{
          return 'neither';
        }
      },
      getAssignment:function(){
        var shangOrFa=this.shangOrFa;
        var plaintiff='<strong>"'+(this.party?this.party.creator_username:"甲方")+'"</strong>';
        var defendant='<strong>"'+(this.party?this.party.username:"乙方")+'"</strong>';
        if(shangOrFa=="fa"){
          var text="最好"+defendant+"赔偿"+this.bestX+this.money_name+",不赔偿的满意度是"+this.zeroY+",赔偿"+this.bestX*2+this.money_name+"的满意度是"+this.defaultY+", "+(this.bestX2?(",希望追加罚款"+this.bestX2+this.money_name):"不必追加罚款");
        }else if(shangOrFa=="shang"){
          var text= "最好"+plaintiff+"赔偿"+(-this.bestX)+this.money_name+",不赔偿的满意度是"+this.zeroY+",赔偿"+(-this.bestX*2)+this.money_name+"的满意度是"+this.defaultY+", "+(this.bestX2?(",希望追加罚款"+this.bestX2+this.money_name):"不必追加罚款");
        }else if(shangOrFa=="neither"){
          if(this.party){
            var claim=this.party.claim+this.money_name;
            var counterclaim=this.party.counterclaim+this.money_name;
          }else{
            var claim="甲方索赔金额";
            var counterclaim="乙方索赔金额";
          }
          if(this.counterclaimY!==null&&this.counterclaimY!==undefined){
            var text="最好互相都不用赔偿, "+(this.bestX2?("同时对"+defendant+"罚款"+this.bestX2+this.money_name+", "):"")+(this.bestX3?("并对"+plaintiff+"罚款"+this.bestX3+this.money_name+", "):"")+defendant+"赔偿"+claim+"的满意度是"+this.claimY+","+plaintiff+"赔偿"+counterclaim+"的满意度是"+this.counterclaimY;
          }else{
            var text="最好"+defendant+"不用赔偿, "+(this.bestX2?("但是要罚款"+this.bestX2+this.money_name+", "):"")+"赔偿"+claim+"的满意度是"+this.claimY;
          }
        }
        return text+(this.reason?("<blockquote>  <p><label>理由是</label>:"+this.reason+"</p></blockquote>"):'');
      },
      fetchParty:function(){
        if(this.app.resources.party){
          this.party=this.app.resources.party.models[this.party_id];
        }
      },
      getPunishDefendantCurve:function(){
        if(!this.punishDefendantCurve){
          this.punishDefendantCurve=this.getPersonCurve(this.bestX2);
        }
        //console.debug("","this.punishDefendantCurve=",this.punishDefendantCurve);
        return this.punishDefendantCurve;
      },
      getPunishPlaintiffCurve:function(){
        if(!this.punishPlaintiffCurve){
          this.punishPlaintiffCurve=this.getPersonCurve(this.bestX3);
        }
        return this.punishPlaintiffCurve;
      },
      init:function(){
        if(this.id){
          this._clearCache();
          this.fetchParty();
          this.shangOrFa=this.getShangOrFa();
          this.assignment=this.getAssignment();
          this.renpin=this.weight?(this.weight*100).toFixed(2):100;
          this.renpin0=this.weight0?(this.weight0*100).toFixed(2):100;
          this.renpinDiff=this.weight?((this.weight-this.weight0)*100).toFixed(2):0;
        }
        
      }
    },
    ex_PersonWhateverVerdict:{
      implAttris:['reason'],
      init:function(){
        if(this.id){
          this._clearCache();
        }
        this.assignment="无所谓";
        this.shangOrFa='whatever';
        this.renpin=this.weight?(this.weight*100).toFixed(2):100;
        this.renpin0=this.weight0?(this.weight0*100).toFixed(2):100;
        this.renpinDiff=this.weight?((this.weight-this.weight0)*100).toFixed(2):0;
      }
    },
    ex_PersonInflectionVerdict:{
      implAttris:['bestX','minX','maxX','reason','deviation'],
      validationRules:{
        bestX:['Float','validateBestX'],
        minX:['Float','validateMinX'],
        maxX:['Float','validateMaxX'],
        reason:['String',null,'Null',260]
      },
      getShangOrFa:function(){
        if(this.minX>0){
          return 'shang';
        }if(this.maxX<0){
          return 'fa';
        }else{
          return 'both';
        }
      },
      getAssignment:function(){
        var shangOrFa=this.getShangOrFa();
        if(shangOrFa=="shang"){
          var assignment="最好补偿"+this.bestX+this.money_name+",最少"+this.minX+this.money_name+",最多"+this.maxX+this.money_name;
        }else if(shangOrFa=="fa"){
          var assignment= "最好罚款"+(-this.bestX)+this.money_name+",最少"+(-this.maxX)+this.money_name+",最多"+(-this.minX)+this.money_name;
        }else if(shangOrFa=="both"){
          if(this.bestX>0){
            var bestText="最好补偿"+this.bestX+this.money_name;
          }else if(this.bestX<0){
            var bestText="最好罚"+this.bestX+this.money_name;
          }else{
            var bestText="最好不罚也不补偿";
          }
          var assignment= bestText+",最多罚"+(-this.minX)+this.money_name+",最多补偿"+this.maxX+this.money_name;;
          
        }
        return assignment+(this.reason?"<br>理由是:"+this.reason:'');
      },
      init:function(){
        if(this.id){
          this._clearCache();
          this.assignment=this.getAssignment();
          this.shangOrFa=this.getShangOrFa();      
          this.renpin=this.weight?(this.weight*100).toFixed(2):100;
          this.renpin0=this.weight0?(this.weight0*100).toFixed(2):100;
          this.renpinDiff=this.weight?((this.weight-this.weight0)*100).toFixed(2):0;
        }
        
      }
    },
    ex_GroupVerdict:{
      implAttris:['bestX','points','weightT','deviationR'],
      getSubverdicts:function(page,limit,order){
        var _this=this;
        return ssys.dfdget(this.subverdicts,function(){
            return _this.resource.getModelsByAction('subverdicts',{verdict_id:_this.id,page:page, limit:limit});
        });
      }
    }
  },SsysModel.Valuation);
}
if(SsysModel.Valuation){
  createVerdictResource();
}else{
ssys.pandingbao.$$("l_Valuation").pipe(function(){
  createVerdictResource();
});
}
*/
