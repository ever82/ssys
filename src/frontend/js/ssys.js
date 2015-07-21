/**
 * 用这个接口可以获取所有资源
 * @param string path,表示资源路径
 * @param array args,如果资源是一个函数调用,args表示该函数的调用参数
 */
window.ssys=window.$$=function(path,args){
  var steps=path.split("/");
  var step=steps.shift();
  var o=ssys[step];
  return o.$$(steps,args);
};
ssys.sresBaseUrl="static/";//这个在index.html中设置
ssys.cache={};
ssys.appClasses={};
ssys.views={};
ssys.preloading=false;//表示当前加载的资源都是在预加载中
ssys.loading=false;//表示页面在加载中
ssys.assert=function(condition,error){
  if(!condition){
    throw error;
  }
};
ssys.refresh=function(){
  ssys.views={};
  ssys.cache=[];
  
};
ssys.getStorage=function(name){
  var value=sessionStorage.getItem(name);
  if(value===undefined||value===null){
    value=localStorage.getItem(name);
    if(value!==undefined&&value!==null){
      value=JSON.parse(value);
      if(value.expires_at>$.now()){
        value=value.value;
      }else{
        localStorage.removeItem(name);
        return;
      }
    }else{
      return;
    }
  }else{
    value=JSON.parse(value);
  }
  return value;
};
ssys.setStorage=function(name,value,expires_at){
  try{
    if(expires_at){
      localStorage.setItem(name,JSON.stringify({value:value,expires_at:expires_at}));
    }else{
      sessionStorage.setItem(name,JSON.stringify(value));
    }
  }catch(e){
    /**
     * @Todo 
     */
  }
};
ssys.addClass=function(dom,classes){
    /*var classes = classes.split(' '),
      i = 0,
      ii = classes.length;

    for(i; i<ii; i++) {
        dom.classList.add(classes[i]);
    }*/
    dom.className+=" "+classes;

};
ssys.capitalize=function(str){
  return str.charAt(0).toUpperCase() + str.slice(1);
};
ssys.timeToString=function(timestamp,format){
  var t=new Date(parseInt(timestamp)*1000);
  //format=format||'yyyy-MM-dd HH:mm';
  var month=t.getMonth()+1;
  var date=t.getDate();
  var hours=t.getHours();
  if(hours<10){
    hours='0'+hours;
  }
  var minutes=t.getMinutes();
  if(minutes<10){
    minutes='0'+minutes;
  }
  var t=new Date();
  var result=month+"月"+date+"日 "+hours+":"+minutes;
  var year=t.getFullYear();
  if(t.getFullYear()!=year){
    result=year+"年"+result;
  }
  return result;
};
ssys.moveDom=function(dom,at,to){
  if(!at||at=="append"){
    to.appendChild(dom);
  }else if(at=="prepend"){
    to.insertBefore(dom,to.firstChild);
  }else if(at=="before"){
    to.parentNode.insertBefore(dom,to);
  }else if(at=="after"){
    to.parentNode.insertBefore(dom, to.nextSibling);
  }else if(at=="self"){
    to.parentNode.insertBefore(dom,to);
    /*while (to.childNodes.length > 0) {
      dom.appendChild(to.childNodes[0]);
    }*/
    to.parentNode.removeChild(to);
  }
};

