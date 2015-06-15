$$.App.prototype.test=function(){
  var modules=$$.toArray(this.testModules);
  window.app=this;
  var testModule=function(){
    if(modules.length>0){
      var module=modules.shift();
      var name=module[0];
      module=module[1];
      var tests=$$.toArray(module.tests);
      var beforeEach=function(assert){
        localStorage.clear();
        sessionStorage.clear();
        app.init($('#testbox')[0],'start');
        window.layout=app.layout;
        if(module.beforeEach){
          module.beforeEach(assert);
        }
      };
      var afterEach=function(assert){
        if(module.afterEach){
          module.afterEach(assert);
        }
        if(tests.length>0){
          var test=tests.shift();
          QUnit.test(test[0], test[1]);
        }else{
          testModule();
        }
      };
      QUnit.module(name, {
        beforeEach: beforeEach,
        afterEach: afterEach
      });
      //QUnit.testDone(runTest);
      if(tests.length>0){
        var test=tests.shift();
        QUnit.test(test[0], test[1]);
      }else{
        testModule();
      }
    }
  };
  testModule();
  /*for(var name in this.testModules){
    var module=this.testModules[name];
    QUnit.module(name, {
      beforeEach: module.beforeEach,
      afterEach: module.afterEach
    });
    $$.loopDefer(module.tests,null,function(test){
      return QUnit.test(test[0], test[1]);
    });
  }*/
};
$$.App.create=function(){
  var o=new this();
  o.pages={};                   
  o.resources={};
  o.dataBindings={};
  o.testModules={};
  //console.info("成功创建了app("+name+")!","[$$.App.create]");
  return o;
};
$$.App.prototype.login=function(username,password){
  username=username||'user1';
  password=password||'a';
  return this.currentUser.login(username,password,0);
};
$$.App.prototype.logout=function(){
  return this.currentUser.logout();
};
QUnit.assert.hasElement=function(elementFullName){
  var dom=$('#'+elementFullName);
  this.push(dom[0],dom[0],true);  
};
QUnit.assert.showsElement=function(elementFullName){
  var dom=$('#'+elementFullName);
  var result=dom&&dom.is(':visible');
  this.push(result,result,true);
};
QUnit.assert.contains = function( needle, haystack, message ) {
  var actual = haystack.indexOf(needle) > -1;
  this.push(actual, actual, needle, message);
};
