testssys.addTestModule("Input",{
  beforeEach: function( assert ) {
    //testssys.init($('#testbox')[0],'start');
  },
  afterEach: function(assert){
  },
  tests:{
   "StringInput":function(assert) {
     var layout=testssys.layout;
     assert.equal(layout.state,"start");
     var done=assert.async();
     var d=testssys.layout.setState("p_views_p_Input");
     d.pipe(function(result){
       assert.equal(testssys.layout.state,"p_views_p_Input");
       var stringInput=testssys.getViewByName("testssys__p_views_p_Input__stringInput");
       assert.ok(stringInput);
       stringInput.setInputData("a");
       stringInput.updateInputData();
       assert.equal(stringInput.inputData,"a");
       done();
     });
     
   }
  }
});