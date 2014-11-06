$$.Resource.CollectionView=$$.View.DataBinding.createSubclass({
  defaultState:'1',
  template:'${head}${body}<ul e="list" class="list-group"></ul><div class="panel-footer"><div e="paginator"></div></div>',
  mg_elementConfigs:{
    refreshButton:['Button',["../refresh/index","刷新列表",{size:"xs"}],{cssClass:"pull-right"}],
    paginator:['Paginator',['${sum}','${limit}']],
    emptyInfo:['Div',[null,'alert alert-info','${emptyInfo}']]
  },
  initLoads:{sum:'${resource.name}/${collectionPath}[]'},
  initShow:['paginator'],
  mg_showConfigRules:[
    [/^(\d+)/,'m__getPageItems']
  ],
  mg_filterConfigRules:[
    [/^(\d+)/,['fetchPageItems']]
  ],
  mg_elementConfigRules:[
    [/^item(\d+)_(\d+)/,['${ItemView}',['$1','$2'],'list']]
  ],
  style:"default",
  renderStyle:function(){
    var cssClass="panel panel-"+this.style;
    $$.addClass(this.domnode,cssClass);
  },
  beforeInit:function(){
    this.getCollection();
    this.sum=this.collection.sum;
    this.limit=this.collection.limit;
  },
  display:function(){
    console.debug(this.fullname,"display");
    this.domnode.style.display="";
    this._currentShow.state=this.state=this.hidingState;
    this.parent._currentShow[this.name]=this._currentShow;
    if(this.dataChanged){
      this.refresh();
    }
    return ssys.resolve(this.state);
  },
  getPageItems:function(page){
    page=parseInt(page);
    var models=this.collection.getModels(page);
    var elementConfigs=[];
    for(var i=0,l=models.length;i<l;i++){
      elementConfigs.push("item"+page+"_"+i);
    }
    return elementConfigs;
  },
  filter_fetchPageItems:function(page){
    return this.collection.fetch(page).pipe(function(){
      return page;
    });
  },
  getCollection:function(){
    if(this.collection){
      return this.collection;
    }
    var path=this.get_collectionPath();
    var collection=this.collection=this.resource.getCollection(path);
    collection.views[this.fullname]=this;
    return  collection;
  },
  get_collectionPath:function(){
    var collectionType=this.collectionType||this.shortClassname;
    if(this.collectionParams){
      return collectionType+JSON.stringify(this.parseConfig(this.collectionParams));
    }else{
      return collectionType;
    }
  },
  addNewModels:function(newModels){
    this.navigate(1);
    if(newModels.length>0){
      var location=[$('#'+this.fullname+'__list'),'prepend'];
      for(var i=0,l=newModels.length;i<l;i++){
        var model=newModels[i];
        var name='modelListView'+model.id;
        var params=[model,this];
        var item=this.modelListViewClass.create(this,name,location,params);
        item.domnode.addClass('list-group-item-success newModelView');
      }
      item.domnode[0].scrollIntoView();
    }
  },
  get_head:function(){
    if(this.noPanelHead){
      return '';
    }
    return '<div class="panel-heading clearfix"><h3 class="panel-title">'+this.parseConfig(this.title||'')+'<div class="menuZone pull-right"></h3></div>';
  },
  get_body:function(){
    if(this.panelContent){
      return '<div class="panel-body">'+this.panelContent+'</div>';
    }
    return '';
  },
  getItemViewClass:function(){
    if(this.shortClassname.match(/^@/)){
      return this.ItemView=this.resource.ModelView.ListItem;
    }
    var classname=this.shortClassname.substring(0, this.shortClassname.length - 1);
    return this.ItemView=ssys.eval(this.itemViewClassName||classname,this.resource.ModelView.ListItem)||this.resource.ModelView.ListItem;
  },
  loadItems:function(items){
    //console.debug("loadItems","items=",items);
    this.clear();
    var offset=(this.page-1)*this.limit;
    var location=$('#'+this.fullname+'__list');
    for(var i=0,l=items.length;i<l;i++){
      var model=items[i];
      model.listIndex=i+offset+1;
      var name='modelListView'+model.id;
      var params=[model,this];
      var item=this.ItemView.create(this,name,params);
    }
    //console.debug("after loadItems","location=",location);
    return ssys.resolve();
  },
  onPageChange:function(pageValue){
    //console.debug("onPageChange","pageValue=",pageValue);
    //delete this.parentView.elements.index;
    this.setState(pageValue);
  },
  clear:function(){
    $("#"+this.fullname+"__list").empty();
  },
  navigate:function(pageValue){
    if(this.elements.paginator){
      this.elements.paginator.navigate(pageValue);
    }
  },
  getDataByPath:function(path){
    return this.resource.getDataByPath(path);
  }
},{
  ex_DataTable:{
    elementConfigs:{
      paginator:['Paginator',['${sum}','${limit}']],
      dataTable:['DataTable',['${columnConfigs}','${options}','${items}','${parent}']]
    },
    indexShow:['dataTable','paginator'],
    beforeInit:function(columnConfigs,options,limit,resource,parentView,sum,items){
      this.columnConfigs=columnConfigs;
      this.parentView=parentView||this.parent;
      this.resource=resource||this.parentView.resource;
      this.sum=sum||this.parentView.sum;
      this.limit=limit||this.parentView.limit||20;
      this.options=options||{};
      this.items=items;
    },
    loadItems:function(items){
      this.elements.dataTable.loadItems(items);
    },
    onPageChange:function(pageValue){
      //delete this.parentView.elements.index;
      this.parentView.setState('index/'+this.limit+'/'+pageValue);
    },
    navigate:function(pageValue){
      if(this.elements.paginator){
        this.elements.paginator.navigate(pageValue);
      }
    }
  }
},"CollectionView");
