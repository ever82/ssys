$$.MockBackend=$$.O.createSubclass({
  mockConfigRules:[
    [/^\/?ssys\/(\w+)\.json/,"$1"],
    [/^\/?(\w+)\/getItemsByAttributes.json/,"getItemsByAttributes"],
    [/^\/?(\w+)\/(\w+)\.json/,"$1_$2"]
  ],  
  get:function(url){
    var mock=this.getRoutedConfig(url,"mock");
    if(!mock){
      var entry=url.split("/")[0];
      if(this[entry]){
        mock=entry;
      }else{
        throw "没有找到可以处理url("+url+")的mock!";
      }
    }
    if(!this[mock]){
      throw "没有找到可以处理url("+url+")的mock!";;
    }
    var result=this[mock](url);
    if(result===undefined||!result.pipe){
      result=$$.resolve(result);
    }
    return result;
  },
  getCurrentUser:function(url){
    return ssys.reject({error:'未登录,当前用户为空,[ssys/getCurrentUser]'});
  },
  getItemsByAttributes:function(url){
    var resourceName=url.match(/^\/?(\w+)\//)[1];
    var params=$$.getParams(url);
    var attris=JSON.parse(params.attris);
    return app.resources[resourceName].findLoadedModelByAttributes(attris,params.limit,params.page,params.returnsum);
  },
  xhrLogin:function(url){
    var matched=url.match(/ssys\/xhrLogin\.json\?loginParams=\["(\w+)","([^"]+)",(true|false|null)\]/);
    var username=matched[1];
    return ["1",username,null,null,null,null,"1434339170","1434340984",1435002068,"1434426369",0,"1"];
  },

},{
  
});