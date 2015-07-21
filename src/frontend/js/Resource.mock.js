$$.Resource=$$.App.Resource=$$.Resource.createSubclass({
    nextId:0,//用来模拟id increment
    createModel:function(params){
      var model=this.createMockModel(params);
      var d=this.afterCreate(model);
      if(!d||!d.pipe){
        return ssys.resolve(model);
      }else{
        return d;
      }
    },
    createMockModel:function(params){
      this.nextId++;
      params.id=this.nextId;
      params.created_at=$.now();
      params.updated_at=$.now();
      params.creator_id=this.app.currentUser.id;
      params.creator_username=this.app.currentUser.username;
      this._createMockModel(params);
      var tuple=ssys.mapToList(params,this.Model.prototype.attris);
      return this.getModelByTuple(tuple);
    },
    _createMockModel:function(params){
      //每个resource会有不同的implement
      //用来添加额外的创建model逻辑
    },
    isUnique:function(attributeName,value){
      var params={};
      params[attributeName]=value;
      var model=this.findLoadedModelByAttributes(params);
      return $$.resolve(!model);
    },
    getModel:function(id){
      if(this.models[id]){
        return ssys.resolve(this.models[id]);
      }else{
        return ssys.reject(this.name+".getModel没有找到id为"+id+"的model");
      }
    },
});