$$.User=$$.O.createSubclass({
    isAdmin:function(){
      return this.userModel&&this.userModel.role&&this.userModel.role.match(/admin/);
    },
    getCurrentUser:function(){
      var _this=this;
      return this.app.get("ssys/getCurrentUser",{refresh:$.now()}).pipe(function(tuple){
          return _this.app.resources.user.getModelByTuple(tuple);
      });
    },
    login:function(username,password,remember){
      var app=this.app;
      return app.resources.user.getModelByUrl("/ssys/xhrLogin",{'loginParams': [username,password,remember||null]})
      .pipe(function(model){
          localStorage.clear();
        return app.currentUser.loginByUserModel(model,remember);
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
    loginByUserModel:function(userModel,remember){
      this.userModel=userModel;
      userModel.userRelation="me";
      this.id=userModel.id;
      this.username=userModel.username;
      var expires_at=remember?$.now()+this.app.rememberFor:null;
      $$.setStorage('userTuple',userModel.tuple,expires_at);
      if(this.app.layout){
        this.app.layout.onLogin();
      }
    },
    logout:function(){
      var _this=this;
      this.app.get("ssys/logout").always(function(){
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
            o.loginByUserModel(user1);
          }
        },function(){
          o.logout();
        });
      }
      return o;
    }
},"User");