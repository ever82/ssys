learnssys.addPage("learnView_p_Scrollspy",{
    mg_elementConfigs:{
      example:['Scrollspy',{
        links:[['#a','A'],['#b','B']],offset:70
      },{cssClass:'navbar-fixed-top'}],
      items:['Loop',{datas:['a','b'],element:['Html','<div><div id="$~{i~}">asdfsdfl<br>asdfsdfl <br>asdfsdfl<br>asdfsdfl<br>asdfsdfl<br>asdfsdfl<br> asdfsdfl<br>asdfsdfl<br>asdfsdf asdfsdf asdfdasf asdfsadfasdfsdfl asdfsdf asdfsdf asdfdasf asdfsadfasdfsdfl asdfsdf asdfsdf asdfdasf asdfsadfasdfsdfl asdfsdf asdfsdf asdfdasf asdfsadfasdfsdfl asdfsdf asdfsdf asdfdasf asdfsadfasdfsdfl asdfsdf asdfsdf asdfdasf asdfsadfasdfsdfl asdfsdf asdfsdf asdfdasf asdfsadfasdfsdfl asdfsdf asdfsdf asdfdasf asdfsadfasdfsdfl asdfsdf asdfsdf asdfdasf asdfsadfasdfsdfl asdfsdf asdfsdf asdfdasf asdfsadfasdfsdfl asdfsdf asdfsdf asdfdasf asdfsadf</div></div>']}]
    },
    initShow:['example','items'],
    initLoads:{
      Scrollspy:'js:$$view/Scrollspy.js'
    },
    afterInit:function(){
      $('body').css({position: "relative"});
      $('#'+this.fullname+'__example').css({top:'35px'});
      $('#'+this.fullname+'__items').css({"padding-top":'70px'});
    }
});