ssys.parseTemplate=function(template,interpreter){
  /*if(matched=template.match(/^m__(\w+)$/)){
    var methodName=matched[1];
    template=interpreter[methodName].call(interpreter,result);
    return this.parseTemplate(template,interpreter);
  }*/
  while(result=template.match(/(\$\{([^}]+)\})/)){
    var value=ssys.eval(result[2],interpreter);
    var typeofValue=typeof value;
    if(typeofValue.match(/string|number/)){
      template=template.replace(result[1],value);
    }else{
      template=value;
      break;
    }
  }
  return template;
};
ssys.divide=function(str,separator){
  if(str.match(new RegExp("\\"+separator))){
    return str.split(new RegExp("^([^"+separator+"]*)"+separator)).slice(1);
  }else{
    return [str,''];
  }
};
ssys.eval=function(path,obj){
  var matched;
  if(path=='this'){
    return obj;
  }else if(matched=path.match(/^"(.*)"$/)){
    return matched[1];
  }
  if(matched=path.match(/^'([^']*)'$/)){
    return matched[1];
  }
  var steps=path.split(".");
  var origin=obj;
  while(steps.length && obj){
    var oldObj=obj;
    var step=steps.shift();
    obj=obj[step];
    if(obj===undefined){
      if(matched=step.match(/^(\w+)\(\)$/)){
        obj=oldObj[matched[1]];
      }else{
        obj=oldObj["get_"+step];
      }
      if(typeof obj=="function"){
        obj=obj.call(oldObj);
      }else{
        if(typeof origin=="function"){
          console.error(origin.classname,"eval",path,"出错,在step=",step,"时失败了!");
        }else{
          console.error(origin,origin.fullname||origin.name,"eval",path,"出错,在step=",step,"时失败了!");
        }
      }
    }
  }
  return obj;
};
ssys.jsonEncode=function(val){
  var encoded=JSON.stringify(val);
  return encoded;
};
/*ssys.clone=function(arr){
  if($.isArray(arr)){
    var result=[];
    for(var i=0,l=arr.length;i<l;i++){
      result[i]=ssys.clone(arr[i]);
    }
    return result;
  }else{
    return arr;
  }
};*/
ssys.capitalize=function(str){
  return str.charAt(0).toUpperCase() + str.substr(1);
};
ssys.clone=function(obj){
  if(typeof obj=="object"&& obj!==null){
    if($.isArray(obj)){
      var result=[];
    }else if(obj.constructor===Object){
      var result={};
    }else{
      return obj;
    }
    for(var key in obj){
      result[key]=ssys.clone(obj[key]);
    }
    return result;
  }else{
    return obj;
  }
};
ssys.isIE=function(){
  return navigator.appName === 'Microsoft Internet Explorer';
};
ssys.traverse=function(arr,todo){
  if($.isArray(arr)){
    var result=[];
    for(var i=0,l=arr.length;i<l;i++){
      var a=arr[i];
      result[i]=ssys.traverse(a,todo);
    }
    return result;
  }else{
    return todo(arr);
  }
};
ssys.removeUndefined=function(map){
  for(var key in map){
    var value = map[key];
    if(value===undefined){
      delete map[key];
    }
  }
  return map;
};
ssys.mapToList=function(map,names){
  var list=[];
  for(var i=0,l=names.length;i<l;i++){
    var name=names[i];
    list[i]=map[name]===undefined?null:map[name];
  }
  return list;
};
ssys.resolve=function(result){
  return $.Deferred().resolve(result);
};
ssys.updateObject=function(origin,updatedContent){
  origin=origin||{};
  for(var key in updatedContent){
    var value = updatedContent[key];
    if(value==="ssysDelete"){
      delete origin[key];
    }else{
      origin[key]=value;
    }
  }
  return origin;
};
ssys.merge=function(newObject,prototype){
  if(newObject&&prototype){
    if($.isArray(newObject)){
      newObject=newObject.concat(prototype);
    }else{
      for(var key in prototype){
        var value = prototype[key];
        var newValue=newObject[key];
        if(newValue===undefined){
          newObject[key]=value;
        }else if(typeof value=="object"&&typeof newValue=="object"){
          ssys.merge(newValue,value);
        }
      }
    }
  }
  return newObject;
};
ssys.toArray=function(map){
  var arr=[];
  if($.isArray(map)){
    return map;
  }
  for(var name in map){
    var value = map[name];
    arr.push([name,value]);
  }
  return arr;
};
/**
 * @param initResult  通常为[],
 * 如果loopDefer不返回结果,它就为null
 */
