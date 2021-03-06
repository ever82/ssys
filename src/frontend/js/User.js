$$.User=$$.O.createSubclass({
    isAdmin:function(){
      return this.userModel&&this.userModel.role&&this.userModel.role.match(/admin/);
    },
    getCurrentUser:function(){
      var _this=this;
      return this.app.get("ssys/getCurrentUser",{refresh:$.now()}).pipe(function(tuple){
          //_this.userModel.pull(tuple);
          _this.userModel=_this.app.resources.user.getModelByTuple(tuple);
          _this.storageUser();
          return _this.userModel;
      });
    },
    login:function(username,password,remember,norefresh){
      var app=this.app;
      return this.loginDfd=app.resources.user.getModelByUrl("/ssys/xhrLogin",{'loginParams': [username,password,remember||null]})
      .pipe(function(model){
          //alert('in login,before 1');
          localStorage.clear();
        return app.currentUser.loginByUserModel(model,remember,norefresh);
      },function(errorCode){
        if(errorCode==2){
          var errors={'password':'密码错误'};
        }else if(errorCode==1){
          var errors={'username':'您输入的用户名尚未注册'};
        }else if(errorCode=="wrongEmail"){
          var errors={'username':'该邮箱尚未注册'};
        }
        return errors;
      });
    },
    loginByUserModel:function(userModel,remember,norefresh){
      this.userModel=userModel;
      userModel.userRelation="me";
      this.id=userModel.id;
      this.username=userModel.username;
      this.remember=remember;
      this.storageUser();
      if(this.app.layout&&!norefresh){
        //console.debug(this.app.count++,"before onLogin");
        return this.app.layout.onLogin();
      }
    },
    storageUser:function(){
      var expires_at=this.remember?$.now()+this.app.rememberFor:null;
      $$.setStorage('userTuple',this.userModel.tuple,expires_at);
      //alert(JSON.stringify($$.getStorage('userTuple')));
    },
    logout:function(){
      var _this=this;
      return this.logoutDfd=this.app.get("ssys/logout").always(function(){
        //alert('in logout,before2');
        localStorage.clear();
        sessionStorage.clear();
        _this.id=null;
        _this.username=null;
        _this.userModel=null;
        if(_this.app.layout){
          _this.app.layout.onLogout();
        }
      });
    }
    /*_getCurrentUserByScenterIdentity:function(scenterIdentity){
      var _this=this;
      return this.app.get("ssys/getCurrentUserByScenterIdentity",{SsysPass:scenterIdentity},true,'jsonp')
      .pipe(function(tuple){
          return _this._getUserModelByTuple(tuple);
      });
    },
    _getUserModelByTuple:function(tuple){
      var _this=this;
      return this.app.getResource("user").pipe(function(userResource){
        var model=userResource.getModelByTuple(tuple);
        return model;
      });
    },
    autoLogin:function(){
      var _this=this;
      if(this.loginDefer){
        return this.loginDefer;
      }
      return this.loginDefer=this.getCurrentUser().pipe(function(user){
          //console.info("自动登录成功,当前user=",user,"[$$.User.autoLogin]");
          return _this.loginByUserModel(user);
      },function(){
        //console.info("自动登录失败","[$$.User.autoLogin]");
        _this.isGuest=true;
        _this.isLoggingIn=false;
        return ssys.resolve();
      });
    },*/
  },{
    create:function(app){
      var o=new this();
      o.app=app;
      var tuple=$$.getStorage('userTuple');
      if(tuple){
        var user=app.resources.user.getModelByTuple(tuple);
        o.loginByUserModel(user);
        //验证后端登录情况是否跟它一致, 不一致就以后端为准
        o.getCurrentUser().pipe(function(user1){
          if(user.id!=user1.id||user.username!=user1.username){
            console.warn('前后端登陆的user不一致, 以后端为准',"前端登陆的username=",user.username,"后端登陆的username=",user1.username);
            o.loginByUserModel(user1);
          }
        },function(){
          o.logout();
        });
      }else{
        o.getCurrentUser().pipe(function(user){
          o.loginByUserModel(user);
        });
      }
      return o;
    }
},"User");