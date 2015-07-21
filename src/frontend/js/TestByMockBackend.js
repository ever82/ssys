$$.App.prototype.get=function(url,params){
  console.debug("app.get","url,params=",url,params);
  if(params){
    var uncache=params.refresh;
    url=this.getUrl(url,params);
  }else{
    var uncache=false;
    url=this.getUrl(url);
  }
  return $$.xhrget(url);
  
};
ssys.xhrget=function(url){
  return $$.mockBackend.get(url);
}