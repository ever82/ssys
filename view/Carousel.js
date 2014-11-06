$$.View.Carousel=$$.View.createSubclass({
    affectParent:false,
    style:'carousel slide',
    template:'<ol class="carousel-indicators"></ol><div class="carousel-inner"></div><a class="left carousel-control" href="#${fullname}" data-slide="prev"><span class="fa fa-chevron-left"></span></a><a class="right carousel-control" href="#${fullname}" data-slide="next"><span class="fa fa-chevron-right"></span></a>',
    afterInit:function(items){
      $(this.domnode).attr("data-ride","carousel");
      var indicators=$(this.domnode).find(">.carousel-indicators");
      var inner=$(this.domnode).find(">.carousel-inner");
      for(var i=0,l=items.length;i<l;i++){
        var item=items[i];
        if(i==0){
          indicators.append('<li data-target="#'+this.fullname+'" data-slide-to="0" class="active"></li>');
          inner.append('<div class="item active"><a href="'+item.href+'"><img src="'+item.src+'" alt="'+(item.alt||'')+'"><div class="carousel-caption"><h3>'+item.caption+'</h3></div></a></div>');
        }else{
          indicators.append('<li data-target="#'+this.fullname+'" data-slide-to="'+i+'"></li>');
          inner.append('<div class="item"><a href="'+item.href+'"><img src="'+item.src+'" alt="'+(item.alt||'')+'"><div class="carousel-caption"><h3>'+item.caption+'</h3></div></a></div>');
        }
      }
      $(this.domnode).carousel();
    }
});

