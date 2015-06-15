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
  console.debug=console.info;
}
if(!console.warn){
  console.warn=console.log||console.info;
}
if(!console.error){
  console.error=console.info;
}
ssys.baseUrl="http://ssys.pandingbao.com/";
pandingbao.baseUrl="http://app.pandingbao.com/";
pandingbao.staticBaseUrl="http://static.pandingbao.com/";
pandingbao.storageBaseUrl='http://pdbstorage.pandingbao.com/';
pandingbao.init();
