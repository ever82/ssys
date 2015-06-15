pandingbao.addPage("error",{
    pageHead:'<h3>出错了!</h3>',
    mg_elementConfigs:{
      errorMessage:['Html','<div class="alert alert-danger" role="alert">${error}</div>']
    },
    mg_filterConfigRules:[
      [/.*/,['getError']]
    ],
    filter_getError:function(state){
      var matched;
      if(matched=state.match(/^(index)/)){
        this.error="默认首页是static/pages/index.js, 请检查该文件是否存在.";
      }else if(matched=state.match(/^p_(\w)+/)){
        this.error="找不到名为"+matched[1]+"的页面!请检查/static/pages/"+matched[1]+".js 文件是否存在.";
      }else{
        this.error="无法识别url:"+state+"!请检查url是否正确.";
      }
    },
    initShow:['pageHeader','@errorMessage']
});
