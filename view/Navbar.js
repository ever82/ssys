$$.View.Navbar=$$.View.createSubclass({
    defaultState:'start',
    tag:'nav',
    style:'navbar',
    template:'<div class="container"><div class="navbar-header">${collapseButton}${brand}</div><nav role="navigation" class="${collapsingClass}"><ul class="nav navbar-nav navbar-left"></ul><div class="navbar-form navbar-left"></div><ul class="nav navbar-nav navbar-right"></ul></nav></div>',
    beforeInit:function(links,options){
      this.collapsable=options.collapsable||false;
      this.links=links;
      this.logoSrc=options.logoSrc||'';
      this.brandHref=options.brandHref||'';
      if(options.cssClass){
        this.addClass(options.cssClass);
      }
      if(options.elementConfigs){
        this.elementConfigs=$$.merge($$.clone(options.elementConfigs),this.elementConfigs);
        this.initShow=$$.clone(this.initShow);
        for(var name in options.elementConfigs){
          this.initShow.push(name);
        }
      }
    },
    get_collapseButton:function(){
      if(this.collapsable){
        return '<button data-target=".navbar-collapse" data-toggle="collapse" type="button" class="navbar-toggle"><span class="icon-bar"></span> <span class="icon-bar"></span><span class="icon-bar"></span></button>';
      }
      return '';
    },
    get_collapsingClass:function(){
      return this.collapsable?"collapse navbar-collapse":'';
    },
    get_brand:function(){
      if(this.logoSrc){
        return '<a class="navbar-brand" href="${brandHref}"><img src="${logoSrc}"></a>';
      }else{
        return '';
      }
    },
    afterInit:function(){
      var ul=this.getDom('ul.navbar-left');
      var rightUl=this.getDom('ul.navbar-right');
      for(var i=0,l=this.links.length;i<l;i++){
        var link=this.links[i];
        this.addLink(link,i,ul);
      }
      this.activate(0);
    },
    addLink:function(linkConfig,index,ul){
      var id=this.fullname+"__li"+index;
      ul.innerHTML+='<li id="'+id+'"><a class="ssysLink" data-state="'+linkConfig[0]+'" href="javascript::;">'+linkConfig[1]+'</a></li>';
    },
    activate:function(index,url){
      if(index===null){
        var li=$(this.getDom('a[data-state="'+url+'"]')).parent();
      }else{
        var li=$('#'+this.fullname+'__li'+index);
      }
      var activeLi=this.getDom('li.active');
      if(activeLi){
        $(activeLi).removeClass('active');
      }
      li.addClass('active');
    }
    
});