ssys.loopDefer=function(arr,initResult,pass,fail){
  var i=0;
  arr=ssys.toArray(arr);
  var passLoop=function(result){
    if(i<arr.length){
      var a=arr[i];
      i++;
      return pass(a,result,i).pipe(passLoop,function(failResult){
          console.error("loopDefer(",arr,")在第",i,"项=",a,"出错了!返回的是:",failResult);
          if(fail){
            return fail(i,a,failResult);
          }else{
            return failResult;
          }
      });
    }else if(arr.length==0){
      return $.Deferred().resolve(result);
    }else{
      return result;
    }
  }
  return passLoop(initResult);
};
ssys.asyncLoopDefer=function(arr,pass,fail){
  var returned=0;
  var failed=0;
  var dfd=$.Deferred();
  arr=$$.toArray(arr);
  if(arr.length==0){
    return dfd.resolve();
  }
  for(var i=0,l=arr.length;i<l;i++){
    var a=arr[i];
    pass(a,i).pipe(function(){
        returned++;
        if(returned==l){
          if(failed==0){
            return dfd.resolve();
          }else{
            return dfd.reject(failed);
          }
        }
    },function(failResult){
      returned++;
      failed++;
      if(fail){
        fail(a,i,failResult);
      }
      if(returned==l){
        return dfd.reject(failed);
      }
    });
  }
  return dfd;
};
ssys.reject=function(reason){
  if(console['warn']){
    if(console['warn'].apply){
      console.warn.apply(console,arguments);
    }else{
      //ie不支持 console.warn.apply
      console.warn(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4],arguments[5],arguments[6]);
    }
  }
  return $.Deferred().reject(reason);
};
ssys.dfdget=function(data,func){
  if(data){
    return ssys.resolve(data);
  }
  return func();
};
ssys.getParams=function(url){
  var result = {};
  var query=url.slice(url.indexOf("?")+1);
  query.split("&").forEach(function(part) {
    var item = part.split("=");
    result[item[0]] = decodeURIComponent(item[1]);
  });
  return result;
};
ssys.addParams=function(url,params){
  if(!url.match(/\?/)){
    url=url+"?";
  }
  for(var key in params){
    var value=params[key];
    var valueType=typeof value;
    if(!valueType.match(/string|number/)){
      value=ssys.jsonEncode(value);
    }
    if(url.match(/\?$/)){
      url+=key+"="+value;
    }else{
      var regex=new RegExp(key+"=[^&]+");
      if(url.match(regex)){
        url.replace(regex,key+"="+value);
      }else{
        url+="&"+key+"="+value;
      }
    }
  }
  return url;
};
ssys.xhrget=function(url,isCrossDomain){
  if(navigator.appName === 'Microsoft Internet Explorer'){
    url=encodeURI(url);
  }
  return $.ajax({
    type: 'GET',
    url: url,
    dataType: "json",
    crossDomain: isCrossDomain,
    timeout:120000,
    xhrFields: {
      withCredentials: true
    }
  });
  
};
ssys.xhrpost=function(url,params,isData,isCrossDomain){
  if(!isCrossDomain){
    return $.ajax({
      type: 'POST',
      url: url,
      data: params,
      dataType: "json"
    });
  }else{
    return $.ajax({
      type: 'POST',
      url: url,
      crossDomain: true,
      data: params,
      dataType: "json",
      xhrFields: {
        withCredentials: true
      }
    });
  }
};
window.jsonp=function(data){
  return data;
};
ssys.getJsonp=function(url,uncache){
  if(navigator.appName === 'Microsoft Internet Explorer'){
    url=encodeURI(url);
  }
  return $.ajax({
      cache:!uncache,
      dataType:"jsonp",
      timeout:20000,
      jsonp:false,
      jsonpCallback:"jsonp",
      url:url,
      error:function(){
        console.error("[ssys.getJsonp],failed to get url:",url);
      }
  });
  
};
ssys.globalDfds=[];
ssys.pendingDfdCount=0;
ssys.parseUrl=function(url){
  if(url.match(/^\./)){
    url=url.replace(/^\./,ssys.sresBaseUrl);
  }else if(url.match(/^\$\$/)){
    url=url.replace(/^\$\$/,ssys.baseUrl);
  }
  return url;
};
ssys.getJs=function(url,uncache,loaded){
  url=ssys.parseUrl(url);
  //如果承认cache的话,就要先检查以前是否加载过同样的js脚本
  if(!uncache && (ssys.cache[url]||loaded)){
    return ssys.resolve();
  }
  if(!uncache){
    //为了防止同时间下载多次同一个js file, 可提前将cache[url]设为true
    //如果本次下载失败再设为false
    ssys.cache[url]=true;
  }
  return $.ajax({
    cache:!uncache,
    dataType:"script",
    timeout:20000,
    url:url,
    success:function(){
      ssys.cache[url]=true;
    },
    error:function(jqXHR,textStatus,errorThrown){
      ssys.cache[url]=false;
      console.error("加载url=",url,"脚本出错了!",jqXHR,textStatus,errorThrown);
    }
  });
};
ssys._getJs=function(url,uncache){
  return $.ajax({
    cache:!uncache,
    dataType:"script",
    timeout:20000,
    url:url,
    success:function(){
      ssys.cache[url]=true;
      ssys.pendingDfdCount--;
      if(ssys.pendingDfdCount==0){
        ssys.globalDfd.resolve();
      }
    },
    error:function(jqXHR,textStatus,errorThrown){
      console.error("加载url=",url,"脚本出错了!",jqXHR,textStatus,errorThrown);
    }
  });
  
};
ssys.getCss=function(url){
  url=ssys.parseUrl(url);
  //css肯定是承认cache的,要先检查以前是否加载过
  if(ssys.cache[url]){
    return ssys.resolve();
  }
  var d=new $.Deferred();
  try{
    var s=document.createElement('link');
    s.type="text/css";
    s.href=url;
    s.rel="stylesheet";
    d.resolve({});
    document.getElementsByTagName("head")[0].appendChild(s);
    ssys.cache[url]=s;
  }catch(e){
    console.error("[ssys.getCss],error:",e);
    d.reject(e);
  }
  return d;
};
ssys.delay=function(todo,seconds){
  var d=new $.Deferred();
  if(!seconds){
    seconds=todo;
    todo=null;
  }
  var timeoutId=setTimeout(function(){
    if(todo){
      todo();
    }
    d.resolve();
  },seconds*1000);
  d.timeoutId=timeoutId;
  return d;
};
ssys.cancel=function(dfd){
  if(dfd){
    clearTimeout(dfd.timeoutId);
  }
};
ssys.getAnchor=function(){
  return window.location.hash.slice(1);
};
ssys.setAnchor=function(anchor){
  window.location.hash=anchor?"#"+anchor:'';
  if(anchor===''&&history.pushState){
    history.pushState({}, "",window.location.pathname);
  }
};
ssys.getKeys=function(hash){
  var keys=[];
  for(var key in hash)keys.push(key);
  return keys;
};
ssys.shuffle= function(array,isRepeated) {
  var tmp, current, top = array.length;
  if(isRepeated){
    var result=[];
  }
  l=array.length;
  if(top) while(top) {
    current = Math.floor(Math.random() * l);
    top--;
    tmp = array[current];
    array[current] = array[top];
    array[top] = tmp;
    if(isRepeated){
      result.push(tmp);
    }
  }
  return isRepeated?result:array;
};
ssys.aa=function(names,valueList,_){
  _=_||[];
  var nameList=names.split(",");
  for(var i=0,l=nameList.length;i<l;i++){
    var name=nameList[i];
    eval("_."+name+"=valueList["+i+"]");
  }
  return _;
};
/**
 * ssys 为summernote添加的
 */
