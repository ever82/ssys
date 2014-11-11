$$.View.Paginator=$$.View.createSubclass({
    defaultState:'start',
    tag:'div',
    template:'<ul class="pagination pagination-sm"><span class="pull-right label label-default">共${sum}条</span></ul>',
    beforeInit:function(sum,limit,page,size,hostView){
      this.hostView=hostView||this.parent;
      this.sum=sum||0;
      this.limit=limit||20;
      this.page=page||1;
      this.size=size||7;//显示的页面按钮数目
      this.pages=Math.ceil(sum/this.limit);
    },
    mg_filterConfigRules:[
      [/^\d+$/,['page']]
    ],
    filter_page:function(page){
      this.hostView.onPageChange(page);
      return page;
    },
    afterInit:function(){
      var html="";
      var pages=this.pages;
      var size=this.size;
      if(this.pages<2){
        return;
      }
      if(pages>size){
        var leftPages=Math.floor((this.size-1)/2);
        if(this.page<=leftPages){
          var leftPages=this.page-1;
        }
        var rightPages=this.size-leftPages-1;
        if(this.page+rightPages>pages){
          rightPages=pages-this.page;
          leftPages=this.size-rightPages-1;
        }
        var i=this.page-leftPages;
        if(i!=1){
          html='<li><a id="'+this.fullname+'__first" href="javascript::;" class="ssysLink" name="1">首页</a></li>';
        }
        var l=this.page+rightPages;
        if(l<pages){
          var hasLastPageButton=true;
        }
      }else{
        var l=pages;
        var i=1;
      }
      for(i;i<=l;i++){
        if(i==this.page){
          html=html+'<li class="active"><a id="'+this.fullname+'__page'+i+'" href="javascript::;" class="ssysLink" name="'+i+'">'+i+'</a></li>';
        }else{
          html=html+'<li><a id="'+this.fullname+'__page'+i+'" href="javascript::;" class="ssysLink" name="'+i+'">'+i+'</a></li>';
        }
      }
      if(hasLastPageButton){
        html=html+'<li><a id="'+this.fullname+'__last" href="javascript::;" class="ssysLink" name="'+pages+'">末页</a></li>';
      }
      html=html+'<span class="pull-right label label-default">共'+this.sum+'条</span>';
      this.domnode.innerHTML=html;
    },
    navigate:function(page){
      var _this=this;
      this.page=parseInt(page);
      this.afterInit();
      this.hostView.onPageChange(page);
    }
    
});

