pandingbao.addTestModule("user",{
  beforeEach: function( assert ) {
    pandingbao.init($('#testbox')[0],'start');
  },
  afterEach: function(assert){
  },
  tests:{
   "createUser":function(assert) {
     var layout=pandingbao.layout;
     assert.equal(layout.state,"start");
     var d=pandingbao.layout.setState("user/create");
     d.pipe(function(result){
       assert.equal(pandingbao.layout.state,"user/create");
       
     });
     
   }
  }
});