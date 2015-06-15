$$.View.Scrollspy=$$.View.createSubclass({
    template:'<nav class="scrollspy-target navbar navbar-default "><div class="container">${e~tablist}</div></nav>',
    mg_elementConfigs:{
      tablist:['Loop',{tag:'ul',datas:'${options.links}',element:['Link',['javascript:;','$~{i~1}',{useHref:true,data:{target:'$~{i~0}'}}],{wrapper:'<li>{{}}</li>',location:'#${fullname}__tablist'}]},{cssClass:'nav navbar-nav navbar-left'}]
    },
    initShow:['tablist'],
    beforeInit:function(options){
      this.options=options||{};
      this.offset=this.options.offset||0;
    },
    afterInit:function(){
      //this.find('.scrollspy-target').css({position:'fixed'});
      $('body').css({position:'relative'});
      $('body').scrollspy({ target: '.scrollspy-target' });
      var _this=this;
      $(this.domnode).on('click','.nav li>a',function(){
        var target=$(this).data('target');
        var link=$(this);
        $('html, body').animate({scrollTop:$(target).offset().top-_this.offset},{complete:function(){
          $('body').scrollspy('clear');
          link.parent().addClass('active');
        }});
        
      });
    }
});
