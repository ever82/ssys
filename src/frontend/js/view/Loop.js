$$.View["Loop"]=$$.View.createSubclass({
    elementConfigRules:[
      [/^item(\d+)$/,'${element}']//这个element是一个elementConfig, 比如['Link',['${datas.$1.bar}','${datas.$1.foo}']]
    ],
    /**
     * 它会将 ${i~a.b} 转化成
     */
    parse_i:function(path,matched0){
      return '"${datas.'+matched0[1]+(path?'.'+path:'')+'}"';
    },
    beforeInit:function(options){
      this.options=options;
      this.datas=options.datas;
      this.initShow=[];
      if(options.head){
        this.initShow.push(options.head);
      }
      this.element=options.element;
      this.initShow=$$.clone(this.initShow);
      for(var i=0,l=this.datas.length;i<l;i++){
        var data=this.datas[i];
        this.initShow.push('item'+i);
      }
      if(options.foot){
        this.initShow.push(options.foot);
      }
    }
})
