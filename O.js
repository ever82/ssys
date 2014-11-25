$$.O=function(){
};
$$.O.prototype._clearCache=$$.O._clearCache=function(){
  
};
$$.O.prototype.classname=$$.O.classname="$$.O";
$$.O.prototype.$$=$$.O.$$=function(steps){
  if(ssys.isRefresh){
    this._clearCache();
  }
  if(typeof steps=="string"){
    steps=steps.split("/");
  }else if(!$.isArray(steps)){
    console.error("$$能接受的steps只能是string或array of strings!该steps却是",steps);
    return ssys.reject();
  }
  if(steps.length==0){
    return ssys.resolve(this);
  }
  var step=steps.shift();
  var result=this[step]||this.constructor[step];
  var _this=this;
  if(result===undefined){
    if(this["get_"+step]){
      result=this["get_"+step]();
    }else{
      var matched;
      if(matched=step.match(/^#(.+)/)){
        result=ssys[matched[1]];
      }else if(matched=step.match(/^m_(.+)$/)){
        var methodName=matched[1];
        var method=this[methodName];
        if(!method||typeof method !="function"){
          console.error("step书写错误",this,"不存在名为",methodName,"的方法!");
          return ssys.reject();
        }
        result=method.apply(this);
      }else if(this._$$){
        result=this._$$(step);
      }else{
        console.error(this.fullname,"没法读取step",step,"!");
        return ssys.reject();
      }
    }
  }
  if(steps.length>0){
    if(result.$$){
      return result.$$(steps);
    }else{
      if(result.pipe){
        return result.pipe(function(result){
            if(result.$$){
              return result.$$(steps);
            }else{
              console.error(_this,"的",step,"是",result,"它没有$$, 没法继续读读取下几步",steps,"!");
              return ssys.reject();
            }
        });
      }else{
        console.error(this,"的",step,"是",result,"它没有$$, 没法继续读读取下几步",steps,"!");
        return ssys.reject();
      }
    }
  }else{
    if(result.pipe){
      return result;
    }else if(result!==undefined){
      return ssys.resolve(result);
    }else{
      console.error(this.fullname,"没法读取step",step,"!");
      return ssys.reject();
    }
  }
};
$$.O.prototype.eval=function(path){
  return ssys.eval(path,this);
};
/**
 * 用来将config中的$1,$2,...等替换成result[1],result[2],
 * result通常是个regex match的结果
 * config可以是string,也可以是array
 */
$$.O.prototype.parseConfig=function(config,result){
  //console.debug("检测parseConfig","config=",config);
  if(typeof config=="string"){
    if(!config.match(/\$[{\d~]|^m__(\w+)$/)){
      return config;
    }
    if(matched=config.match(/^m__(\w+)$/)){
      var methodName=matched[1];
      var method=this[methodName];
      if(method){
        if(!result){
          config=method.call(this);
        }else{
          config=method.call(this,result[0]);
        }
      }else{
        console.error(this.fullname,"没有找到methodName=",methodName,"的方法, 配置m__有误!");
      }
      return this.parseConfig(config,result);
    }
    if(result){
      for(var k=1,lk=result.length;k<lk;k++){
        var matchedValue=result[k];
        config=config.replace("$"+k,matchedValue);
        //config=config.replace("$l"+k,this.getLabel(matchedValue));
      }
    }
    /*while(result=config.match(/(\$l\{([^}]+)\})/)){
      //console.debug("检测matchedResult","result=",result,"config=",config,"this=",this);
      var path=result[2];
      config=config.replace(result[1],this.getLabel(this.eval(path)));
    }*/
    while(result=config.match(/(\$\{([^}]+)\})/)){
      var value=this.eval(result[2]);
      if(value===null||value===undefined){
        value='';
      }
      var typeofValue=typeof value;
      if(typeofValue.match(/string|number/)){
        config=config.replace(result[1],value);
        if(config===''+value+'' && typeofValue=="number"){
          config=value;
          break;
        }
      }else{
        config=this.parseConfig(value);
        break;
      }
    }
    if(typeof config=="string"){
      config=config.replace(/\$~/g,'$');//用来传递${} template
    }
  /*}else if($.isArray(config)){
    config=config.slice(0);//为了不破坏原来的config
    for(var i=0,l=config.length;i<l;i++){
      var configi=config[i];
      config[i]=this.parseConfig(configi,result);
    }*/
  }else if(typeof config=="object"&& config!==null){
    var origin=config;
    if($.isArray(origin)){
      var config=[];
    }else if(origin.constructor===Object){
      var config={};
    }else{
      return origin;
    }
    for(var key in origin){
      if(origin[key] instanceof RegExp){
        return origin;
      }
      config[key]=this.parseConfig(origin[key],result);
    }
  }
  return config;
};

$$.O.prototype.parentCall=function(methodName,args){
  var callingParent=this.callingParent;
  var _self=callingParent||this.self;
  var _super=_self.superclass;
  this.callingParent=_super;
  var parentMethod=_super.prototype[methodName];
  while(parentMethod===_self.prototype[methodName]){
    if(_super.superclass){
      _super=_super.superclass;
      parentMethod=_super.prototype[methodName];
      this.callingParent=_super;
    }else{
      return console.error(this,"parentCall(",methodName,")失败了!this.callingParent=",this.callingParent);
    }
  }
  try{
    var result=parentMethod.apply(this,args||[]);
    this.callingParent=null;
  }catch(e){
    this.callingParent=null;
    throw e;
  }
  return result;
};
$$.O.prototype.extendProperty=function(propertyName,params){
  var sup=this.self[propertyName];
  if(!sup){
    console.error(this.fullname,"要扩展的属性",propertyName,"失败了!原因是不存在被继承的父类");
  }
  if($.isArray(params)){
    params[2]="@"+this.fullname;
  }else{
    params=[params,null,"@"+this.fullname];
  }
  var property=this[propertyName]=this.self[propertyName].createSubclass(params);
  property.host=this;
};
$$.O.prototype.extendProperties=function(params){
  for(var name in params){
    var matched;
    if(matched=name.match(/^xp_(.+)$/)){
      this.extendProperty(matched[1],params[name]);
    }else{
      this[name]=params[name];
    }
  }
};
$$.O.create=function(){
  return new this();
};
$$.O.addPrototypeContent=function(newPrototype,oldPrototype){
  var ps=this.getPrototypes(newPrototype);
  var ps2=this.getPrototypes(oldPrototype);
  for(var i=0,l=ps2.length;i<l;i++){
    var p=ps2[i];
    if($.inArray(p,ps)!=-1){
      break;
    }
    for(var key in p){
      if(key=="__proto__"||key=="constructor"||key=="self"){
        continue;
      }
      var matched;
      var value=p[key];
      //标有mg_前缀的属性会跟父类的该属性合并
      if(matched=key.match(/^mg_(.+)$/)){
        key=matched[1];
        value=ssys.merge(value,newPrototype[key]);
      }
      newPrototype[key]=value;
    }
  }
  
};
$$.O.getPrototypes=function(p){
  p=p||this.prototype;
  var ps=[];
  while(p){
    ps.push(p);
    p=p.__proto__;
  }
  return ps;
};
$$.O.createSubclass=function(prototypeContent,staticContent,name,parents){
  //console.info(this.classname,this,"开始创建子类",prototypeContent,staticContent,name,parents);
  prototypeContent=prototypeContent||{};
  if($.isArray(prototypeContent)){
    staticContent=prototypeContent[1];
    name=prototypeContent[2];
    parents=prototypeContent[3];
    prototypeContent=prototypeContent[0];
  }
  staticContent=staticContent||{};
  var subclass=function(){};
  //var f=function(){};
  //这相当于不要this类的constructor,只要它的prototype
  //f.prototype=this.prototype;
  //f.prototype.constructor=this;
  var prototype=new this();
  subclass.prototype=prototype;
  if(parents){
    for(var i=0,l=parents.length;i<l;i++){
      var parentClass=parents[i];
      this.addPrototypeContent(prototype,parentClass.prototype);
    }
  }
  for(var key in prototypeContent){
    var matched;
    var value=prototypeContent[key];
    //标有mg_前缀的属性会跟父类的该属性合并
    if(matched=key.match(/^mg_(.+)$/)){
      key=matched[1];
      value=ssys.merge(value,this.prototype[key]);
    }
    prototype[key]=value;
  }
  //prototype.constructor=subclass;
  prototype.sup=new this();
  prototype.self=subclass;
  for(var key in this){
    subclass[key]=this[key];
  }
  var subsubclasses= {};
  for(var key in staticContent){
    var matched;
    value=staticContent[key];
    if(matched=key.match(/^(ex_|xp_)(.+)$/)){
      key=matched[2];
      var prefix=matched[1];
      var parentClass=this[key];
      if(parentClass){
        if(prefix=="xp_"){
          //说明继承的是property
          var parents=[];
        }else{
          //说明继承的是class, 以this为主继承, 以parentClass作为副继承
          var parents=[parentClass];
          parentClass=subclass;
        }
        if($.isArray(value)){
          value[2]=key;
          value[3]=value[3]?value[3].concat(parents):parents;
        }else{
          value=[value,null,key,parents];
        }
        value=parentClass.createSubclass(value);
      }else{
        //为了避免继承顺序打结,需要将subclass的subclass的创建排在最后
        subsubclasses[key]=value;
      }
    }
    subclass[key]=value;
  }
  subclass.superclass=this;
  if(name){
    this[name]=subclass;
    this.subclasses[name]=subclass;
    subclass.classname=subclass.prototype.classname=this.classname+"/"+name;
    subclass.shortClassname=subclass.prototype.shortClassname=name;
  }
  for(var key in subsubclasses){
    var value = subsubclasses[key];
    var parentClass=subclass;
    if(typeof value =="function"){
      //说明它已经是个class
      value=[null,null,key,[value]];
    }
    if($.isArray(value)){
      value=parentClass.createSubclass(value[0],value[1],key,value[3]);
    }else{
      value=parentClass.createSubclass(value,null,key);
    }
    subsubclasses[key]=subclass[key]=value;
  }
  subclass.subclasses=subsubclasses;
  return subclass;
};
$$.O.extendProperty=function(propertyName,prototypeContent,staticContent){
  this[propertyName]=this[propertyName].createSubclass(prototypeContent,staticContent);
  return this;
};
$$.O.subclasses={};