ssys.summernote={};
ssys.summernote.ssysUploadImage=function(){
  var uploaded_at=ssys.uploaded_at=$.now();
  var options={
    url:ssys.summernote.renderer.options.uploadImageUrl+"?uploaded_at="+uploaded_at,
    dataType: 'json',
    xhrFields: {
      withCredentials: true
    },
    type: 'POST',
    crossDomain: true,
    done:function(e,data){
      ssys.summernote.editor.restoreRange(ssys.summernote.editable);
      var url=ssys.summernote.renderer.options.uploadUrl+ssys.summernote.renderer.options.currentUser.id+"__"+ssys.uploaded_at;
      ssys.summernote.editor.insertImage(ssys.summernote.editable, url);
      ssys.summernote.imageDialog.modal('hide');
    }
  };
  var $imageInput = ssys.summernote.imageDialog.find('.note-image-input');
  $imageInput.attr('name','file');
  $imageInput.fileupload(options);
};
//有的浏览器没有console对象
window.console=window.console||{
  info:function(){
    
  },
  debug:function(){
    
  },
  warn:function(){
    
  },
  error:function(){
    
  },
  log:function(){
    
  }
};
if(!console.debug){
  console.debug=function(){};
}
if(!console.warn){
  console.warn=function(){};
}
if(!console.error){
  console.error=function(){};
}

