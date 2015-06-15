$$.Resource.CreateView=$$.View.createSubclass({
  style:'',
  addCssClass:'',
  cancelState:'../<',
  mg_elementConfigs:{
    contentInput:['TextInput',['']],
    addImageButton:['Uploader',["addImage","贴图",{icon:'camera'}]],
    saveButton:['Button',["finish","完成",{type:'success'}]],
    cancelButton:['Button',["${cancelState}","取消",{warning:'你确定要取消吗?'}]]
  },
  creationParams:{},
  affectParent:false,
  //initShow:['steps'],
  mg_filterConfigs:{
    finish:'save'
  },
  mg_filterConfigRules:[
    [/^index/,[]]
  ],
  mg_closerConfigRules:[
    [/.*/,['validateInput']]
  ],
  beforeInit:function(params){
    params=params||{};
    $$.merge(params,this.creationParams);
    if(params.resource===this.resource){
      this.model=params;
    }else{
      this.model=this.resource.createModelArchetype(params);
    }
    this.inputConfigs=this.inputConfigs||this.model.creationParams;
    if(this.model.id){
      this.isRenew=true;
    }
    this.initInputData(this.model);
  },
  renderStyle:function(){
    var cssClass=this.resource.name+"-create "+this.style+" "+this.addCssClass;
    $$.addClass(this.domnode,cssClass);
  },
  closer_validateInput:function(nextState){
    var _this=this;
    if(this.state=="start"){
      return;
    }
    //当执行上一步时, 不用检查当前这一步的输入
    if(nextState==this.getLastStep()){
      return;
    }
    var inputData=this.updateInputData();
    this.setInputsToModel(inputData);
    return this.model.validate().pipe(null,function(errors){
      errors=_this.removeTempErrors(errors,_this.state);
      if(errors){
        return _this.showErrors(errors);
      }
      return $$.resolve();//没有真正的错误, 需要让closer能够pass
    });
  },
  /**
   * 将被override,用来清除一些临时性的error, 它们是由于用户输入步骤的反复造成的,
   * 比如要返回上一步时, 当前页的一些输入可能为空, 这些错误可以先不计较
   */
  removeTempErrors:function(errors,state){
    var lastState=this.getLastState();
    if(lastState!=state){
      var i=0;
      for(var name in errors){
        var error = errors[name];
        if(!this.find(":visible[input_name='"+name+"']")[0]){
          delete errors[name];
        }else{
          i++;
        }
      }
      if(i>0){
        return errors;
      }
    }
  },
  filter_save:function(){
    var _this=this;
    var model=this.model;
    var inputs=this.updateInputData();
    this.setInputsToModel(inputs);
    return model.save().pipe(function(model){
        _this.model=model;
        var state=_this.getAfterSaveState();
        _this.cleanForNextCreation();
        return state;
    },function(errors){
      _this.showErrors(errors);
    });
  },
  cleanForNextCreation:function(){
    this.remove();
  },
  afterRenewState:'../refresh/',
  getAfterSaveState:function(){
    if(this.isRenew){
      return this.afterRenewState;
    }else{
      return this.afterSaveState||("../"+this.model.id);
    }
  },
  updateInputData:function(){
    var inputData=this.parentCall('updateInputData');
    return ssys.removeUndefined(inputData);
  },
  /**
   * 这个接口可以被override
   */
  setInputsToModel:function(inputs){
    var model=this.model;
    for(var name in inputs){
      var value = inputs[name];
      model[name]=value;
    }
  }
},null,"CreateView");
