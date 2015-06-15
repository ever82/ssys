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
ssys.baseUrl="http://ssys.testssys.com/";
testssys.baseUrl="http://app.testssys.com/";
testssys.staticBaseUrl="http://static.testssys.com/";
testssys.storageBaseUrl='http://pdbstorage.testssys.com/';
testssys.init();
