learnssys.addPage("index",{
    pageHead:'<h3>我们一起来学习ssys吧</h3>',
    mg_elementConfigs:{
      examples:['Loop',{datas:'${exampleLinks}',element:['Link',['"${i~0}"','"${i~1}"'],{wrapper:'<li>{{}}</li>'}],head:'',foot:''}]
    },
    exampleLinks:[['#p_learnView_p_StarRater','学习StarRater'],['#p_learnView_p_Scrollspy','学习Scrollspy']],
    initShow:['pageHeader','examples']
});
