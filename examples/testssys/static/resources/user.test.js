testssys.addTestModule("user",{
  beforeEach: function( assert ) {
    //testssys.init($('#testbox')[0],'start');
  },
  afterEach: function(assert){
  },
  tests:{
    loginUser:function(assert){
      var done=assert.async();
      app.login("user1","a").pipe(function(result){
        assert.equal(layout.state,"");
        assert.equal(app.currentUser.username,"user1");
        done();
      });
    },
    createUser:function(assert) {
      var layout=testssys.layout;
      assert.equal(layout.state,"start");
      var d=testssys.layout.setState("user/create");
      d.pipe(function(result){
        assert.equal(testssys.layout.state,"user/create");
        var emailInput=testssys.getViewByName("testssys__user__create__emailInput");
        var usernameInput=testssys.getViewByName("testssys__user__create__usernameInput");
        var passwordInput=testssys.getViewByName("testssys__user__create__passwordInput");
        assert.ok(testssys.getViewByName("testssys__user__create__emailInput"));
      });
    
    }
  }
});