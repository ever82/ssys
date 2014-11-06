$$.Resource.ResourceView=$$.View.createSubclass(
  {
    mg_elementConfigs:{
      create:['${resource.CreateView}'],
      index:['${resource.CollectionView}']
    },
    modelListClass:'panel panel-default',
    emptyInfo:'当前列表是空的',
    elementConfigRules:[
      [/^modelView/,['${model.ModelView}',['${model}','${this}']]]
      //[/^modelListView/,['${model.modelListViewClass}',['${model}','${this}']]]
    ],
    inputs:{},
    showConfigRules:[
      [/^(\d+)$/,['modelView$1']]
    ],
    initShow:[],
    indexShow:['modelList'],
    mg_filterConfigs:{
      create:['logged']
    },
    mg_filterConfigRules:[
      [/^(\d+)\/?/,'model'],
      [/update\/(\d+)/,'update'],
      [/cancel/,'cancel']
    ],
    limit:20,
    afterCancelState:"<",
    filter_cancel:function(state){
      this.cleanForNextCreation();
      //return '../'+this.entry;
      return this.afterCancelState;
    },
    filter_update:function(state){
      var matched=state.match(/^update\/(\d+)/);
      var id=matched[1];
      var _this=this;
      return this.resource.$$(''+id).pipe(function(model){
          _this.model=model;
        return state;
      });
    },
    getModelsFromStorage:function(page,limit,order){
      var _this=this;
      return this.loadStorage().pipe(function(){
        var models=_this.getSortedModels(order);
        _this.models=models.slice((page-1)*limit,page*limit);
        _this.models.sum=models.length;
        return _this.models;
      });
    },
    getSortedModels:function(order){
      //将被override
    },
    /*after_index:function(entries){
      //console.debug(this.name,"in after_index","this.models=",this.models);
      var listView=this.elements.dataTable||this.elements.modelList;
      if(this.elements.modelList){
        this.elements.modelList.domnode.find('>ul').addClass('list-group');
      }
      listView.navigate(this.page);
      listView.loadItems(this.models||[]);
    },*/
    filter_model:function(state){
      var entries=state.split("/");
      var id=entries.shift();
      var _this=this;
      return this.resource.getModel(id).pipe(function(model){
          _this.model=model;
          model.getModelViewClass();
          return state;
          /*return model.getModelViewClass().pipe(function(){
            return _this._filter_model(state,model);
          });*/
      });
    },
    _afterSetState:function(){
      //console.debug("","this.showedState=",this.showedState);
      if(this.elements.menu){
        this.redrawMenu(this.showedState);
      }
    }
  },{
    SelectTypeView:$$.View.createSubclass({
        style:'ssysSelectType',
        defaultSteps:['','selected'],
        elementConfigs:{
          steps:["SsysPlayer",["上一步","下一步",null,true]]
        },
        affectParent:true,
        mg_showConfigs:{
          index:['选择类型',null,['typenameInput','steps']],
          selected:[null,'selected']
        },
        beforeInit:function(resourceView){
          this.resourceView=resourceView||this.parent;
          this.resource=this.resourceView.resource;
        },
        filter_selected:function(state){
          this.updateInputData();
          this.resourceView.typename=this.inputData.typename;
          return [this.parent,"create"];
        },
        _afterSetState:function(){
          this.elements.steps.update();
        }
      
    }),
    ModelInput:$$.View.Input.createSubclass({
        beforeInit:function(resourceName,keyAttribute,title,note,defaultValue){
          this.resourceLabelName=this.getLabel(resourceName);
          this.keyAttribute=keyAttribute;
          this.html("<label>"+title+"</label><input name='"+keyAttribute+"' value='"+(defaultValue||'')+"'><div class='help-block'>"+(note||'')+"</div>");
        },
        showError:function(error){
          error="没有"+this.getLabel(this.keyAttribute)+"为"+this.value+"的"+this.resourceLabelName;
          this.addClass('has-error');
          this.append('<label class="control-label" for="inputError">'+error+'</label>');
        },
        updateInputData:function(){
          var keyAttribute=this.keyAttribute;
          var value=this.value=this.find("input").val();
          if(keyAttribute!="id"){
            var result={};
            result[keyAttribute]=value;
          }else{
            var result=value;
          }
          return this.inputData=result;
        }
        
    })
},"ResourceView");

