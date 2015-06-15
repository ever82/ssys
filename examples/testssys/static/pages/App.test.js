testssys.addTestModule("App",{
  beforeEach: function( assert ) {
    //testssys.init($('#testbox')[0],'start');
  },
  afterEach: function(assert){
  },
  tests:{
    testPage:function(assert){
      var done = assert.async();
      testssys.setState("p_testPage").pipe(function(result){
        assert.equal(testssys.layout.state,"p_testPage");
        done();
      });
    },
    testPage2:function(assert){
      var done = assert.async();
      testssys.setState("p_testpage_p_testPage").pipe(function(result){
        assert.equal(testssys.layout.state,"p_testpage_p_testPage");
        done();
      });
    },
    testPage3:function(assert){
      var done = assert.async();
      testssys.setState("p_testpage_p_testpage_p_testPage").pipe(function(result){
        assert.equal(testssys.layout.state,"p_testpage_p_testpage_p_testPage");
        done();
      });
    }
    
  }
});