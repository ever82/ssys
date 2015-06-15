$$.MockBackend=$$.O.createSubclass({
  mockConfigRules:[
    [/^ssys\/(\w+)\.json/,"$1"]
  ],  
  get:function(url){
    var mock=this.getRoutedConfig(url,"mock");
    if(!mock){
      var entry=url.split("/")[0];
      if(this[entry]){
        mock=entry;
      }
    }
    return this[mock](url);
  },
  xhrlogin:function(url){
    
  },

},{
  
});