testssys.addTestModule("View",{
  tests:{
    redirectState:function(assert){
      var done = assert.async();
      var layout=testssys.layout;
      testssys.setState("p_testRedirect",{type:'setLayout'}).pipe(function(result){
        assert.equal(layout.state,'p_testRedirect');
        var page=layout.elements['p_testRedirect'];
        page.setState('e1',{type:'test'}).pipe(function(result){
          assert.equal(page.state,'e2');
          page.setState('e3',{type:'test'}).pipe(function(result){
            assert.equal(layout.state,'');
            assert.equal(page.state,'-');
            done();
          });
        });
      });
    },
    setState:function(assert){
      var view=$$.View.Simple.create(testssys.layout,'view1');
      assert.ok(view);
      var done = assert.async();
      view.setState('element1').pipe(function(result){
        assert.equal(view.state,"element1");
        assert.hasElement('testssys__view1__element1');
        assert.showsElement('testssys__view1__element1');
        done();
      });
    },
    createViewClass:function(assert) {
        assert.ok($$.View.Simple.prototype.setState);
        assert.ok($$.View.Simple.Simple1);
        assert.ok($$.View.Simple.Simple2);
    },
    createViewObject:function(assert){
      var view=$$.View.Simple.create(testssys.layout);
      assert.ok(view);
    },
    
  }
});
$$.View.Simple=$$.View.createSubclass({
  elementConfigs:{
    element1:['Html','<div>hi</div>']
  }
},{
  ex_Simple1:{
    content:'c1',
    template:"<div>${content}</div>"
  },
  ex_Simple2:{
    initShow:['element1']
  }
});
