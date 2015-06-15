$$.App.prototype.get=function(url,params,isData){
  if(params){
    var uncache=params.refresh;
    url=this.getUrl(url,params);
  }else{
    var uncache=false;
    url=this.getUrl(url);
  }
  if(isData){
    var d=$$.xhrget(url);
  }else{
    var d=$$.getJs(url);
  }
  
};
ssys.xhrget=function(url){
  return $$.mockBackend.get(url);
}