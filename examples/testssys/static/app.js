$$.App.createSubclass({
    name:'testssys'
},{
  xp_Page:{
    mg_elementConfigs:{
    }
  },
  xp_Layout:{
    mg_elementConfigs:{
      stage:["Html",['<div class="container"></div>']]
    },
    initShow:['stage'],
    mg_filterConfigRules:[
      [/^user\/create$/,["isGuest"]],
      [/^index|^p_([\w:]+)/,['page']]
    ],
    filter_isGuest:function(state){
      if(this.app.currentUser.id){
        return ssys.reject("index");
      }else{
        return state;
      }
    },
    beforeInitLoads:function(){
      if(this.app.currentUser.id){
        this.initLoads=$$.clone(this.initLoads||{});
        this.initLoads.unreadMessagesCount='message/getUnread.json?returnsum=1';
      }
    },
    beforeInit:function(){
      var _this=this;
      $(window).hashchange(function(){
          var state=_this.getStateByAnchor();
          if(state!=_this.state){
            _this.setState(state);
          }
      });
    },
    afterInit:function(){
    }

  },
  xp_Resource:[{},{
  }]
},"Testssys");
window.testssys=$$.App.Testssys.create();

//ssys.testssys=SsysClient.create("http://dagonglu.sinaapp.com/","testssys","http://pangdingbao.com/sres/apps/testssys/","http://dagonglu-upload.stor.sinaapp.com/");

