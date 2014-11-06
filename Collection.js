$$.Collection=$$.Resource.Collection=$$.O.createSubclass({
    format:"json",
    limit:20,
    update:function(){
      
    },
    sort:function(){
      
    },
    storeModels:function(page,models){
      return this.cache[page]=models;
      //以后会对一些复杂的collection(比如tree)进行更复杂的cache处理
    },
    getModels:function(page){
      if(this.cache[page]){
        return this.cache[page];
      }else{
        console.error(this,"第",page,"页的数据为空!请检查是否已经加载了该页.");
      }
    },
    getModel:function(page,index){
      var models=this.getModels(page);
      if(models[index]){
        return models[index];
      }else{
        console.error(this,"第",page,"页上不存在第",index,"个model!");
      }
    },
    fetch:function(page){
      console.debug("fetch","page=",page);
      var _this=this;
      this.handleUpdate();
      return $$.dfdget(this.cache[page],function(){
          return _this._fetch(page).pipe(function(models){
              _this.storeModels(page,models);
            return models;
          });
      });
    },
    handleUpdate:function(){
      console.debug("","this.newModels.length=",this.newModels.length);
      if(this.newModels.length){
        /*if(this.attris){
          for(var i=0,l=this.newModels.length;i<l;i++){
            var model=this.newModels[i];
            
          }
        }*/
        this.cache={};
        this.newModels=[];
      }
    },
    _fetch:function(page){
      console.debug("_fetch",page);
      var attris=this.attris;
      var params={page:page||1,limit:this.limit||20,order:this.order||'id',condition:this.condition||''};
      if(attris){
        var url="getItemsByAttributes."+this.format;
        params.attris=attris;
      }else if(this.action){
        var url=this.action+"."+this.format;
        $$.merge(params,this.params);
      }else{
        console.error("目前只支持attris和action两种类型的collection!");
      }
      
      return this.resource.getModelsByUrl(url,params);
    },
    fetchSum:function(){
      var _this=this;
      if(this.attris){
        var url="getItemsByAttributes."+this.format;
        var params={attris:this.attris,returnsum:1};
      }else if(this.action){
        var url=this.action+"."+this.format;
        var params=$$.clone(this.params);
        params.returnsum=1;
      }else{
        console.error(this,"fetchSum出错了!还未为这个类型的collection写怎么fetchSum逻辑");
      }
      return this.resource.getDataByUrl(url,params).pipe(function(sum){
        return _this.sum=sum;
      });
    }

},{
  create:function(params){
    params=params||{};
    o=new this;
    o.newModels=[];
    if(params.action){
      o.action=params.action;
      delete params.action;
    }else{
      o.attris=params.attris||{};
      delete params.attris;
    }
    if(params.path){
      var path=params.path;
      delete params.path;
    }else{
      if(o.action){
        var path="a_"+o.action;
      }else if(o.attris){
        var path="attris";
      }
      var key=JSON.stringify(params);
      if(key!="{}"){
        path=path+key;
      }
    }
    var resource=o.resource;
    if(!resource){
      console.error(o,"的resource不存在!请检查该resource的定义代码有无错误");
    }
    if(resource.collections[path]){
      return resource.collections[path];
    }
    o.params=params;
    for(var k in params){
      o[k]=params[k];
    }
    o.cache={};
    o.views={};
    resource.collections[path]=o;
    return o;
  }
},"Collection");
