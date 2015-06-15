pandingbao.addTestModule("kase",{
 beforeEach: function( assert ) {
    assert.ok( true, "one extra assert per test" );
    pandingbao.init($('#testbox')[0]);
 },
 afterEach: function(assert){
   assert.ok( true, "and one extra assert after each test" );
 },
 tests:{
   "createKase":function(assert) {
     var d=pandingbao.layout.setState("kase/create");
     d.pipe(function(result){
       assert.equal(pandingbao.layout.state,"kase/create");
     });
     
   }
 }
});