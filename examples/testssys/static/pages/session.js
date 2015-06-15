testssys.addPage("session",{
    style:'',
    defaultState:'me',
    mg_elementConfigs:{
      loginHeader:['Html',['<div class="page-header"><h3>登录<span class="pull-right"><small >还没有判定宝账号?<a href="#user/create">注册</a></small></span></h3></div>'],'login'],
      usernameInput:["StringInput",[{icon:"user",placeholder:"输入邮箱或用户名"}],'login'],
      passwordInput:["PasswordInput",[],'login'],
      rememberInput:['BooleanInput',['下次自动登录'],'login'],
      loginButton:['Button',['onLogin','登录',{type:'primary',size:'bg'}],{location:'login',cssClass:'col-xs-12'}],
      logoutAlert:['Html',['<div class="alert alert-danger">你确定要退出登录吗?</div>'],'logout'],
      confirmLogout:['Button',['confirmLogout','确定',{type:'danger'}],'logout'],
      cancelLogout:['Button',['#p_session','取消'],'logout'],
      oauthPanel:['Html',['<ul class="col-sm-6 pull-right"><li class="">快速通过合作网站帐号登录</li><li class="weibodl"><a rel="nofollow" class="ui-sns-sina" title="新浪微博账号登录" href="${app.baseUrl}ssys/oauth2?provider=weibo"></a><a rel="nofollow" class="ui-sns-qq" title="腾讯微博账号登录" href="/session/connect?provider=tencent&amp;url=http%3A%2F%2Fwww.demohour.com%2F"></a><a rel="nofollow" class="ui-sns-qzone" title="QQ空间账号登录" href="/session/connect?provider=qzone&amp;url=http%3A%2F%2Fwww.demohour.com%2F"></a><a rel="nofollow" class="ui-sns-douban" title="豆瓣账号登录" href="/session/connect?provider=douban&amp;url=http%3A%2F%2Fwww.demohour.com%2F"></a></li></ul>']],
      me:['${mv~user.Me}'],
      login:['Html','<div></div>',{cssClass:'col-xs-10 col-xs-offset-1'}],
      logout:['Html','<div></div>',{cssClass:'col-xs-10 col-xs-offset-1 text-center'}]
    },
    initShow:['topbar'],
    inputConfigs:['username','password','remember'],
    mg_showConfigs:{
      logout:['logout','logoutAlert','confirmLogout','cancelLogout'],
      login:['login','loginHeader','usernameInput','passwordInput','rememberInput','loginButton']
    },
    onLogin:function(){
      var inputData=this.updateInputData();
      var _this=this;
      this.app.currentUser.login(inputData.username,inputData.password,inputData.remember).pipe(function(){
        //_this.app.layout.setState("");
      },function(errors){
        _this.showErrors(errors);
      });
    },
    
    filter_logout:function(state){
      var currentUser=this.app.currentUser;
      if(currentUser.isGuest){
        return ssys.reject('login');
      }
      return state;
    },
    confirmLogout:function(){
      this.app.currentUser.logout();
    }
});