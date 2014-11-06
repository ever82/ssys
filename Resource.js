$$.Resource=$$.App.Resource=$$.O.createSubclass({
    format:'json',
    collectionConfigs:{},
    extendProperty:function(name,params){
      this.parentCall('extendProperty',[name,params]);
      this[name].prototype.app=this.app;
      this[name].prototype.resource=this;
    },
    _$$:function(step){
      var result;
      if(step=='sum'){
        return this.getDataByAction('sum');
      }else if(result=step.match(/^(\d+)$/)){
        return this.getModel(result[1]);
      }else{
        console.error(this,"无法读取step",step,"!");
        return ssys.reject();
      }
      
    },
    /**
     * @param map params,params是map的形式
     */
    createModel:function(params){
      //console.info("resource(",this.name,")开始创建model,params=",params,"[$$.Resource.createModel]");
      var url="/"+this.name+"/create.json";
      var _this=this;
      var args=ssys.mapToList(params,_this.Model.prototype.creationParams);
      return _this.app.post(url,{"SsysCreationParams":ssys.jsonEncode(args)}).pipe(function(tuple){
        //console.info("resource(",_this.name,")成功创建model,tuple=",tuple,"[$$.Resource.createModel]");
        var model=_this.getModelByTuple(tuple);
        _this.afterCreate(model);
        return model;
      });
    },
    afterCreate:function(model){
      var collections=this.collections;
      for(var path in collections){
        var collection=collections[path];
        collection.newModels.push(model);
        for(var name in collection.views){
          var view=collection.views[name];
          view.dataChanged=true;
          if(view.state!="-"){
            view.refresh();
          }
        }
      }
    },
    /**
     * 创建一个没有后端数据的model原型,
     * 用来辅助creation view根据不同原型生成不同的显示逻辑
     */
    createModelArchetype:function(params){
      var tuple=ssys.mapToList(params,this.Model.prototype.attris);
      return this.getModelByTuple(tuple,true);
    },
    /**
     * 用来判断value是不是attributeName 中所有数值中 unique的
     */
    isUnique:function(attributeName,value){
      return this.getDataByAction('isUnique',{attr:attributeName,value:value});
    },
    getAttri:function(id,attributeName){
      var url=id+"/"+attributeName+"."+this.format;
      return this.getDataByUrl(url);
    },
    getModel:function(id){
      if(this.models[id]){
        return ssys.resolve(this.models[id]);
      }
      var url=id+"."+this.format;
      return this.getModelByUrl(url);
    },
    getModelByTuple:function(tuple,isArchetype){
      return this.Model.create(tuple,isArchetype);
    },
    getModelByAttributes:function(attris){
      var url="findByAttributes."+this.format;
      var params={'attris':attris};
      return this.getModelByUrl(url,params);
    },
    getModelByAction:function(action,params){
      var url=action+"."+this.format;
      return this.getModelByUrl(url,params);
    },
    getModelByUrl:function(url,params,xdType){
      var _this=this;
      return this.getDataByUrl(url,params,"get",xdType).pipe(function(tuple){
          var model=_this.getModelByTuple(tuple);
          var modelUrl=model.getUrl();
          url=_this.app.getUrl("/"+_this.name+"/"+url,params);
          //有些时候refresh参数是在外面添加的,也需要去掉
          url=url.replace(/((\?|\&)refresh=\d+$)|refresh=\d+\&/,'');
          ssys.cache[url]="ssys:"+modelUrl;
          ssys.cache[modelUrl]=tuple;
          return model;
      });
    },
    getModelsByAttributeValueSet:function(attributeName,valueSet){
      var url="getItemsByAttributeValueSet."+this.format;
      var params={'attri':attributeName,'set':valueSet};
      return this.getModelsByUrl(url,params,true);
    },
    getModelsByUrl:function(url,params,nocount){
      var _this=this;
      params=params||{};
      if(!params.returnsum){
        return this.getDataByUrl(url,params).pipe(function(tuples){
            return _this.getModelsByTuples(tuples);
        }).pipe(function(models){
          if(nocount){
            models.sum=models.length;
            return models;
          }
          params.returnsum=1;
          return _this.getDataByUrl(url,params).pipe(function(sum){
              models.sum=sum;
              return models;
          });
        });
      }else{
        return this.getDataByUrl(url,params);
      }
    },
    getModelsByTuples:function(tuples){
      var _this=this;
      var models=[];
      for(var i=0,l=tuples.length;i<l;i++){
        var tuple=tuples[i];
        var model=this.getModelByTuple(tuple);
        models.push(model);
      }
      return models;
    },
    getDataByAction:function(action,params,method,xdType){
      var url=action+"."+(method=="post"?'json':this.format);
      return this.getDataByUrl(url,params,method,xdType);
    },
    getDataByUrl:function(url,params,method,xdType){
      url=''+url;//将数字转化成string
      if(url.charAt(0)!=="/"){
        url="/"+this.name+"/"+url;
      }
      if(method=="post"){
        return this.app.post(url,params,true);
      }else{
        return this.app.get(url,params,true,xdType);
      }
    },
    loadByConfig:function(path){
      var matched;
      if(matched=path.match(/^(\d+)$/)){
        return this.getModel(matched[1]);
      }else if(matched=path.match(/^{(.+)}$/)){
        var params=JSON.parse(path);
        if(params.action){
          var action=params.action;
          delete params.action;
          return this.getModelByAction(action,params);
        }else if(params.method){
          var method=params.method;
          delete params.method;
          return this[method](params);
        }else{
          return this.getModelByAttributes(params);
        }
      }else if(matched=path.match(/^([^\[\]]+)(\[([^\[\]]*)\]$)/)){
        var collectionPath=matched[1];
        var collection=this.getCollection(collectionPath);
        if(!matched[3]){
          return collection.fetchSum();
        }else{
          if(typeof matched[3] =="number"){
            var page=matched[3];
            return collection.fetch({page:page});
          }else if(typeof matched[3]=="string"&& matched.match(/^{/)){
            var params=JSON.parse(matched[3]);
            return collection.fetch(params);
          }else{
            return ssys.reject(this.name,"loadByConfig无法识别path=",path,"中的",matched[3],",请检查是否写错了!");
          }
        }
      }else{
        return this.getDataByUrl(path);
      }
    },
    getCollection:function(path){
      return this.collections[path]=this.collections[path]||this.addCollection(path);
    },
    addCollection:function(path){
      var matched;
      if(matched=path.match(/^((@)?\w+)(\{.+$)?/)){
        var name=matched[2]?'Collection':matched[1];
        var params=matched[3];
        if(params){
          params=JSON.parse(params);
        }else{
          params={};
        }
      }else{
        console.error(this.name,"的collection path",path,"书写不符合规范!必须是类似Typename{params1:xx,params2:xxx}这样的形式");
      }
      var config=this.collectionConfigs[name];
      if(config){
        $$.merge(params,config);
      }
      params.path=path;
      return this.Collection.create(params);
        
    },
    deleteAll:function(modelIds){
      return this.getDataByAction('deleteAll',{ids:modelIds});
    }
  },{
    create:function(app,name,params){
      var o=new this;
      app.resources[name]=o;
      o.name=name;
      o.fullname=app.name+"__res_"+name;
      o.app=app;
      o.models={};
      o.views={};
      o.collections={};
      o.extendProperties(params);
      return o;
    }
  },"Resource"
);

