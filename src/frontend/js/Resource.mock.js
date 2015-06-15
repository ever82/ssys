$$.Resource=$$.App.Resource=$$.Resource.createSubclass({
    nextId:0,//用来模拟id increment
    createModel:function(params){
      var model=this.createMockModel(params);
      var d=_this.afterCreate(model);
      if(!d||!d.pipe){
        return ssys.resolve(model);
      }else{
        return d;
      }
    },
    createMockModel:function(params){
      this.nextId++;
      params.id=this.nextId;
      this._createMockModel(params);
      var tuple=ssys.mapToList(params,this.Model.prototype.attris);
      return this.getModelByTuple(tuple);
    },
    _createMockModel:function(params){
      //每个resource会有不同的implement
      //用来添加额外的创建model逻辑
    },
});