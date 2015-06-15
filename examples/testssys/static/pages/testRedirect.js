testssys.addPage("testRedirect",{
  mg_elementConfigs:{
    e1:['Html','<div>e1</div>'],
    e2:['Html','<div>e2</div>'],
  },
  filter_e1:function(state){
    return [this,'e2'];
  },
  filter_e3:function(state){
    return [this.layout,''];
  }
});
