ssys.pandingbao.resources.rate=(function(){
    var rate=SsysResource.create("rate",ssys.pandingbao);
    rate.createModelClass({
      attris:['id','ratetype','object_id','walue','reason','creator_id','creator_username','created_at','updated_at'],
      validationRules:{
        content:['String',null,null,260]
      },
      mg_editableConfigs:{
        uneditable:['id','created_at','object_id','ratetype','creator_id','creator_username','updated_at']
      }
    },{
      creationParams:['walue','object_id','ratetype','reason'] 
    });
    return rate;
})();
