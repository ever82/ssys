$$.View.Navbar=$$.View.createSubclass({
    defaultState:'start',
    tag:'nav',
    style:'navbar',
    template:'<div class="container"><div class="navbar-header">${collapseButton}${brand}</div><nav role="navigation" class="${collapsingClass}"><ul class="nav navbar-nav navbar-left"></ul><ul class="nav navbar-nav navbar-right"></ul><div class="navbar-form navbar-middle "><div class="navbar-title">${title}</div></div></nav></div>',
    beforeInit:function(options){
      this.collapsable=options.collapsable||false;
      this.selectable=options.selectable===undefined?true:options.selectable;
      this.links=options.links;
      this.rightLinks=options.rightLinks;
      this.logoSrc=options.logoSrc||'';
      this.brandHref=options.brandHref||'';
      this.brandLabel=options.brandLabel||'';
      this.title=options.title||'';
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
        return '<a class="navbar-brand" href="${brandHref}">${brandLabel}<img src="${logoSrc}"></a>';
      }else{
        return '';
      }
    },
    afterInit:function(){
      var i=0;
      if(this.links){
        var ul=this.getDom('ul.navbar-left');
        for(var l=this.links.length;i<l;i++){
          var link=this.links[i];
          this.addLink(link,i,ul);
        }
      }
      if(this.rightLinks){
        var ul=this.getDom('ul.navbar-right');
        for(var j=0,l=this.rightLinks.length;j<l;j++){
          var link=this.rightLinks[j];
          this.addLink(link,i+j,ul);
        }
      }
      
      if(this.selectable){
        this.activate(0);
      }
      
    },
    addLink:function(linkConfig,index,ul){
      var id=this.fullname+"__li"+index;
      ul.innerHTML+='<li id="'+id+'"><a class="ssysLink" id="'+this.parent.fullname+"__link"+index+'" data-state="'+linkConfig[0]+'" data-warning="'+(linkConfig[2]||'')+'" href="javascript::;">'+linkConfig[1]+'</a></li>';
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

