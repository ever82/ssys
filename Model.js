$$.Model=$$.Resource.Model=$$.O.createSubclass({
    creationParams:[],
    attris:['id'],
    implAttris:null,
    //用来处理轻量级的impl 分类, 这时这些分类没有后端对应类, 只有前端有
    //这时的typedata对后端来说是作为一个整体的,后端并不知道typedata内的细节
    //所以就不能单独修改一个implAttri的值,但很多时候这就足够了
    implAttrisConfigs:null,
    defaultValues:{},
    validationRules:{},
    uneditable:['id','creator_id','updated_at','created_at'],
    editableRoles:['creator','owner','admin'],
    relations:{},
    _clearCache:function(){
      var relations=this.relations;
      for(var key in relations){
        var relation = relations[key];
        //console.debug("","key=",key);
        delete this[key];
        delete this["many__"+key];
        delete this["count__many__"+key];
      }
    },
    _$$:function(step){
      var relationConfig;
      var matched;
      var _this=this;
      if(relationConfig=this.relations[step]){
        //console.debug("","step=",step,"relationConfig=",relationConfig);
        relationConfig=this.parseConfig(relationConfig);
        var relationType=relationConfig.shift();
        if(relationType=='hasMany'&&!relationConfig[2]){
          relationConfig[2]={};
        }
        relationConfig.push(args);
        relationConfig.unshift(step);
        return this[relationType].apply(this,relationConfig);
      }else if(matched=step.match(/^count__(.+)/)){
        var relation=matched[1];
        var relationConfig=this.relations[relation];
        relationConfig=this.parseConfig(relationConfig);
        var relationType=relationConfig.shift();
        if(relationType=='hasMany'&&!relationConfig[2]){
          relationConfig[2]={};
        }
        relationConfig.push(args);
        relationConfig.unshift(relation);
        return this["count_"+relationType].apply(this,relationConfig);
      }else{
        return $$.reject();
      }
    },
    get_uri:function(){
      return '#'+this.resource.name+'Resource/'+this.id;
    },
    get_subjecttype:function(){
      return $$.capitalize(this.resource.name);
    },
    
    /**
     * @param array args 用来放[page,limit,order,condition]
     */
    hasMany:function(name,resourcePath,foreignKey,attris,args){
      var results=this["many__"+name]||{};
      args=args||[];
      args[0]=args[0]||1;
      args[1]=args[1]||20;
      args[2]=args[2]||'';//表示order
      args[3]=args[3]||'';//表示condition
      args[4]=args[4]||false;//表示returnsum
      args[5]=args[5]||false;//表示nocount
      var cacheName=JSON.stringify(args);
      if(results[cacheName]&&!$$.isRefresh){
        return $$.resolve(results[cacheName]);
      }
      attris=attris||{};
      attris[foreignKey]=this.id;
      args.unshift(attris);
      var _this=this;
      //console.debug("hasMany","resourcePath=",resourcePath,"foreignKey=",foreignKey,"args=",args);
      return this.$$(resourcePath+"/m_getModelsByAttributes",args).pipe(function(models){
          results[cacheName]=models;
          _this["many__"+name]=results;
          return models;
      });
    },
    count_hasMany:function(name,resourcePath,foreignKey,attris,args){
      var count=this["count__many__"+name];
      if(count&&!$$.isRefresh){
        return $$.resolve(count);
      }
      if(args){
        args=this.parseConfig(args);
      }else{
        args=[];
      }
      attris=attris||{};
      attris[foreignKey]=this.id;
      args.unshift(attris);
      args[5]=1;
      var _this=this;
      return this.$$(resourcePath+"/m_getModelsByAttributes",args).pipe(function(count){
          return _this["count__many__"+name]=count;
      });
    },
    manyAction:function(name,resourcePath,actionName,params,args){
      var results=this["many__"+name]||{};
      args=args||[];
      var page=args[0]||1;
      if(results[page]&&!$$.isRefresh){
        return $$.resolve(results[page]);
      }
      params=$$.merge(params||{},{page:page,limit:args[1]||20,order:args[2]||''});
      var _this=this;
      return this.$$(resourcePath+"/m_getModelsByAction",[actionName,params]).pipe(function(models){
          results[page]=models;
          _this["many__"+name]=results;
          return models;
      });
      
    },
    count_manyAction:function(name,resourcePath,actionName,params){
      var count=this["count__many__"+name];
      if(count&&!$$.isRefresh){
        return $$.resolve(count);
      }
      var params=params||{};
      params.returnsum=1;
      var _this=this;
      return this.$$(resourcePath+"/m_getModelsByAction",[actionName,params]).pipe(function(count){
          return _this["count__many__"+name]=parseInt(count);
      });
    },
    belongTo:function(name,resourcePath,foreignKey){
      var _this=this;
      return this.$$(resourcePath+"/"+this[foreignKey]).pipe(function(result){
          return _this[name]=result;
      });
    },
    impl:function(){
      if(this.typedata){
        if(!this.implAttris){
          this.implAttris=this.implAttrisConfigs[this.typename];
        }
        for(var i=0,l=this.implAttris.length;i<l;i++){
          var attri=this.implAttris[i];
          this[attri]=this.typedata[i];
        }
      }
    },
    init:function(){
        if(this.id){
          this._clearCache();
        }
      //这会被override
    },
    save:function(){
      var _this=this;
      return this.validate().pipe(function(attributesToSave){
          //console.debug("","attributesToSave=",attributesToSave);
          if(_this.id){
            return _this.resource.getDataByAction('update',{id:_this.id,SsysUpdateParams:$$.jsonEncode(attributesToSave)},'post')
            .pipe(function(tuple){
              $$.cache[_this.getUrl()]=tuple;
              if(_this.typename){
                if(_this.typename==_this.shortClassname){
                  return _this.pull(tuple);
                }else{
                  return _this.resource.modelClass[_this.typename].create(tuple);
                }
              }else{
                return _this.pull(tuple);
              }
            });
          }else{
            //console.info("创建model的参数",attributesToSave,"通过了验证","[$$.Resource.createModel]");
            var implAttris=_this.implAttris||[];
            var typedata=[];
            for(var i=0,l=implAttris.length;i<l;i++){
              var name=implAttris[i];
              var value=attributesToSave[name];
              typedata[i]=value;
            }
            attributesToSave.typedata=typedata;
            return _this.resource.createModel(attributesToSave);
          }
      });
    },
    getAttributesToSave:function(){
      var attributesToSave={};
      if(this.id){
        var origin=this.resource.models[this.id];
        var attris=this.attris;
        var tuple=origin.tuple;
        for(var i=0,l=attris.length;i<l;i++){
          var name=attris[i];
          var value =this[name];
          if(value!= tuple[i]){
            attributesToSave[name]=value;
          }
        }
      }else{
        var attris=this.creationParams;
        for(var i=0,l=attris.length;i<l;i++){
          var attrName=attris[i];
          attributesToSave[attrName]=this[attrName];
        }
      }
      return attributesToSave;
    },
    /**
     * 这不单负责检验输入params是否符合约束条件,
     * 还会将一些输入数据转化成符合条件的形式,
     * 比如会将输入的model名称转化为model的id
     */
    validate:function(params,rules){
      params=params||this.getAttributesToSave();
      rules=rules||this.validationRules;
      //console.info("model开始validate参数,params=",params,"rules=",rules,"[$$.Resource.validate]");
      var _this=this;
      var d=$$.resolve();
      var errors=null;
      var d=$$.loopDefer(params,null,function(item){
          var name=item[0];
          var data=item[1];
          var rule = rules[name];
          if(!rule){
            return $$.resolve(params);
          }
          console.debug("开始验证,name=",name,"data=",data,"rule=",rule);
          var dataType=rule[0];
          var options=rule[1]||{};
          var result=_this["validate"+dataType](name,data,options,params);
          /**
            *@rule:所有validator如果不返回结果就说明是通过了
            */
          if(result){
            if(typeof result=="string"){
              errors=errors||{};
              errors[name]=result;
              return $$.reject(errors);
            }else if(result.pipe){
              return result.pipe(function(result){
                return result
              },function(error){
                  errors=errors||{};
                  errors[name]=error;
                  return errors;
              });
            }else{
              return $$.reject(_this,"对",name,"的validator(",dataType,")返回的结果不对!只能是string或deferred object");
            }
          }
          return $$.resolve();
      });
      return d.pipe(function(){
          if(errors){
            return $$.reject(errors);
          }
          return params;
      });
    },
    validateNotNull:function(attributeName,data){
      console.debug("validateNotNuall","attributeName=",attributeName,"data=",data);
      if(data===''||data===null||data===undefined){
        return 'empty';
      }
    },
    validateUnique:function(attributeName,data){
      return this.resource.isUnique(attributeName,data).pipe(function(isUnique){
        if(!isUnique){
          return $$.reject("notUnique");
        }
      });
      
    },
    validateEmail:function(attributeName,data,options){
      $$.merge(options,{isUnique:true,isNull:false});
      var _this=this;
      return this.validateString(attributeName,data,options).pipe(function(){
          if(data.match(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)){
            return data;
          }else{
            return $$.reject('notEmail');
          }
      });
    },
    validateUrl:function(attributeName,data,options){
      $$.merge(options,{isNull:false,max:2000});
      var _this=this;
      return this.validateString(attributeName,data,options).pipe(function(){
          if(!data.match(/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/)){
            return $$.reject('notUrl');
          }
      });
    },
    validateString:function(attributeName,data,options){
      if(!data){
        if(!options.isNull){
          var error=this.validateNotNull(attributeName,data);
          if(error){
            return error;
          }
        }
      }
      if(typeof data=="string"){
        var max=options.max;
        if(max){
          if(data.length>max){
            return {errorType:'tooLong',errorContent:max};
          }
        }
        var _this=this;
        if(options.isUnique){
          return this.validateUnique(attributeName,data);
        }
        return $$.resolve(data);
      }else{
        console.error(this.fullname,"的",attributeName,"=",data,"没通过validateString验证!");
        return $$.reject({error:"该数据"+JSON.stringify(data)+"不是String"});
      }
    },
    validateNumber:function(attributeName,data,options,params){
      if(!data){
        if(!options.isNull){
          var error=this.validateNotNull(attributeName,data);
          if(error){
            return error;
          }
        }
      }
      if(!options.isInt){
        data=parseInt(data);
      }else{
        data=parseFloat(data);
      }
      params[attributeName]=data;
      if(data||data===0){
        var validator=options.validator;
        if(validator){
          return this[validator](data,params,result,attributeName);
        }
        if(options.max!==undefined&&data>options.max){
          return "tooBig";
        }
        if(options.min!==undefined&&data<options.min){
          return "tooSmall";
        }
      }else{
        return "notNumber";
      }
    },
    validateModel:function(attributeName,data,options,params){
      var _this=this;
      var result={name:attributeName};
      if(!data){
        if(isNull=="Null"){
          return $$.resolve(result);
        }
        result.error="这是必填项";
        return $$.reject(result);
      }
      var d=this.app.getResource(resourceName);
      
      var datatype=typeof data;
      if(datatype == "string" || datatype=="number"){
        var modelId=parseInt(data);
        d=d.pipe(function(resource){
          return resource.getModel(modelId);
        });
      }else if(datatype == "object"){
        var attributes=data;
        d=d.pipe(function(resource){
            return resource.getModelByAttributes(attributes);
        });
      }
      return d.pipe(function(model){
          if(validator){
            return _this[validator](data,params,result,attributeName);
          }else{
            result.data=model.id;
            return result;
          }
      },function(){
        result.error="没有找到对应的数据";
        return result;
      });
    },
    isEditable:function(attributeName){
      var role=this.getUserRelation();
      if($.inArray(role,this.editableRoles)>-1){
        if(!attributeName){
          return true;
        }
        if($.inArray(attributeName,this.uneditable)==-1){
          return true;
        }else{
          return false;
        }
      }else{
        return false;
      }
    },
    update:function(params){
      var _this=this;
      return this.validate(params).pipe(function(){
      var url="/"+_this.resource.name+"/update.json";
      return _this.app.post(url,{id:_this.id,SsysUpdateParams:$$.jsonEncode(params)}).pipe(function(tuple){
          //console.info("resource(",_this.name,")成功创建model,tuple=",tuple,"[$$.Resource.createModel]");
          $$.cache[_this.getUrl()]=tuple;
          if(_this.typename==_this.shortClassname||!_this.typename){
            return _this.pull(tuple);
          }else{
            return _this.resource.modelClass[_this.typename].create(tuple);
          }
        });
      });
    },
    getUrl:function(){
      if(this.app.isWidget){
        return this.app.baseUrl+this.resource.name+"/"+this.id+"."+this.app.format;
      }else{
        return "/"+this.resource.name+"/"+this.id+"."+this.app.format;
      }
    },
    /**
     * 从服务器端获取最新的数据,更新自身
     */
    pull:function(tuple){
      var _this=this;
      if(tuple){
        _this.setTuple(tuple);
        _this.init();
        if(this!==this.resource.models[this.id]){
          _this.resource.models[_this.id].pull(tuple);
        }
        return $$.resolve(_this);
      }
      return this.resource.getDataByUrl(this.id,{refresh:$.now()}).pipe(function(tuple){
          _this.setTuple(tuple);
          _this.init();
          if(_this!==_this.resource.models[_this.id]){
            _this.resource.models[_this.id].pull(tuple);
          }
          return _this;
      });
    },
    setTuple:function(tuple){
      if(!tuple.splice){
        console.error(this,"setTuple出错!tuple必须是array.tuple=",tuple);
        return;
      }
      this.tuple=tuple;
      for(var i in tuple){
        var name=this.attris[i];
        this[name]=tuple[i];
      }
      if(typeof this.id=='string'){
        this.id=parseInt(this.id);
      }
      if(this.implAttris){
        this.impl();
      }
      
    },
    getUserRelation:function(){
      var currentUser=this.app.currentUser;
      if(this.userRelation===undefined){
        if(!currentUser.id){
          var relation='guest';
        }else if(currentUser.id==this.creator_id){
          var relation='creator';
        }else if(currentUser.userModel.role=='admin'){
          var relation='admin';
        }else{
          var relation=this._getUserRelation(currentUser);
        }
        this.userRelation=relation;
      }
     return this.userRelation;
    },
    _getUserRelation:function(currentUser){
      return null;//this.resource.getDataByAction("getUserRelation", {id:parseInt(this.id)});
    },
    getModelViewClass:function(){
      return this.ModelView=this.resource.ModelView;
    },
    createArchetype:function(){
      var origin=this.resource.models[this.id];
      if(this.typename!=origin.typename){
        this.typedata=null;
      }
      var tuple=$$.mapToList(this,this.attris);
      var archetype=this.resource.getModelByTuple(tuple,true);
      archetype.isArchetype=true;
      return archetype;
    }
  },{
    create:function(tuple,isArchetype){
      if(!isArchetype){
        var id=tuple[0];
        o=new this;
        if(o.resource.models[id]){
          return o.resource.models[id];
        }
      }else{
        var o=new this;
      }
      o.setTuple(tuple);
      o.fullAttris=o.attris.concat(o.implAttris||[]);
      o.init();
      if(!isArchetype){
        o.resource.models[o.id]=o;
      }
      return o;
    }
},"Model");
